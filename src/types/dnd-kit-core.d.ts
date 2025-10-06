declare module "@dnd-kit/core" {
  import * as React from "react";

  export const DndContext: React.ComponentType<{
    children?: React.ReactNode;
    onDragEnd?: (event: any) => void;
    onDragStart?: (event: any) => void;
    onDragOver?: (event: any) => void;
    onDragCancel?: (event: any) => void;
  }>;

  export function useDraggable(options: any): {
    attributes: any;
    listeners: any;
    setNodeRef: (el: HTMLElement | null) => void;
    transform?: { x: number; y: number } | null;
    isDragging?: boolean;
  };

  export function useDroppable(options: any): {
    setNodeRef: (el: HTMLElement | null) => void;
    isOver?: boolean;
  };

  export const DragOverlay: React.ComponentType<{ children?: React.ReactNode }>;
}
