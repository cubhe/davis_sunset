'use client';

import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Camera,
  ChevronDown,
  Clock3,
  CloudSun,
  Code2,
  Compass,
  Eye,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { ScrollSunset } from '@/components/scroll-sunset';
import type { Forecast } from '@/lib/forecasts';
import { scoreMood } from '@/lib/forecasts';

function statusClass(rating: string) {
  if (rating.includes('✅')) return 'good';
  if (rating.includes('⚠️')) return 'warning';
  return 'neutral';
}

function cleanRating(rating: string) {
  return rating.replaceAll('✅', '').replaceAll('⚠️', '').replaceAll('➖', '').trim();
}

function Emphasis({ text }: { text: string }) {
  const parts = text.split(/(\d{1,2}:\d{2}(?:[–—-]\d{1,2}:\d{2})?|\d+(?:\.\d+)?%|ECMWF|GFS|ICON)/g);
  return parts.map((part, index) =>
    /^(?:\d{1,2}:\d{2}|\d+(?:\.\d+)?%|ECMWF|GFS|ICON)/.test(part) ? <strong key={index}>{part}</strong> : part,
  );
}

export function SunsetPage({ forecasts }: { forecasts: Forecast[] }) {
  const forecast = forecasts[0];
  if (!forecast) {
    return (
      <main className="empty-state">
        <CloudSun size={34} />
        <h1>今天的晚霞判断还没来</h1>
        <p>在 reports 目录加入一份按日期命名的 Markdown 后，这里会自动出现。</p>
      </main>
    );
  }

  const [year, month, day] = forecast.date.split('-');
  const assetBase = import.meta.env.BASE_URL || '/';

  return (
    <main>
      <ScrollSunset />
      <div className="sky-scene" aria-hidden="true">
        <div className="sky-art" style={{ backgroundImage: `url(${assetBase}davis-sunset-atmosphere.png)` }} />
        <div className="daylight-wash" />
        <div className="afterglow" />
        <div className="sun-orb" />
        <div className="horizon-haze" />
      </div>

      <header className="site-header">
        <a className="brand" href="#today" aria-label="Davis 晚霞首页">
          <span className="brand-mark" aria-hidden="true" />
          <span>Davis 晚霞</span>
        </a>
        <nav aria-label="主要导航">
          <a href="#today">今晚</a>
          <a href="#details">判断依据</a>
          <a href="#archive">往日记录</a>
        </nav>
      </header>

      <section className="hero" id="today" data-sunset-hero>
        <div className="hero-stage">
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="eyebrow">
              <MapPin size={14} aria-hidden="true" />
              Davis, California · DAILY SUNSET INDEX
            </div>

            <div className="hero-grid">
              <div className="date-lockup" aria-label={`${year}年${month}月${day}日`}>
                <span className="date-month">{month}月</span>
                <strong>{day}</strong>
                <span className="date-year">{year} · {forecast.displayDate.replace(/^\d+月\d+日/, '')}</span>
              </div>

              <div className="hero-copy">
                <p className="kicker">今晚值得追吗？</p>
                <h1>{forecast.verdict}</h1>
                <div className="sun-meta" aria-label="日落信息">
                  <span><Clock3 size={17} /> 日落 <strong>{forecast.sunset}</strong></span>
                  <span><Compass size={17} /> 方位 <strong>{forecast.azimuth}</strong></span>
                  {forecast.directionNote && <span className="direction-note">{forecast.directionNote}</span>}
                </div>
              </div>

              <div className="score-card" aria-label={`晚霞指数 ${forecast.score} 分，满分 10 分`}>
                <span className="score-label">晚霞指数</span>
                <div><strong>{forecast.score}</strong><span>/10</span></div>
                <p><Sparkles size={14} /> {scoreMood(forecast.score)}</p>
              </div>
            </div>

            <a className="scroll-cue" href="#details">向下滑，看太阳落下 <ArrowDown size={15} /></a>
          </div>
        </div>
      </section>

      <div className="content-shell">
        <div className="analysis-zone">
          <section className="summary" id="details" aria-labelledby="summary-title">
          <div className="section-heading" data-reveal>
            <p className="kicker">Tonight at a glance</p>
            <h2 id="summary-title">今晚的关键判断</h2>
            <p><Emphasis text={forecast.judgment} /></p>
          </div>

          <div className="decision-strip" data-reveal>
            <article>
              <span className="icon-box"><Eye size={20} /></span>
              <div><span>出门前</span><strong>19:00 推窗看西边</strong></div>
            </article>
            <article>
              <span className="icon-box"><Clock3 size={20} /></span>
              <div><span>最佳时间</span><strong>{forecast.window.match(/\d{1,2}:\d{2}[–—-]\d{1,2}:\d{2}/)?.[0] ?? '日落前后'}</strong></div>
            </article>
            <article>
              <span className="icon-box"><Camera size={20} /></span>
              <div><span>首选方向</span><strong>先看西边，也要回头</strong></div>
            </article>
          </div>
          </section>

          <section className="factors-section" aria-labelledby="factors-title">
          <div className="section-label" data-reveal>
            <div>
              <p className="kicker">Why this score</p>
              <h2 id="factors-title">这 {forecast.score} 分怎么来的</h2>
            </div>
            <p>真正的决定性变量是高云：地面再完美，也需要云来接住最后一束光。</p>
          </div>

          <table className="factor-table" aria-label="晚霞判断因子" data-reveal>
            <thead>
              <tr className="factor-row factor-head">
                <th>因子</th><th>观测 / 预报</th><th>判断</th>
              </tr>
            </thead>
            <tbody>
              {forecast.factors.map((factor) => (
                <tr className="factor-row" key={factor.name}>
                  <th scope="row">{factor.name}</th>
                  <td><Emphasis text={factor.value} /></td>
                  <td className={`factor-rating ${statusClass(factor.rating)}`}>
                    <i aria-hidden="true" />{cleanRating(factor.rating)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </section>
        </div>

        <section className="plan-section" aria-labelledby="plan-title">
          <div className="plan-intro" data-reveal>
            <p className="kicker">Your sunset plan</p>
            <h2 id="plan-title">如果天上出现丝缕状高云，就走</h2>
          </div>
          <div className="plan-grid">
            <article className="time-card" data-reveal>
              <span className="card-number">01</span>
              <span className="plan-icon"><Clock3 size={22} /></span>
              <h3>抓住时间窗</h3>
              <p><Emphasis text={forecast.window} /></p>
            </article>
            <article className="advice-card" data-reveal>
              <span className="card-number">02</span>
              <span className="plan-icon"><Compass size={22} /></span>
              <h3>今晚去哪里</h3>
              <p><Emphasis text={forecast.advice} /></p>
              <div className="map-links">
                <a href="https://www.google.com/maps/search/?api=1&query=County+Road+31+Davis+CA" target="_blank" rel="noreferrer">城西农田路 <ArrowUpRight size={14} /></a>
                <a href="https://www.google.com/maps/search/?api=1&query=West+Davis+Pond+Davis+CA" target="_blank" rel="noreferrer">West Davis Pond <ArrowUpRight size={14} /></a>
              </div>
            </article>
          </div>
        </section>

        <section className="archive-section" id="archive" aria-labelledby="archive-title">
          <div className="archive-heading" data-reveal>
            <div><p className="kicker">Archive</p><h2 id="archive-title">往日晚霞</h2></div>
            <span>{forecasts.length} 份判断</span>
          </div>
          <div className="archive-list" data-reveal>
            {forecasts.map((item, index) => (
              <details key={item.date} open={index === 0}>
                <summary>
                  <span className="archive-date"><CalendarDays size={16} /> {item.displayDate}</span>
                  <strong>{item.score}<small>/10</small></strong>
                  <span className="archive-verdict">{item.verdict}</span>
                  <ChevronDown className="chevron" size={18} aria-hidden="true" />
                </summary>
                <div className="archive-detail">
                  <p><b>关键判断</b>{item.judgment || '详见当天完整播报。'}</p>
                  <p><b>时间窗</b>{item.window || '详见当天完整播报。'}</p>
                  <p><b>建议</b>{item.advice || '详见当天完整播报。'}</p>
                  <a className="source-link" href={`https://github.com/cubhe/davis_sunset/blob/main/reports/${item.date}.md`} target="_blank" rel="noreferrer">查看原始播报 <ArrowUpRight size={13} /></a>
                </div>
              </details>
            ))}
          </div>
        </section>

        <footer>
          <div><span className="footer-mark" aria-hidden="true" /> <span>Davis 晚霞 · 每日下午更新</span></div>
          <div className="footer-links">
            <a href="https://github.com/cubhe/davis_sunset" target="_blank" rel="noreferrer"><Code2 size={14} /> 数据与源码</a>
            <span>背景插画：为 Davis 晚霞生成</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
