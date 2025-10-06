"use client";
import React, { useEffect, useRef, useMemo, useState } from "react";
import { AvailableSlot } from "@/lib/slotGeneration";

type Props = {
  slots: AvailableSlot[];
  selected?: string | null;
  onSelect: (time: string) => void;
  cols?: number;
};

export default function SlotGrid({
  slots,
  selected,
  onSelect,
  cols = 9,
}: Props) {
  const gridRef = useRef<HTMLDivElement | null>(null);

  // logical columns used for keyboard movement
  const actualCols = Math.max(1, Math.min(cols, slots.length || 1));

  // pagination: show up to PAGE_SIZE slots per page
  const PAGE_SIZE = 80;
  const totalPages = Math.max(1, Math.ceil(slots.length / PAGE_SIZE));
  const [page, setPage] = useState(1);
  // ensure page is within bounds when slots change
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageSlots = slots.slice(pageStart, pageStart + PAGE_SIZE);

  // first available slot in current page for initial focus
  const firstAvailable = useMemo(
    () => pageSlots.find((s) => s.available)?.time ?? null,
    [pageSlots]
  );

  // if selected belongs to another page, switch to that page
  useEffect(() => {
    if (!selected) return;
    const idx = slots.findIndex((s) => s.time === selected);
    if (idx === -1) return;
    const selPage = Math.floor(idx / PAGE_SIZE) + 1;
    if (selPage !== page) setPage(selPage);
  }, [selected, slots, page]);

  // focus selected or first available when changed
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const target = selected ?? firstAvailable;
    if (!target) return;
    const btn = root.querySelector<HTMLButtonElement>(
      `button[data-time="${target}"]`
    );
    if (btn) btn.focus();
  }, [selected, firstAvailable, page]);

  function getTabIndex(time: string, index: number) {
    if (selected) return selected === time ? 0 : -1;
    if (!selected && firstAvailable) return firstAvailable === time ? 0 : -1;
    return index === 0 ? 0 : -1;
  }

  function focusEnabledButtonAt(root: HTMLDivElement, idx: number) {
    const enabled = Array.from(
      root.querySelectorAll<HTMLButtonElement>(
        "button[data-time]:not([disabled])"
      )
    );
    const clamped = Math.max(0, Math.min(enabled.length - 1, idx));
    const btn = enabled[clamped];
    if (btn) btn.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const root = gridRef.current;
    if (!root) return;
    const active = document.activeElement as HTMLElement | null;
    if (!active || active.tagName !== "BUTTON") return;

    const enabledButtons = Array.from(
      root.querySelectorAll<HTMLButtonElement>(
        "button[data-time]:not([disabled])"
      )
    );
    const idx = enabledButtons.indexOf(active as HTMLButtonElement);
    if (idx === -1) return;

    let next = idx;

    switch (e.key) {
      case "ArrowRight":
        next = Math.min(enabledButtons.length - 1, idx + 1);
        break;
      case "ArrowLeft":
        next = Math.max(0, idx - 1);
        break;
      case "ArrowDown":
        next = Math.min(enabledButtons.length - 1, idx + actualCols);
        break;
      case "ArrowUp":
        next = Math.max(0, idx - actualCols);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = enabledButtons.length - 1;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        const t = active.getAttribute("data-time");
        if (t) onSelect(t);
        return;
      default:
        return;
    }

    e.preventDefault();
    focusEnabledButtonAt(root, next);
  }

  return (
    <>
      <div
        ref={gridRef}
        role="grid"
        aria-label={`Available slots (page ${page} of ${totalPages})`}
        onKeyDown={handleKeyDown}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(60px, 1fr))`,
          gap: 8,
        }}
      >
        {pageSlots.map((s, i) => {
          const isSelected = selected === s.time;
          const tabIndex = getTabIndex(s.time, i);
          return (
            <button
              key={s.time}
              data-time={s.time}
              role="gridcell"
              aria-selected={isSelected}
              disabled={!s.available}
              tabIndex={tabIndex}
              onClick={() => s.available && onSelect(s.time)}
              className={`py-2 px-3 rounded-md text-sm w-full text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
                s.available
                  ? isSelected
                    ? "bg-feedback-info text-white cursor-pointer"
                    : "bg-primary text-white hover:bg-green-600 cursor-pointer"
                  : "bg-text-secondary text-text-inverse opacity-80"
              }`}
            >
              <div className="font-medium">{s.time}</div>
              {/* <div className="text-xs opacity-80">
              {s.available ? "disponível" : "ocupado"}
            </div> */}
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Prev
          </button>
          <div className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </div>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
