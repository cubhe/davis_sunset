import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SunsetPage } from '@/components/sunset-page';
import { localForecastsByLocation } from '@/lib/forecasts';
import '@/app/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SunsetPage forecastsByLocation={localForecastsByLocation} />
  </StrictMode>,
);
