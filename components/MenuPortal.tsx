"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ButtonLike = { current?: HTMLElement | null } | HTMLElement | null;

interface MenuPortalProps {
  children: React.ReactNode;
  buttonRef: ButtonLike;
  isOpen: boolean;
  sidebarSelector?: string;
  gap?: number; // spacing between button and menu
  preferRight?: boolean; // if false, prefer left flip first
}

export const MenuPortal = ({
  children,
  buttonRef,
  isOpen,
  sidebarSelector = ".sidebar-container",
  gap = 8,
  preferRight = true,
}: MenuPortalProps) => {
  const [root, setRoot] = useState<Element | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number; placement: "right" | "left" }>({
    top: 0,
    left: 0,
    placement: "right",
  });

  // helper to get raw HTMLElement whether ref object or element or null
  const getButtonEl = (): HTMLElement | null => {
    if (!buttonRef) return null;
    if (typeof buttonRef === "object" && "current" in buttonRef) return buttonRef.current ?? null;
    // @ts-ignore
    return buttonRef as HTMLElement | null;
  };

  // find sidebar root once
  useEffect(() => {
    const el = document.querySelector(sidebarSelector);
    setRoot(el);
  }, [sidebarSelector]);

  // position updater (works both when portal inside sidebarRoot or when attached to body)
  useEffect(() => {
    if (!isOpen) return;

    let raf = 0;
    let mounted = true;

    const update = () => {
      if (!mounted) return;
      const btn = getButtonEl();
      if (!btn) return;

      const btnRect = btn.getBoundingClientRect();
      const sidebarEl = root;
      const menuFitsRight = (menuWidth = 220) => {
        // conservative guess; will be verified by measuring later if needed
        const viewportRight = window.innerWidth;
        return btnRect.right + gap + menuWidth <= viewportRight;
      };

      if (sidebarEl) {
        // Compute coordinates relative to the sidebar root (so portal can be appended inside it and not clipped)
        const sidebarRect = sidebarEl.getBoundingClientRect();
        // Try to place below the button, to the right by default
        const defaultLeft = btnRect.right - sidebarRect.left + gap;
        const defaultTop = btnRect.top - sidebarRect.top - 4;

        // simple flip decision based on viewport space (try to open to right, otherwise left)
        const placement: "right" | "left" = preferRight ? (menuFitsRight() ? "right" : "left") : (menuFitsRight() ? "left" : "right");
        const left = placement === "right" ? defaultLeft : btnRect.left - sidebarRect.left - gap;
        setPos({ top: Math.round(defaultTop), left: Math.round(left), placement });
      } else {
        // fallback: attach to body and use fixed positioning (so scroll won't move it unexpectedly)
        const viewportTop = btnRect.top + window.scrollY + btnRect.height + 4;
        // flip logic in viewport coordinates
        const placement: "right" | "left" = preferRight ? (menuFitsRight() ? "right" : "left") : (menuFitsRight() ? "left" : "right");
        const left =
          placement === "right"
            ? Math.round(btnRect.right + window.scrollX + gap)
            : Math.round(btnRect.left + window.scrollX - gap);
        setPos({ top: Math.round(viewportTop), left, placement });
      }
    };

    const tick = () => {
      update();
      raf = requestAnimationFrame(tick);
    };

    // initial + continuous updates while open (handles transforms and scrolling)
    tick();

    // also listen to resize/scroll events to be safe
    const passive = { passive: true };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen, root, buttonRef, gap, preferRight]);

  if (!isOpen) return null;

  // Determine mount point
  const mountPoint = root ?? document.body;

  // If mounting to body, we'll use fixed positioning; if mounting to sidebar root we use absolute relative to it
  const style: React.CSSProperties =
    mountPoint === document.body
      ? {
          position: "fixed",
          top: pos.top,
          left: pos.left,
          zIndex: 99999,
        }
      : {
          position: "absolute",
          top: pos.top,
          left: pos.left,
          zIndex: 9999,
        };

  return createPortal(
    <div style={style} className="pointer-events-auto">
      {children}
    </div>,
    mountPoint
  );
};
