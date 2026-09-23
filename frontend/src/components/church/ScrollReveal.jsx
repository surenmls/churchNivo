import { useEffect, useRef, useState } from 'react';

/** Delay between staggered Modern template items (ms). */
export const MODERN_STAGGER_MS = 80;

export function modernStaggerDelay(baseDelay, index) {
  return baseDelay + index * MODERN_STAGGER_MS;
}

/**
 * Scroll-triggered reveal. Classic = bounce-in; Modern = smooth fade-up (Bolt-style).
 * Respects prefers-reduced-motion.
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  variant = 'classic',
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const variantClass = variant === 'modern' ? 'scroll-reveal--modern' : 'scroll-reveal--classic';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: variant === 'modern' ? 0.08 : 0.1,
        rootMargin: variant === 'modern' ? '0px 0px -48px 0px' : '0px 0px -32px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [variant]);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${variantClass} ${visible ? 'scroll-reveal-visible' : ''} ${className}`.trim()}
      style={{ animationDelay: visible ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}
