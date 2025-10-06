"use client";
import React, { useRef, useEffect, useState } from "react";
import styles from "./SlotCanvas.module.css";
import { AvailableSlot } from "@/lib/slotGeneration";

type Props = {
  slots: AvailableSlot[];
  selected?: string | null;
  onSelect: (time: string) => void;
  width?: number; // px
  height?: number; // px
};

const PADDING = 8;

export default function SlotCanvas({
  slots,
  selected,
  onSelect,
  width = 720,
  height = 120,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // compute layout
  const cols = Math.min(slots.length, 8);
  const rows = Math.ceil(slots.length / cols) || 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr =
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    // make canvas responsive to wrapper width to avoid overflow/layout issues
    const wrapper = canvas.parentElement;
    const wrapperRect = wrapper?.getBoundingClientRect();
    const actualWidth = wrapperRect?.width ?? width;
    canvas.width = Math.floor(actualWidth * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${actualWidth}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    // clear
    ctx.clearRect(0, 0, width, height);

    const cellW = (canvas.width / dpr - PADDING * 2) / cols;
    const cellH = (height - PADDING * 2) / rows;

    slots.forEach((s, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = PADDING + col * cellW;
      const y = PADDING + row * cellH;
      const isSelected = selected === s.time;
      const isHover = hoverIndex === i;

      // background
      ctx.fillStyle = s.available
        ? isSelected
          ? "#2563eb"
          : "#10b981"
        : "#f97316";
      if (isHover && s.available) ctx.fillStyle = "#0369a1";
      // round rect
      const r = Math.min(8, cellH / 4, cellW / 8);
      roundRect(ctx, x + 6, y + 6, cellW - 12, cellH - 12, r, true, false);

      // text
      ctx.fillStyle = "#fff";
      ctx.font = `${Math.min(14, cellH / 3)}px Inter, Arial`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(s.time, x + cellW / 2, y + cellH / 2);
    });
  }, [slots, selected, hoverIndex, width, height, cols, rows]);

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: boolean,
    stroke: boolean
  ) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function handlePointerMove(e: React.PointerEvent) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const cellW = (width - PADDING * 2) / cols;
    const cellH = (height - PADDING * 2) / rows;
    const col = Math.floor((px - PADDING) / cellW);
    const row = Math.floor((py - PADDING) / cellH);
    const idx = row * cols + col;
    if (idx >= 0 && idx < slots.length) setHoverIndex(idx);
    else setHoverIndex(null);
  }

  function handlePointerLeave() {
    setHoverIndex(null);
  }

  function handleClick() {
    if (hoverIndex == null) return;
    const s = slots[hoverIndex];
    if (!s.available) return;
    onSelect(s.time);
  }

  return (
    <div className={styles.container}>
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onClick={handleClick}
          role="listbox"
          aria-label="Available slots"
        />
      </div>
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.colorBox} style={{ background: "#10b981" }} />{" "}
          Disponível
        </div>
        <div className={styles.legendItem}>
          <span className={styles.colorBox} style={{ background: "#f97316" }} />{" "}
          Ocupado
        </div>
        <div className={styles.legendItem}>
          <span className={styles.colorBox} style={{ background: "#2563eb" }} />{" "}
          Selecionado
        </div>
      </div>
      {/* accessible fallback list */}
      <div className={styles.slotListFallback}>
        {slots.map((s) => (
          <button
            key={s.time}
            className={styles.slotButton}
            onClick={() => s.available && onSelect(s.time)}
            disabled={!s.available}
            aria-pressed={selected === s.time}
          >
            {s.time} {s.available ? "— disponível" : "— ocupado"}
          </button>
        ))}
      </div>
    </div>
  );
}
