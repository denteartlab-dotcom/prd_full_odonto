"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

function loadPosition(storageKey: string): Point | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Point;
    if (typeof parsed.x !== "number" || typeof parsed.y !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function savePosition(storageKey: string, point: Point) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(point));
  } catch {
    /* ignore */
  }
}

function defaultPosition(panelWidth = 320, panelHeight = 140): Point {
  if (typeof window === "undefined") return { x: 24, y: 24 };
  return {
    x: 24,
    y: Math.max(24, window.innerHeight - panelHeight - 120),
  };
}

function clampPosition(
  point: Point,
  panelWidth: number,
  panelHeight: number
): Point {
  if (typeof window === "undefined") return point;
  const maxX = Math.max(8, window.innerWidth - panelWidth - 8);
  const maxY = Math.max(8, window.innerHeight - panelHeight - 8);
  return {
    x: Math.min(Math.max(8, point.x), maxX),
    y: Math.min(Math.max(8, point.y), maxY),
  };
}

export function useDraggablePanel(
  storageKey: string,
  options?: { width?: number; height?: number; enabled?: boolean }
) {
  const width = options?.width ?? 320;
  const height = options?.height ?? 140;
  const enabled = options?.enabled ?? true;
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState<Point>({ x: 24, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadPosition(storageKey);
    setPosition(clampPosition(stored ?? defaultPosition(width, height), width, height));
    setReady(true);
  }, [storageKey, width, height]);

  useEffect(() => {
    if (!ready) return;
    savePosition(storageKey, position);
  }, [position, storageKey, ready]);

  useEffect(() => {
    function onResize() {
      setPosition((prev) => clampPosition(prev, width, height));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [width, height]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!enabled || e.button !== 0) return;
    e.preventDefault();
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [enabled]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled || !isDragging) return;
      setPosition(
        clampPosition(
          {
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y,
          },
          width,
          height
        )
      );
    },
    [enabled, isDragging, width, height]
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  return {
    panelRef,
    position,
    isDragging,
    dragHandleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
    style: {
      left: position.x,
      top: position.y,
      width,
    } as React.CSSProperties,
  };
}
