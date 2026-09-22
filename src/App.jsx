import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Devices from './pages/Devices';
import RepairJobs from './pages/RepairJobs';
import JobDetails from './pages/JobDetails';
import Technicians from './pages/Technicians';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="devices" element={<Devices />} />
          <Route path="repair-jobs" element={<RepairJobs />} />
          <Route path="repair-jobs/:id" element={<JobDetails />} />
          <Route path="technicians" element={<Technicians />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
