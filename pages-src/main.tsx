import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SunsetPage } from '@/components/sunset-page';
import { localForecasts } from '@/lib/forecasts';
import '@/app/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SunsetPage forecasts={localForecasts} />
  </StrictMode>,
);
