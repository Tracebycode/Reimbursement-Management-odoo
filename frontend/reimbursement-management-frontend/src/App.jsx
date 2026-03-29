import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboardHome from './pages/admin/AdminDashboardHome';
import UserManagement from './pages/admin/UserManagement';
import ApprovalRules from './pages/admin/ApprovalRules';
import AllExpenses from './pages/admin/AllExpenses';
import Settings from './pages/admin/Settings';
import { AdminProvider } from './context/AdminContext';

function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirect root to admin dashboard for demonstration */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Admin Routes wrapped in Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardHome />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="rules" element={<ApprovalRules />} />
            <Route path="expenses" element={<AllExpenses />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  );
}

export default App;
