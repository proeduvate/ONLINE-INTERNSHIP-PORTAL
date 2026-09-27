import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import InternDashboard from "./pages/Dashboard/InternDashboard";
import MentorDashboard from "./pages/Dashboard/MentorDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import ProtectedRoute from "./routes/PrivateRoute";
import Apply from "./pages/onboarding/Apply";
import Status from "./pages/onboarding/Status";
import Payment from "./pages/onboarding/Payment";
import Documents from "./pages/onboarding/Documents";
import AdminOnboardingList from "./pages/admin/onboarding/AdminOnboardingList";
import AdminOnboardingDetails from "./pages/admin/onboarding/AdminOnboardingDetails";
import InternDetails from "./pages/Dashboard/InternDetails";
import BreakoutRoomsApp from "./pages/breakout-rooms/BreakoutRoomsApp";
import { GlobalHeader } from "./components/layout/GlobalHeader";
import NormalLearningDashboard from "./features/learning/normal/NormalLearningDashboard";
import InteractiveLearningDashboard from "./features/learning/interactive/InteractiveLearningDashboard";
import { useAuth } from "./services/AuthContext";

function DevDomainSwitcher() {
  const { user, devDomain, setDevDomain } = useAuth();
  if (!user || user.role !== 'intern') return null;
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 999999, background: '#1e293b', padding: '10px 16px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontFamily: 'Inter' }}>
      <span style={{ fontSize: '12px', fontWeight: 700 }}>DEV PREVIEW DOMAIN:</span>
      <select value={devDomain} onChange={e => setDevDomain(e.target.value)} style={{ padding: '6px', borderRadius: '6px', background: '#334155', color: 'white', border: '1px solid #475569', outline: 'none', cursor: 'pointer' }}>
        <option value="">Actual DB Domain</option>
        <option value="Frontend">Frontend</option>
        <option value="Full Stack">Full Stack</option>
        <option value="UI/UX">UI/UX</option>
        <option value="Data Science">Data Science</option>
        <option value="AIML">AI/ML</option>
        <option value="Python">Python</option>
        <option value="Java">Java</option>
        <option value="Pending Assignment">Pending Assignment</option>
      </select>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DevDomainSwitcher />
      <div className="app-monolithic-wrapper">
        <GlobalHeader />
        <main className="app-main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding/apply" element={<Apply />} />
            <Route path="/onboarding/status" element={<Status />} />
            <Route path="/onboarding/payment" element={<Payment />} />
            <Route path="/onboarding/documents" element={<Documents />} />
            <Route
              path="/intern"
              element={
                <ProtectedRoute roles={["intern"]}>
                  <InternDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/intern/:tab"
              element={
                <ProtectedRoute roles={["intern"]}>
                  <InternDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/intern/learning/normal"
              element={
                <ProtectedRoute roles={["intern"]}>
                  <NormalLearningDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/intern/learning/interactive"
              element={
                <ProtectedRoute roles={["intern"]}>
                  <InteractiveLearningDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor"
              element={
                <ProtectedRoute roles={["mentor"]}>
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/:tab"
              element={
                <ProtectedRoute roles={["mentor"]}>
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/breakout-rooms"
              element={
                <ProtectedRoute roles={["mentor"]}>
                  <BreakoutRoomsApp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/intern/:id"
              element={
                <ProtectedRoute roles={["mentor"]}>
                  <InternDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/:tab"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/onboarding"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminOnboardingList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/onboarding/:id"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminOnboardingDetails />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;