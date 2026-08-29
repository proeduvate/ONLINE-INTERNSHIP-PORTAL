import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import InternDashboard from "../pages/Dashboard/InternDashboard";
import MentorDashboard from "../pages/Dashboard/MentorDashboard";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import PrivateRoute from "./PrivateRoute";
import Apply from "../pages/onboarding/Apply";
import Status from "../pages/onboarding/Status";
import Payment from "../pages/onboarding/Payment";
import Documents from "../pages/onboarding/Documents";
import AdminOnboardingList from "../pages/admin/onboarding/AdminOnboardingList";
import AdminOnboardingDetails from "../pages/admin/onboarding/AdminOnboardingDetails";

export default function AppRouter() {
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
            <PrivateRoute roles={["intern"]}>
              <InternDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/mentor"
          element={
            <PrivateRoute roles={["mentor"]}>
              <MentorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/onboarding"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminOnboardingList />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/onboarding/:id"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminOnboardingDetails />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
