import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/app-shell';
import { CalendarView } from './components/calendar-view';
import { ClientDashboard } from './components/client-dashboard';
import { ClientsView } from './components/clients-view';
import { OverviewDashboard } from './components/overview-dashboard';
import { SessionEditorView, SessionsView } from './components/sessions-view';
import { SettingsView } from './components/settings-view';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<OverviewDashboard />} />
          <Route path="/clients" element={<ClientsView />} />
          <Route path="/sessions" element={<SessionsView />} />
          <Route path="/sessions/new" element={<SessionEditorView />} />
          <Route path="/sessions/:sessionId" element={<SessionEditorView />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
