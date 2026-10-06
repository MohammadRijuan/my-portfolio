'use client';
import { RefObject, useEffect, useRef } from 'react';

const WHEEL_MIN_DELTA = 6;
const WHEEL_IDLE_MS = 250;
const SWIPE_MIN_PX = 70;

type Edge = { atStart: boolean; atEnd: boolean };

/**
 * Wheel, touch and keyboard handling for the Pager.
 * A page scrolls internally first; only when its start/end is reached does the next gesture switch pages.
 * `switchLockedUntil` is a timestamp until which new page switches are ignored (set by the Pager while it animates).
 */
export function usePagerInput(options: {
  containerRef: RefObject<HTMLDivElement>;
  index: number;
  switchLockedUntil: RefObject<number>;
  goToPage: (requestedIndex: number) => void;
}) {
  const { containerRef, index, switchLockedUntil, goToPage } = options;
  const lastWheelAt = useRef(0);
  const touchStartRef = useRef({ startX: 0, startY: 0, atStart: false, atEnd: false });

  /** Is the active page's inner scroller at its top / bottom? */
  const getScrollEdges = (): Edge => {
    const activeScroller = containerRef.current?.querySelector<HTMLElement>(`[data-page="${index}"] [data-scroller]`);
    return {
      atStart: !activeScroller || activeScroller.scrollTop <= 1,
      atEnd: !activeScroller || activeScroller.scrollTop + activeScroller.clientHeight >= activeScroller.scrollHeight - 2,
    };
  };

  const onWheel = (event: React.WheelEvent) => {
    if (Math.abs(event.deltaY) < WHEEL_MIN_DELTA) return;
    const now = Date.now();
    const idle = now - lastWheelAt.current > WHEEL_IDLE_MS;
    lastWheelAt.current = now;
    if (now < switchLockedUntil.current! || !idle) return;

    const { atStart, atEnd } = getScrollEdges();
    if (event.deltaY > 0 && atEnd) goToPage(index + 1);
    else if (event.deltaY < 0 && atStart) goToPage(index - 1);
  };

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartRef.current = { startX: event.touches[0].clientX, startY: event.touches[0].clientY, ...getScrollEdges() };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartRef.current;
    const swipeX = start.startX - event.changedTouches[0].clientX;
    const swipeY = start.startY - event.changedTouches[0].clientY;
    if (Date.now() < switchLockedUntil.current!) return;

    if (Math.abs(swipeX) > SWIPE_MIN_PX && Math.abs(swipeX) > Math.abs(swipeY) * 1.3) {
      goToPage(index + (swipeX > 0 ? 1 : -1));
    } else if (Math.abs(swipeY) > SWIPE_MIN_PX && Math.abs(swipeY) > Math.abs(swipeX)) {
      if (swipeY > 0 && start.atEnd) goToPage(index + 1);
      else if (swipeY < 0 && start.atStart) goToPage(index - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest('input,textarea,select')) return;
      if (event.key === 'ArrowRight') goToPage(index + 1);
      if (event.key === 'ArrowLeft') goToPage(index - 1);
    };
    addEventListener('keydown', handleKeyDown);
    return () => removeEventListener('keydown', handleKeyDown);
  });

  return { getScrollEdges, onWheel, onTouchStart, onTouchEnd };
}
