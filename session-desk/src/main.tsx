import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ensureSettings, seedDemoDataIfEmpty } from './lib/seed';
import './styles.css';

async function bootstrap() {
  await ensureSettings();
  await seedDemoDataIfEmpty();

  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
