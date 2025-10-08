declare module "@dnd-kit/core" {
  import * as React from "react";

  export const DndContext: React.ComponentType<{
    children?: React.ReactNode;
    // Use unknown for event payloads from the library and let consumers narrow as needed
    onDragEnd?: (event: unknown) => void;
    onDragStart?: (event: unknown) => void;
    onDragOver?: (event: unknown) => void;
    onDragCancel?: (event: unknown) => void;
  }>;

  export function useDraggable(options: Record<string, unknown> | undefined): {
    // attributes and listeners are implementation-specific objects - expose as generic maps
    attributes: Record<string, unknown>;
    listeners: Record<string, unknown>;
    setNodeRef: (el: HTMLElement | null) => void;
    transform?: { x: number; y: number } | null;
    isDragging?: boolean;
  };

  export function useDroppable(options: Record<string, unknown> | undefined): {
    setNodeRef: (el: HTMLElement | null) => void;
    isOver?: boolean;
  };

  export const DragOverlay: React.ComponentType<{ children?: React.ReactNode }>;
}
