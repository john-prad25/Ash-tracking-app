import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { ensureSettings, seedDemoDataIfEmpty } from './lib/seed';

async function bootstrap() {
  await ensureSettings();
  const seeded = await seedDemoDataIfEmpty();
  if (seeded) {
    console.info('Loaded demo data for prototype walkthrough.');
  }

  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
