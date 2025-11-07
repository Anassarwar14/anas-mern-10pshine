"use client";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
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
  const [pos, setPos] = useState<{ top: number; left: number; placement: "right" | "left" } | null>(null);
  const [isReady, setIsReady] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Use useLayoutEffect for immediate, synchronous positioning before paint
  useLayoutEffect(() => {
    if (!isOpen) {
      setPos(null);
      setIsReady(false);
      return;
    }

    const btn = getButtonEl();
    const menuEl = menuRef.current;
    if (!btn || !menuEl) return;

    const btnRect = btn.getBoundingClientRect();
    const menuWidth = menuEl.offsetWidth || 220;
    const menuHeight = menuEl.offsetHeight || 0;
    const sidebarEl = root;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (sidebarEl) {
      // Compute coordinates relative to the sidebar root
      const sidebarRect = sidebarEl.getBoundingClientRect();
      
      // Calculate available space on both sides
      const spaceRight = viewportWidth - btnRect.right;
      const spaceLeft = btnRect.left;
      
      // Determine placement based on available space
      let placement: "right" | "left";
      if (preferRight) {
        placement = spaceRight >= menuWidth + gap ? "right" : "left";
      } else {
        placement = spaceLeft >= menuWidth + gap ? "left" : "right";
      }
      
      // Calculate horizontal position
      let left: number;
      if (placement === "right") {
        left = btnRect.right - sidebarRect.left + gap;
      } else {
        left = btnRect.left - sidebarRect.left - menuWidth - gap;
        // Ensure menu doesn't go off left edge
        if (left < 0) {
          left = gap;
        }
      }
      
      // Calculate vertical position
      let top = btnRect.top - sidebarRect.top;
      
      // Check if menu would go below viewport
      const menuBottom = btnRect.top + menuHeight;
      if (menuBottom > viewportHeight && btnRect.top > menuHeight) {
        // Position above button if there's space
        top = btnRect.bottom - sidebarRect.top - menuHeight;
      }
      
      setPos({ 
        top: Math.round(top), 
        left: Math.round(left), 
        placement 
      });
    } else {
      // Fallback: attach to body with fixed positioning
      const spaceRight = viewportWidth - btnRect.right;
      const spaceLeft = btnRect.left;
      
      let placement: "right" | "left";
      if (preferRight) {
        placement = spaceRight >= menuWidth + gap ? "right" : "left";
      } else {
        placement = spaceLeft >= menuWidth + gap ? "left" : "right";
      }
      
      let left: number;
      if (placement === "right") {
        left = btnRect.right + gap;
        // Ensure menu doesn't go off right edge
        if (left + menuWidth > viewportWidth) {
          left = viewportWidth - menuWidth - gap;
        }
      } else {
        left = btnRect.left - menuWidth - gap;
        // Ensure menu doesn't go off left edge
        if (left < 0) {
          left = gap;
        }
      }
      
      // Calculate vertical position
      let top = btnRect.top;
      
      // Check if menu would go below viewport
      const menuBottom = top + menuHeight;
      if (menuBottom > viewportHeight && btnRect.top > menuHeight) {
        // Position above button if there's space
        top = btnRect.bottom - menuHeight;
      }
      
      setPos({ 
        top: Math.round(top), 
        left: Math.round(left), 
        placement 
      });
    }

    setIsReady(true);
  }, [isOpen, root, buttonRef, gap, preferRight]);

  // Continuous updates for scroll/resize
  useEffect(() => {
    if (!isOpen || !isReady) return;

    let raf = 0;
    let mounted = true;

    const update = () => {
      if (!mounted) return;
      const btn = getButtonEl();
      const menuEl = menuRef.current;
      if (!btn || !menuEl) return;

      const btnRect = btn.getBoundingClientRect();
      const menuWidth = menuEl.offsetWidth || 220;
      const menuHeight = menuEl.offsetHeight || 0;
      const sidebarEl = root;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (sidebarEl) {
        const sidebarRect = sidebarEl.getBoundingClientRect();
        const spaceRight = viewportWidth - btnRect.right;
        const spaceLeft = btnRect.left;
        
        let placement: "right" | "left";
        if (preferRight) {
          placement = spaceRight >= menuWidth + gap ? "right" : "left";
        } else {
          placement = spaceLeft >= menuWidth + gap ? "left" : "right";
        }
        
        let left: number;
        if (placement === "right") {
          left = btnRect.right - sidebarRect.left + gap;
        } else {
          left = btnRect.left - sidebarRect.left - menuWidth - gap;
          if (left < 0) {
            left = gap;
          }
        }
        
        let top = btnRect.top - sidebarRect.top;
        const menuBottom = btnRect.top + menuHeight;
        if (menuBottom > viewportHeight && btnRect.top > menuHeight) {
          top = btnRect.bottom - sidebarRect.top - menuHeight;
        }
        
        setPos({ 
          top: Math.round(top), 
          left: Math.round(left), 
          placement 
        });
      } else {
        const spaceRight = viewportWidth - btnRect.right;
        const spaceLeft = btnRect.left;
        
        let placement: "right" | "left";
        if (preferRight) {
          placement = spaceRight >= menuWidth + gap ? "right" : "left";
        } else {
          placement = spaceLeft >= menuWidth + gap ? "left" : "right";
        }
        
        let left: number;
        if (placement === "right") {
          left = btnRect.right + gap;
          if (left + menuWidth > viewportWidth) {
            left = viewportWidth - menuWidth - gap;
          }
        } else {
          left = btnRect.left - menuWidth - gap;
          if (left < 0) {
            left = gap;
          }
        }
        
        let top = btnRect.top;
        const menuBottom = top + menuHeight;
        if (menuBottom > viewportHeight && btnRect.top > menuHeight) {
          top = btnRect.bottom - menuHeight;
        }
        
        setPos({ 
          top: Math.round(top), 
          left: Math.round(left), 
          placement 
        });
      }
    };

    const tick = () => {
      update();
      raf = requestAnimationFrame(tick);
    };
    tick();

    const passive = { passive: true };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen, isReady, root, buttonRef, gap, preferRight]);

  if (!isOpen) return null;

  // Determine mount point
  const mountPoint = root ?? document.body;

  // Render with opacity 0 until ready, then fade in
  const style: React.CSSProperties =
    mountPoint === document.body
      ? {
          position: "fixed",
          top: pos?.top ?? 0,
          left: pos?.left ?? 0,
          zIndex: 99999,
          opacity: isReady && pos ? 1 : 0,
          transition: 'opacity 0.05s ease-in',
        }
      : {
          position: "absolute",
          top: pos?.top ?? 0,
          left: pos?.left ?? 0,
          zIndex: 9999,
          opacity: isReady && pos ? 1 : 0,
          transition: 'opacity 0.05s ease-in',
        };

  return createPortal(
    <div ref={menuRef} style={style} className="pointer-events-auto">
      {children}
    </div>,
    mountPoint
  );
};