import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import './index.css';
import './i18n';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext';
import { TimezoneProvider } from './contexts/TimezoneContext';

// Enable timezone-aware dayjs (uses the user's selected timezone via TimezoneContext).
dayjs.extend(utc);
dayjs.extend(timezone);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <TimezoneProvider>
        <App />
      </TimezoneProvider>
    </ThemeProvider>
  </StrictMode>,
);
