import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

import { LoginPage } from "@/modules/auth/pages/LoginPage";
import { SplashScreenPage } from "@/modules/auth/pages/SplashScreenPage";
import { SignupPage } from "@/modules/auth/pages/SignupPage";
import { EmailVerificationPage } from "@/modules/auth/pages/EmailVerificationPage";
import { ForgotPasswordPage } from "@/modules/auth/pages/ForgotPasswordPage";
import { ForgotPasswordVerifyPage } from "@/modules/auth/pages/ForgotPasswordVerifyPage";
import { CreateNewPasswordPage } from "@/modules/auth/pages/CreateNewPasswordPage";
import { PasswordChangeSuccessPage } from "@/modules/auth/pages/PasswordChangeSuccessPage";

import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import { DeviceListPage } from "@/modules/device/pages/DeviceListPage";
import { ReportPage } from "@/modules/report/pages/ReportPage";
import { MapAreaPage } from "@/modules/map-area/pages/MapAreaPage";
import { SettingsPage } from "@/modules/settings/pages/SettingsPage";
import { ProfilePage } from "@/modules/profile/pages/ProfilePage";
import { TaskListPage } from "@/modules/task/pages/TaskListPage";
import { PlantHealthPage } from "@/modules/plant-health/pages/PlantHealthPage";
import { IrrigationPage } from "@/modules/irrigation/pages/IrrigationPage";
import { AdminDashboardPage } from "@/modules/admin/pages/AdminDashboardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreenPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signup/verify" element={<EmailVerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/forgot-password/verify"
        element={<ForgotPasswordVerifyPage />}
      />
      <Route
        path="/forgot-password/reset"
        element={<CreateNewPasswordPage />}
      />
      <Route
        path="/forgot-password/success"
        element={<PasswordChangeSuccessPage />}
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/devices" element={<DeviceListPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/map-area" element={<MapAreaPage />} />
        <Route path="/settings/*" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/tasks" element={<TaskListPage />} />
        <Route path="/plant-health" element={<PlantHealthPage />} />
        <Route path="/irrigation" element={<IrrigationPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
