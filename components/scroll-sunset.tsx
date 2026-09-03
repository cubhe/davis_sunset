'use client';

import { useEffect } from 'react';

export function ScrollSunset() {
  useEffect(() => {
    const root = document.documentElement;
    const hero = document.querySelector<HTMLElement>('[data-sunset-hero]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;

    const updateScene = () => {
      frame = 0;
      if (!hero || reduceMotion) {
        root.style.setProperty('--sunset-progress', reduceMotion ? '0.72' : '0');
        return;
      }
      const distance = Math.max(hero.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, window.scrollY / distance));
      root.style.setProperty('--sunset-progress', progress.toFixed(4));
    };

    const queueUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScene);
    };

    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const observer = reduceMotion
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                (entry.target as HTMLElement).classList.add('is-visible');
                observer?.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
        );

    items.forEach((item) => {
      if (reduceMotion) item.classList.add('is-visible');
      else observer?.observe(item);
    });
    updateScene();
    window.addEventListener('scroll', queueUpdate, { passive: true });
    window.addEventListener('resize', queueUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queueUpdate);
      window.removeEventListener('resize', queueUpdate);
      observer?.disconnect();
      root.style.removeProperty('--sunset-progress');
    };
  }, []);

  return null;
}
