import { useLayoutEffect, useState } from "react";

export function useToolbarPosition(
  selectionRect: DOMRect | null,
  toolbarRef: React.RefObject<HTMLDivElement | null>,
  isDesktop: boolean,
) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!selectionRect || !toolbarRef.current) return;

    const toolbarWidth = toolbarRef.current.offsetWidth;
    const toolbarHeight = toolbarRef.current.offsetHeight;

    let top: number;
    let left: number;

    if (!isDesktop) {
      left = selectionRect.left + selectionRect.width / 2 - toolbarWidth / 2;
      top = selectionRect.bottom + 8;
    } else {
      left = selectionRect.left + selectionRect.width / 2 - toolbarWidth / 2;
      top = selectionRect.top - toolbarHeight - 8;
    }

    setPos({ top, left });
  }, [isDesktop, selectionRect, toolbarRef]);

  return pos;
}
