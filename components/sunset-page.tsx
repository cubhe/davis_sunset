'use client';

import { Fragment, useEffect, useState } from 'react';
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
import { StarField } from '@/components/star-field';
import type { Forecast } from '@/lib/forecasts';
import { scoreMood } from '@/lib/forecasts';
import {
  DEFAULT_LOCATION_ID,
  LOCATIONS,
  getLocation,
  isLocationId,
  type LocationId,
  type SunsetLocation,
} from '@/lib/locations';

const LOCATION_STORAGE_KEY = 'sunset-location';

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

/** `?loc=` wins, then the last choice on this device, then Davis. */
function initialLocationId(): LocationId {
  if (typeof window === 'undefined') return DEFAULT_LOCATION_ID;
  const fromUrl = new URLSearchParams(window.location.search).get('loc');
  if (isLocationId(fromUrl)) return fromUrl;
  try {
    const saved = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    if (isLocationId(saved)) return saved;
  } catch {
    // Storage can be blocked (private mode); the default is fine.
  }
  return DEFAULT_LOCATION_ID;
}

/** About a quarter hour before sunset, rounded down to 5 minutes: `19:16` -> `19:00`. */
function lookoutTime(sunset: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(sunset);
  if (!match) return '日落前';
  const minutes = Math.floor((Number(match[1]) * 60 + Number(match[2]) - 15) / 5) * 5;
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
}

function mapUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query).replaceAll('%20', '+')}`;
}

function LocationSwitch({ current, onSelect }: { current: LocationId; onSelect: (id: LocationId) => void }) {
  return (
    <div className="location-switch" role="group" aria-label="切换地点">
      {LOCATIONS.map((item) => (
        <button key={item.id} type="button" aria-pressed={item.id === current} onClick={() => onSelect(item.id)}>
          {item.name}
        </button>
      ))}
    </div>
  );
}

export function SunsetPage({ forecastsByLocation }: { forecastsByLocation: Record<LocationId, Forecast[]> }) {
  const [locationId, setLocationId] = useState<LocationId>(initialLocationId);
  const location: SunsetLocation = getLocation(locationId);
  const forecasts = forecastsByLocation[location.id] ?? [];
  const forecast = forecasts[0];
  const assetBase = import.meta.env.BASE_URL || '/';

  useEffect(() => {
    document.title = `${location.name} 晚霞｜今晚值得追吗？`;
  }, [location.name]);

  const selectLocation = (id: LocationId) => {
    setLocationId(id);
    const url = new URL(window.location.href);
    if (id === DEFAULT_LOCATION_ID) url.searchParams.delete('loc');
    else url.searchParams.set('loc', id);
    window.history.replaceState(null, '', url);
    try {
      window.localStorage.setItem(LOCATION_STORAGE_KEY, id);
    } catch {
      // Not remembering the choice is acceptable.
    }
  };

  return (
    <main>
      <div className="sky-scene" aria-hidden="true">
        <div className="sky-art" style={{ backgroundImage: `url(${assetBase}davis-sunset-atmosphere.png)` }} />
        <div className="daylight-wash" />
        <div className="afterglow" />
        <div className="sun-orb" />
        <div className="night-veil" />
        <StarField />
        <div className="horizon-glow" />
        <div className="horizon-haze" />
      </div>

      {/* Outside the keyed block so the pressed button keeps focus across a switch. */}
      <header className="site-header">
        <a className="brand" href="#today" aria-label={`${location.name} 晚霞首页`}>
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">{location.name} 晚霞</span>
        </a>
        <div className="header-actions">
          {forecast && (
            <nav aria-label="主要导航">
              <a href="#today">今晚</a>
              <a href="#details">判断依据</a>
              <a href="#archive">往日记录</a>
            </nav>
          )}
          <LocationSwitch current={location.id} onSelect={selectLocation} />
        </div>
      </header>

      {/* Keyed by location: ScrollSunset wires its scroll + reveal observers once on mount, so the
          page body has to remount for the new [data-reveal] nodes to be picked up. */}
      <Fragment key={location.id}>
        <ScrollSunset />
        {forecast ? (
          <ForecastBody location={location} forecast={forecast} forecasts={forecasts} />
        ) : (
          <section className="empty-state on-sky">
            <CloudSun size={34} />
            <h1>{location.name} 的晚霞判断还没来</h1>
            <p>在 {location.reportDir} 目录加入一份按日期命名的 Markdown 后，这里会自动出现。</p>
          </section>
        )}
      </Fragment>
    </main>
  );
}

function ForecastBody({ location, forecast, forecasts }: { location: SunsetLocation; forecast: Forecast; forecasts: Forecast[] }) {
  const [year, month, day] = forecast.date.split('-');
  const weekday = forecast.displayDate.replace(/^\d+月\d+日/, '').trim();

  return (
    <>
      <section className="hero" id="today" data-sunset-hero>
        <div className="hero-stage" data-sunset-stage>
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="eyebrow">
              <MapPin size={14} aria-hidden="true" />
              {location.region} · DAILY SUNSET INDEX
            </div>

            <div className="hero-grid">
              <div className="hero-copy">
                <p className="date-line" aria-label={`${year}年${month}月${day}日`}>
                  <span>{year}</span><i /><span>{month}</span><i /><span>{day}</span>
                  <em>{weekday}</em>
                </p>
                <p className="kicker">今晚值得追吗？</p>
                <h1>{forecast.verdict}</h1>
                <div className="sun-meta" aria-label="日落信息">
                  <span><Clock3 size={17} /> 日落 <strong>{forecast.sunset}</strong></span>
                  <span><Compass size={17} /> 方位 <strong>{forecast.azimuth}</strong>{forecast.directionNote && <small>{forecast.directionNote}</small>}</span>
                </div>
              </div>

              <div className="score-lockup" aria-label={`晚霞指数 ${forecast.score} 分，满分 10 分`}>
                <span className="score-label">晚霞指数<b>Sunset Index</b></span>
                <div className="score-figure"><strong>{forecast.score}</strong><span>/10</span></div>
                <div className="score-meter" aria-hidden="true">
                  {Array.from({ length: 10 }, (_, i) => <i key={i} className={i < Math.round(forecast.score) ? 'lit' : ''} />)}
                </div>
                <p className="score-mood"><Sparkles size={15} /> {scoreMood(forecast.score)}</p>
              </div>
            </div>

            <a className="scroll-cue" href="#details">向下滑，看太阳落下 <ArrowDown size={15} /></a>
          </div>
        </div>
      </section>

      <div className="content-shell">
        <div className="analysis-zone sheet">
          <section className="summary" id="details" aria-labelledby="summary-title">
          <div className="section-heading" data-reveal>
            <div className="section-aside">
              <p className="kicker">Tonight at a glance</p>
              <span className="aside-rule" />
            </div>
            <h2 id="summary-title">今晚的关键判断</h2>
            <p><Emphasis text={forecast.judgment} /></p>
          </div>

          <div className="decision-strip" data-reveal>
            <article>
              <span className="icon-box"><Eye size={20} /></span>
              <div><span>出门前</span><strong>{lookoutTime(forecast.sunset)} 推窗看西边</strong></div>
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
                {location.mapLinks.map((link) => (
                  <a key={link.label} href={mapUrl(link.query)} target="_blank" rel="noreferrer">{link.label} <ArrowUpRight size={14} /></a>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="archive-section sheet" id="archive" aria-labelledby="archive-title">
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
                  <a className="source-link" href={`https://github.com/cubhe/davis_sunset/blob/main/${location.reportDir}/${item.date}.md`} target="_blank" rel="noreferrer">查看原始播报 <ArrowUpRight size={13} /></a>
                </div>
              </details>
            ))}
          </div>
        </section>

        <footer>
          <div><span className="footer-mark" aria-hidden="true" /> <span>{location.name} 晚霞 · 每日下午更新</span></div>
          <div className="footer-links">
            <a href="https://github.com/cubhe/davis_sunset" target="_blank" rel="noreferrer"><Code2 size={14} /> 数据与源码</a>
            <span>背景插画：为 Davis 晚霞生成</span>
          </div>
        </footer>
      </div>
    </>
  );
}
