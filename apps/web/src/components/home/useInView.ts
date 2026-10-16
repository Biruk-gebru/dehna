'use client';

import { useEffect, useRef, useState } from 'react';

/** True while the element is on screen, so off-screen avatars can stop animating. */
export function useInView<T extends Element>(margin = '0px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return [ref, inView] as const;
}
