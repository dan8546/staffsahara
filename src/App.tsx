import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { RequireAuth } from "./components/RequireAuth";
import { AppLayout } from "./components/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RFQ from "./pages/RFQ";
import Missions from "./pages/Missions";
import MissionDetail from "./pages/MissionDetail";
import Passport from "./pages/Passport";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Recruiting from "./pages/Recruiting";
import AdminCandidates from "./pages/AdminCandidates";
import About from "./pages/About";
import Login from "./pages/Login";
import Offline from "./pages/Offline";
import Auth from "./pages/Auth";
import PendingApproval from "./pages/PendingApproval";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Auth />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/offline" element={<Offline />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }>
              <Route index element={<Index />} />
              <Route path="rfq" element={
                <RequireAuth roles={['client_admin', 'approver']}>
                  <RFQ />
                </RequireAuth>
              } />
              <Route path="missions" element={
                <RequireAuth roles={['client_admin', 'approver', 'ops']}>
                  <Missions />
                </RequireAuth>
              } />
              <Route path="missions/:id" element={
                <RequireAuth roles={['client_admin', 'approver', 'ops']}>
                  <MissionDetail />
                </RequireAuth>
              } />
              <Route path="passport" element={<Passport />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="jobs/:id" element={<JobDetail />} />
              <Route path="recruiting" element={
                <RequireAuth roles={['recruiter', 'ops']}>
                  <Recruiting />
                </RequireAuth>
              } />
              <Route path="admin/candidates" element={
                <RequireAuth roles={['recruiter', 'ops']}>
                  <AdminCandidates />
                </RequireAuth>
              } />
              <Route path="about" element={<About />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
