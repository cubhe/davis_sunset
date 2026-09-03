'use client';

import { useEffect } from 'react';

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Drives three scroll-linked custom properties on <html>:
 *
 *   --sunset-progress  0→1 while the sun drops behind the horizon (hero pinned).
 *   --cover-progress   0→1 while the first paper sheet rises over the pinned hero.
 *   --dusk-progress    0→1 as the fixed sky deepens from afterglow to a starry night.
 *
 * All three are pure functions of scrollY, so scrolling back up rewinds the sky.
 */
export function ScrollSunset() {
  useEffect(() => {
    const root = document.documentElement;
    const hero = document.querySelector<HTMLElement>('[data-sunset-hero]');
    const stage = document.querySelector<HTMLElement>('[data-sunset-stage]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;

    const setProgress = (sunset: number, cover: number, dusk: number) => {
      root.style.setProperty('--sunset-progress', sunset.toFixed(4));
      root.style.setProperty('--cover-progress', cover.toFixed(4));
      root.style.setProperty('--dusk-progress', dusk.toFixed(4));
    };

    const updateScene = () => {
      frame = 0;
      if (!hero || !stage || reduceMotion) {
        setProgress(reduceMotion ? 0.72 : 0, 0, reduceMotion ? 0.4 : 0);
        return;
      }
      const stageHeight = stage.offsetHeight;
      // The hero is laid out as: sunset run + pinned stage + cover run (the sheet
      // overlaps the hero by exactly one stage height, see .content-shell).
      const coverRun = stageHeight;
      const sunsetRun = Math.max(hero.offsetHeight - stageHeight - coverRun, 1);
      const duskRun = stageHeight * 2.2;
      const y = window.scrollY;

      setProgress(
        clamp01(y / sunsetRun),
        clamp01((y - sunsetRun) / coverRun),
        clamp01((y - sunsetRun) / duskRun),
      );
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
      root.style.removeProperty('--cover-progress');
      root.style.removeProperty('--dusk-progress');
    };
  }, []);

  return null;
}
