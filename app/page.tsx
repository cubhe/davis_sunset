import { SunsetPage } from '@/components/sunset-page';
import { getForecastsByLocation } from '@/lib/forecasts';

export const revalidate = 300;

export default async function Home() {
  return <SunsetPage forecastsByLocation={await getForecastsByLocation()} />;
}
