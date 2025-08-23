import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Index />} />
            <Route path="rfq" element={<RFQ />} />
            <Route path="missions" element={<Missions />} />
            <Route path="missions/:id" element={<MissionDetail />} />
            <Route path="passport" element={<Passport />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="recruiting" element={<Recruiting />} />
            <Route path="admin/candidates" element={<AdminCandidates />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            <Route path="offline" element={<Offline />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
