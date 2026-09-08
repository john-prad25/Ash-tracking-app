import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/app-shell';
import { CalendarView } from './components/calendar-view';
import { ClientDashboard } from './components/client-dashboard';
import { ClientsView } from './components/clients-view';
import { OverviewDashboard } from './components/overview-dashboard';
import { SessionEditorView, SessionsView } from './components/sessions-view';
import { SettingsView } from './components/settings-view';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<OverviewDashboard />} />
          <Route path="clients" element={<ClientsView />} />
          <Route path="sessions" element={<SessionsView />} />
          <Route path="sessions/:id" element={<SessionEditorView />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="client-view" element={<ClientDashboard />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
