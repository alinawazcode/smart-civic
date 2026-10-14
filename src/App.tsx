import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoleProvider } from './context/RoleContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { PortalLayout } from './components/layout/PortalLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public pages
import { Landing } from './pages/public/Landing';
import { ReportIssue } from './pages/public/ReportIssue';
import { Confirmation } from './pages/public/Confirmation';
import { TrackComplaint } from './pages/public/TrackComplaint';
import { Transparency } from './pages/public/Transparency';
import { ModelReport } from './pages/public/ModelReport';
import { Login } from './pages/public/Login';
import { ResidentDashboard } from './pages/public/ResidentDashboard';
import { Credits } from './pages/public/Credits';
import { NotFound } from './pages/public/NotFound';

// Staff pages
import { StaffTasks } from './pages/staff/StaffTasks';
import { StaffTicketDetail } from './pages/staff/StaffTicketDetail';
import { StaffNotifications, StaffProfile } from './pages/staff/StaffExtraPages';

// Admin pages
import { CityOverview } from './pages/admin/CityOverview';
import { RankedQueue } from './pages/admin/RankedQueue';
import { AdminTicketDetail } from './pages/admin/AdminTicketDetail';
import { ReviewQueue } from './pages/admin/ReviewQueue';
import { ClosureReview } from './pages/admin/ClosureReview';
import { HotspotsMap } from './pages/admin/HotspotsMap';
import { WhatIfSandbox } from './pages/admin/WhatIfSandbox';
import { Analytics } from './pages/admin/Analytics';
import { Settings } from './pages/admin/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false
    }
  }
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. Public Routes with PublicLayout (Navbar & Footer) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/report/done/:code" element={<Confirmation />} />
              <Route path="/track" element={<TrackComplaint />} />
              <Route path="/track/:code" element={<TrackComplaint />} />
              <Route path="/transparency" element={<Transparency />} />
              <Route path="/model-report" element={<ModelReport />} />
              <Route path="/login" element={<Login />} />
              <Route path="/resident" element={<ResidentDashboard />} />
              <Route path="/credits" element={<Credits />} />
            </Route>

            {/* 2. Staff Portal Routes with PortalLayout (Protected for Staff role) */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <PortalLayout portalType="staff" />
                </ProtectedRoute>
              }
            >
              <Route index element={<StaffTasks />} />
              <Route path="tickets/:id" element={<StaffTicketDetail />} />
              <Route path="notifications" element={<StaffNotifications />} />
              <Route path="profile" element={<StaffProfile />} />
            </Route>

            {/* 3. Admin Portal Routes with PortalLayout (Protected for Admin role) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PortalLayout portalType="admin" />
                </ProtectedRoute>
              }
            >
              <Route index element={<CityOverview />} />
              <Route path="queue" element={<RankedQueue />} />
              <Route path="tickets/:id" element={<AdminTicketDetail />} />
              <Route path="review" element={<ReviewQueue />} />
              <Route path="closure" element={<ClosureReview />} />
              <Route path="hotspots" element={<HotspotsMap />} />
              <Route path="what-if" element={<WhatIfSandbox />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Wildcard 404 */}
            <Route path="*" element={<PublicLayout />}>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </RoleProvider>
    </QueryClientProvider>
  );
}

export default App;
