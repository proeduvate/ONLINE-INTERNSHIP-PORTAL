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