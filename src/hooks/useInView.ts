import { useState, useEffect, RefObject } from "react";

export function useInView(ref: RefObject<Element | null>, options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
      }
    }, options || { threshold: 0.2 });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, (options?.threshold as any), (options?.rootMargin as any)]);

  return isInView;
}
