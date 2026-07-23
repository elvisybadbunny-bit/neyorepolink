"use client";

import * as React from "react";

/**
 * Secondary dashboard tools should not compete with the school pulse for the
 * first network/CPU frame. They mount shortly before scrolling into view.
 */
export function DeferredDashboardSection({ children, label, minHeight = 120 }: { children: React.ReactNode; label: string; minHeight?: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVisible(true);
      observer.disconnect();
    }, { rootMargin: "240px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} style={!visible ? { minHeight } : undefined}>{visible ? children : <div className="flex h-full min-h-[inherit] items-center rounded-[2rem] border border-navy-100 bg-white/50 px-5 py-4 text-xs font-medium text-navy-400 dark:border-navy-800 dark:bg-navy-900/40" role="status">{label} will open as it comes into view.</div>}</div>;
}
