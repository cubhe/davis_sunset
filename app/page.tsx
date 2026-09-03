import { SunsetPage } from '@/components/sunset-page';
import { getForecasts } from '@/lib/forecasts';

export const revalidate = 300;

export default async function Home() {
  return <SunsetPage forecasts={await getForecasts()} />;
}
