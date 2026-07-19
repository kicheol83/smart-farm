import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

// Auth (layout siz)
import { LoginPage } from "@/modules/auth/pages/LoginPage";
import { SplashScreenPage } from "@/modules/auth/pages/SplashScreenPage";
import { SignupPage } from "@/modules/auth/pages/SignupPage";
import { EmailVerificationPage } from "@/modules/auth/pages/EmailVerificationPage";
import { ForgotPasswordPage } from "@/modules/auth/pages/ForgotPasswordPage";
import { ForgotPasswordVerifyPage } from "@/modules/auth/pages/ForgotPasswordVerifyPage";
import { CreateNewPasswordPage } from "@/modules/auth/pages/CreateNewPasswordPage";
import { PasswordChangeSuccessPage } from "@/modules/auth/pages/PasswordChangeSuccessPage";

// Asosiy sahifalar (AppLayout ichida — Sidebar + Header bilan)
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import { DeviceListPage } from "@/modules/device/pages/DeviceListPage";
import { ReportPage } from "@/modules/report/pages/ReportPage";
import { ReportDetailsPage } from "@/modules/report/pages/ReportDetailsPage";
import { MapAreaPage } from "@/modules/map-area/pages/MapAreaPage";
import { SettingsPage } from "@/modules/settings/pages/SettingsPage";
import { ProfilePage } from "@/modules/profile/pages/ProfilePage";
import { TaskListPage } from "@/modules/task/pages/TaskListPage";
import { LiveViewPage } from "@/modules/camera/pages/LiveViewPage";
import { PlantHealthPage } from "@/modules/plant-health/pages/PlantHealthPage";
import { IrrigationPage } from "@/modules/irrigation/pages/IrrigationPage";
import { AdminDashboardPage } from "@/modules/admin/pages/AdminDashboardPage";
import { AlertsSummaryPage } from "./modules/report/pages/AlertsSummaryPage";
import { WaterUsageAnalyticsPage } from "./modules/report/pages/WaterUsageAnalyticsPage";
import { SoilMoistureTrendPage } from "./modules/report/pages/SoilMoistureTrendPage";

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
        <Route path="/report/details" element={<ReportDetailsPage />} />
        <Route path="/report/alerts" element={<AlertsSummaryPage />} />
        <Route
          path="/report/water-usage"
          element={<WaterUsageAnalyticsPage />}
        />
        <Route
          path="/report/soil-moisture"
          element={<SoilMoistureTrendPage />}
        />
        {/* <Route
          path="/report/plant-health"
          element={<OverallPlantHealthPage />}
        /> */}
        <Route path="/map-area" element={<MapAreaPage />} />
        <Route path="/settings/*" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/tasks" element={<TaskListPage />} />
        <Route path="/live-view" element={<LiveViewPage />} />
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
