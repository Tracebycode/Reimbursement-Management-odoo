import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import ManagerLayout from './components/layout/ManagerLayout';
import EmployeeLayout from './components/layout/EmployeeLayout';
import AdminDashboardHome from './pages/admin/AdminDashboardHome';
import ManagerDashboardHome from './pages/manager/ManagerDashboardHome';
import EmployeeDashboardHome from './pages/employee/EmployeeDashboardHome';
import UserManagement from './pages/admin/UserManagement';
import ApprovalRules from './pages/admin/ApprovalRules';
import AllExpenses from './pages/admin/AllExpenses';
import Settings from './pages/admin/Settings';
import { AdminProvider } from './context/AdminContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

function App() {
  return (
    <AdminProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Admin Routes wrapped in Layout and Protected */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboardHome />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="rules" element={<ApprovalRules />} />
              <Route path="expenses" element={<AllExpenses />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Manager Routes wrapped in Layout and Protected */}
            <Route path="/manager" element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <ManagerLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<ManagerDashboardHome />} />
              <Route path="team-expenses" element={<AllExpenses />} />
            </Route>

            {/* Employee Routes wrapped in Layout and Protected */}
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<EmployeeDashboardHome />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AdminProvider>
  );
}

export default App;
