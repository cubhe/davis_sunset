export type Factor = {
  name: string;
  value: string;
  rating: string;
};

export type Forecast = {
  date: string;
  displayDate: string;
  shortDate: string;
  score: number;
  verdict: string;
  sunset: string;
  azimuth: string;
  directionNote: string;
  factors: Factor[];
  judgment: string;
  window: string;
  advice: string;
  raw: string;
};

const markdownFiles = import.meta.glob('../reports/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

function plain(value: string) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*>]\s*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function section(source: string, label: string) {
  const pattern = new RegExp(
    `\\*\\*${label}\\*\\*[：:]\\s*([\\s\\S]*?)(?=\\n\\s*\\n\\*\\*(?:关键判断|时间窗|建议)\\*\\*[：:]|$)`,
  );
  return pattern.exec(source)?.[1]?.trim() ?? '';
}

function headingSection(source: string, label: string) {
  const pattern = new RegExp(`^#{2,4}\\s+${label}\\s*$([\\s\\S]*?)(?=^#{2,4}\\s+|$)`, 'm');
  return pattern.exec(source)?.[1]?.trim() ?? '';
}

function frontmatter(source: string) {
  const block = /^---\s*\n([\s\S]*?)\n---/.exec(source)?.[1] ?? '';
  return Object.fromEntries(
    block.split('\n').map((line) => {
      const separator = line.indexOf(':');
      if (separator < 0) return ['', ''];
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')];
    }).filter(([key]) => key),
  );
}

function parseTable(source: string): Factor[] {
  return source
    .split('\n')
    .filter((line) => line.trim().startsWith('|'))
    .map((line) => line.split('|').slice(1, -1).map(plain))
    .filter((cells) => cells.length >= 3)
    .filter((cells) => !cells.every((cell) => /^:?-{3,}:?$/.test(cell)))
    .filter((cells) => !/因子/.test(cells[0]))
    .map(([name, value, rating]) => ({ name, value, rating }));
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00-07:00`);
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'America/Los_Angeles',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(parsed);
}

function parseForecast(path: string, raw: string): Forecast | null {
  const date = /([0-9]{4}-[0-9]{2}-[0-9]{2})\.md$/.exec(path)?.[1];
  if (!date) return null;

  const meta = frontmatter(raw);
  const heading = /\*\*Davis\s+([0-9]{1,2}\/[0-9]{1,2})\s+晚霞指数[：:]\s*([0-9]+(?:\.[0-9]+)?)\s*\/\s*10\s*[—-]+\s*([\s\S]*?)\*\*/.exec(raw);
  const sun = /日落\s+\*\*([0-9]{1,2}:[0-9]{2})\*\*[，,]\s*(?:日落)?方位角?\s*[~≈]?\s*\*\*?([0-9]{1,3}(?:\.[0-9]+)?)°[^\n]*/.exec(raw);
  const revisedScore = Number(meta.score_revised || meta.score || heading?.[2] || 0);
  const judgment = section(raw, '关键判断') || headingSection(raw, '关键点') || section(raw, '最好的一条');
  const window = section(raw, '时间窗') || section(raw, '时间与地点') || headingSection(raw, '时间与地点');
  const advice = section(raw, '建议') || section(raw, '地点');

  return {
    date,
    displayDate: formatDate(date),
    shortDate: heading?.[1] ?? date.slice(5).replace('-', '/'),
    score: revisedScore,
    verdict: plain(heading?.[3] ?? '等待今日判断'),
    sunset: sun?.[1] ?? meta.sunset ?? '--:--',
    azimuth: sun?.[2] ? `${sun[2]}°` : meta.sunset_azimuth ? `${meta.sunset_azimuth}°` : '—',
    directionNote: plain(sun?.[3] ?? '').replace(/^[（(]|[）)]$/g, ''),
    factors: parseTable(raw),
    judgment: plain(judgment),
    window: plain(window),
    advice: plain(advice),
    raw,
  };
}

const localForecasts = Object.entries(markdownFiles)
  .map(([path, raw]) => parseForecast(path, raw))
  .filter((forecast): forecast is Forecast => forecast !== null)
  .sort((a, b) => b.date.localeCompare(a.date));

type GithubFile = {
  name: string;
  download_url: string | null;
  type: string;
};

export async function getForecasts() {
  try {
    const listing = await fetch('https://api.github.com/repos/cubhe/davis_sunset/contents/reports?ref=main', {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'davis-sunset-site',
      },
      next: { revalidate: 300 },
    } as RequestInit & { next: { revalidate: number } });

    if (!listing.ok) throw new Error(`GitHub returned ${listing.status}`);
    const files = (await listing.json()) as GithubFile[];
    const reports = await Promise.all(
      files
        .filter((file) => file.type === 'file' && /^\d{4}-\d{2}-\d{2}\.md$/.test(file.name) && file.download_url)
        .map(async (file) => {
          const response = await fetch(file.download_url!, {
            next: { revalidate: 300 },
          } as RequestInit & { next: { revalidate: number } });
          if (!response.ok) return null;
          return parseForecast(file.name, await response.text());
        }),
    );
    const remoteForecasts = reports
      .filter((forecast): forecast is Forecast => forecast !== null)
      .sort((a, b) => b.date.localeCompare(a.date));
    return remoteForecasts.length ? remoteForecasts : localForecasts;
  } catch {
    return localForecasts;
  }
}

export function scoreMood(score: number) {
  if (score >= 9) return '别错过';
  if (score >= 7) return '值得出门';
  if (score >= 4) return '看运气';
  return '适合散步，不必专程追';
}
