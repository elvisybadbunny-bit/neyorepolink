"use client";

/**
 * T.5b — Picture-in-Picture (Document PiP), founder-confirmed target:
 * "both" (NEYO Intercom live calls AND online class rooms).
 *
 * The real NEYO Intercom card has no `<video>` element (it's an audio-only
 * call UI), so the standard `<video>.requestPictureInPicture()` API doesn't
 * apply to it — this hook uses the real, newer Document Picture-in-Picture
 * API (`window.documentPictureInPicture`), which pops ANY real DOM subtree
 * into a small always-on-top floating window while a user browses other
 * NEYO pages or even switches to a different browser tab entirely. Feature
 * detection is real and honest: on a browser without support (anything
 * non-Chromium today), `supported` is false and the PiP button simply
 * doesn't render — never a broken/no-op button.
 */
import * as React from "react";

declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
      window: Window | null;
    };
  }
}

export function useDocumentPictureInPicture() {
  const [supported, setSupported] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const pipWindowRef = React.useRef<Window | null>(null);
  const originalParentRef = React.useRef<{ node: HTMLElement; parent: HTMLElement; next: ChildNode | null } | null>(null);

  React.useEffect(() => {
    setSupported(typeof window !== "undefined" && "documentPictureInPicture" in window);
  }, []);

  const close = React.useCallback(() => {
    const pipWindow = pipWindowRef.current;
    const original = originalParentRef.current;
    if (pipWindow && !pipWindow.closed) pipWindow.close();
    if (original) {
      original.parent.insertBefore(original.node, original.next);
      originalParentRef.current = null;
    }
    pipWindowRef.current = null;
    setActive(false);
  }, []);

  const open = React.useCallback(async (node: HTMLElement, options?: { width?: number; height?: number; title?: string }) => {
    if (!window.documentPictureInPicture) return;
    const pipWindow = await window.documentPictureInPicture.requestWindow({
      width: options?.width ?? 340,
      height: options?.height ?? 420,
    });
    pipWindowRef.current = pipWindow;

    // Copy every real stylesheet so the moved content keeps its real
    // Liquid Glass styling inside the floating window, never unstyled HTML.
    [...document.styleSheets].forEach((sheet) => {
      try {
        const css = [...sheet.cssRules].map((r) => r.cssText).join("");
        const style = pipWindow.document.createElement("style");
        style.textContent = css;
        pipWindow.document.head.appendChild(style);
      } catch {
        // Cross-origin stylesheet — link it instead of inlining.
        if (sheet.href) {
          const link = pipWindow.document.createElement("link");
          link.rel = "stylesheet";
          link.href = sheet.href;
          pipWindow.document.head.appendChild(link);
        }
      }
    });
    if (options?.title) pipWindow.document.title = options.title;
    pipWindow.document.body.style.margin = "0";

    const parent = node.parentElement;
    if (!parent) return;
    originalParentRef.current = { node, parent, next: node.nextSibling };
    pipWindow.document.body.appendChild(node);
    setActive(true);

    pipWindow.addEventListener("pagehide", () => close(), { once: true });
  }, [close]);

  React.useEffect(() => () => close(), [close]);

  return { supported, active, open, close };
}
