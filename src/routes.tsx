import { Routes, Route } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { UserRole } from "./stores/useSession";
import AppLayout from "./layouts/AppLayout";
import PublicLayout from "./layouts/PublicLayout";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import GetQuotePublic from "./pages/GetQuotePublic";
import Offline from "./pages/Offline";
import Unauthorized from "./pages/Unauthorized";
import Auth from "./pages/Auth";
import PendingApproval from "./pages/PendingApproval";
import NotFound from "./pages/NotFound";

// Protected pages
import RFQ from "./pages/RFQ";
import Missions from "./pages/Missions";
import MissionDetail from "./pages/MissionDetail";
import Passport from "./pages/Passport";
import Recruiting from "./pages/Recruiting";
import AdminCandidates from "./pages/AdminCandidates";
import Training from "./pages/Training";
import TrainingDetail from "./pages/TrainingDetail";
import MyTraining from "./pages/MyTraining";
import AdminTraining from "./pages/AdminTraining";

const BUSINESS_ROLES: UserRole[] = ['client_admin', 'approver', 'ops', 'recruiter', 'finance'];
const ALL_PROTECTED: UserRole[] = ['client_admin', 'approver', 'ops', 'recruiter', 'finance', 'talent'];

export const AppRoutes = () => (
  <Routes>
    {/* PUBLIC */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/get-quote" element={<GetQuotePublic />} />
      <Route path="/training" element={<Training />} />
      <Route path="/training/:id" element={<TrainingDetail />} />
      <Route path="/offline" element={<Offline />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/pending-approval" element={<PendingApproval />} />
    </Route>

    {/* PROTÉGÉ */}
    <Route element={<AppLayout />}>
      {/* Business tools (no talent access) */}
      <Route element={<RequireAuth roles={BUSINESS_ROLES} />}>
        <Route path="/rfq" element={<RFQ />} />
      </Route>
      
      {/* All authenticated users */}
      <Route element={<RequireAuth roles={ALL_PROTECTED} />}>
        <Route path="/missions" element={<Missions />} />
        <Route path="/missions/:id" element={<MissionDetail />} />
        <Route path="/passport" element={<Passport />} />
        <Route path="/recruiting" element={<Recruiting />} />
        <Route path="/admin/candidates" element={<AdminCandidates />} />
        <Route path="/admin/training" element={<AdminTraining />} />
        <Route path="/training/my" element={<MyTraining />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);