import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { UserRole } from "./stores/useSession";
import AppLayout from "./layouts/AppLayout";
import PublicLayout from "./layouts/PublicLayout";
import { SkeletonPage } from "./components/ui/skeleton-page";

// Direct imports for simple pages
import Home from "./pages/Home";
import Offline from "./pages/Offline";
import Unauthorized from "./pages/Unauthorized";
import Auth from "./pages/Auth";
import PendingApproval from "./pages/PendingApproval";
import NotFound from "./pages/NotFound";
import GetQuotePublic from "./pages/GetQuotePublic";

// Lazy loaded public pages
const About = lazy(() => import("./pages/About"));
const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const Training = lazy(() => import("./pages/Training"));
const TrainingDetail = lazy(() => import("./pages/TrainingDetail"));

// Lazy loaded protected pages
const RFQ = lazy(() => import("./pages/RFQ"));
const Missions = lazy(() => import("./pages/Missions"));
const MissionDetail = lazy(() => import("./pages/MissionDetail"));
const Passport = lazy(() => import("./pages/Passport"));
const Recruiting = lazy(() => import("./pages/Recruiting"));
const AdminCandidates = lazy(() => import("./pages/AdminCandidates"));
const MyTraining = lazy(() => import("./pages/MyTraining"));
const AdminTraining = lazy(() => import("./pages/AdminTraining"));
const TrainingReminders = lazy(() => import("./pages/TrainingReminders"));
const TrainingAnalytics = lazy(() => import("./pages/TrainingAnalytics"));
const AdminDiagnostics = lazy(() => import("./pages/AdminDiagnostics"));

const BUSINESS_ROLES: UserRole[] = ['client_admin', 'approver', 'ops', 'recruiter', 'finance'];
const ALL_PROTECTED: UserRole[] = ['client_admin', 'approver', 'ops', 'recruiter', 'finance', 'talent'];

export const AppRoutes = () => (
  <Routes>
    {/* PUBLIC */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<Suspense fallback={<SkeletonPage />}><About /></Suspense>} />
      <Route path="/jobs" element={<Suspense fallback={<SkeletonPage />}><Jobs /></Suspense>} />
      <Route path="/jobs/:id" element={<Suspense fallback={<SkeletonPage />}><JobDetail /></Suspense>} />
      <Route path="/get-quote" element={<GetQuotePublic />} />
      <Route path="/training" element={<Suspense fallback={<SkeletonPage />}><Training /></Suspense>} />
      <Route path="/training/:id" element={<Suspense fallback={<SkeletonPage />}><TrainingDetail /></Suspense>} />
      <Route path="/offline" element={<Offline />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/pending-approval" element={<PendingApproval />} />
    </Route>

    {/* PROTÉGÉ */}
    <Route element={<AppLayout />}>
      {/* Business tools (no talent access) */}
      <Route element={<RequireAuth roles={BUSINESS_ROLES} />}>
        <Route path="/rfq" element={<Suspense fallback={<SkeletonPage />}><RFQ /></Suspense>} />
      </Route>
      
      {/* All authenticated users */}
      <Route element={<RequireAuth roles={ALL_PROTECTED} />}>
        <Route path="/missions" element={<Suspense fallback={<SkeletonPage />}><Missions /></Suspense>} />
        <Route path="/missions/:id" element={<Suspense fallback={<SkeletonPage />}><MissionDetail /></Suspense>} />
        <Route path="/passport" element={<Suspense fallback={<SkeletonPage />}><Passport /></Suspense>} />
        <Route path="/recruiting" element={<Suspense fallback={<SkeletonPage />}><Recruiting /></Suspense>} />
        <Route path="/admin/candidates" element={<Suspense fallback={<SkeletonPage />}><AdminCandidates /></Suspense>} />
        <Route path="/admin/training" element={<Suspense fallback={<SkeletonPage />}><AdminTraining /></Suspense>} />
        <Route path="/admin/training/reminders" element={<Suspense fallback={<SkeletonPage />}><TrainingReminders /></Suspense>} />
        <Route path="/admin/training/analytics" element={<Suspense fallback={<SkeletonPage />}><TrainingAnalytics /></Suspense>} />
        <Route path="/admin/diagnostics" element={<Suspense fallback={<SkeletonPage />}><AdminDiagnostics /></Suspense>} />
        <Route path="/training/my" element={<Suspense fallback={<SkeletonPage />}><MyTraining /></Suspense>} />
      </Route>
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);