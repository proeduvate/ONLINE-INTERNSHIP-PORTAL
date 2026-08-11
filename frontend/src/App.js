import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import LandingPage from "./LandingPage";
import InternDashboard from "./InternDashboard";
import MentorDashboard from "./MentorDashboard";
import AdminDashboard from "./AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";
import Apply from "./pages/onboarding/Apply";
import Status from "./pages/onboarding/Status";
import Payment from "./pages/onboarding/Payment";
import Documents from "./pages/onboarding/Documents";
import AdminOnboardingList from "./pages/admin/onboarding/AdminOnboardingList";
import AdminOnboardingDetails from "./pages/admin/onboarding/AdminOnboardingDetails";
function App() {
  return (
    <BrowserRouter>
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
          path="/mentor"
          element={
            <ProtectedRoute roles={["mentor"]}>
              <MentorDashboard />
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
    </BrowserRouter>
  );
}

export default App;