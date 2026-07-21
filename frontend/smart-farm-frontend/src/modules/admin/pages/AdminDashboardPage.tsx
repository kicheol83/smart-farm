import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Box, Tabs, Tab } from "@mui/material";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import AgricultureRoundedIcon from "@mui/icons-material/AgricultureRounded";
import YardRoundedIcon from "@mui/icons-material/YardRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import { Header } from "@/components/layout/Header";
import { AdminStatCard } from "../components/AdminStatCard";
import { MemberGrowthChart } from "../components/MemberGrowthChart";
import { MembersTable } from "../components/MembersTable";
import { DeviceHealthTable } from "../components/DeviceHealthTable";
import { SystemAlertsList } from "../components/SystemAlertsList";
import {
  GET_ADMIN_GLOBAL_STATS,
  GET_ADMIN_MEMBER_GROWTH_TREND,
  GET_ADMIN_MEMBERS,
  GET_ADMIN_DEVICE_HEALTH,
  GET_ADMIN_SYSTEM_ALERTS,
  UPDATE_MEMBER_ROLE,
  UPDATE_MEMBER_STATUS,
  DELETE_MEMBER,
} from "../graphql/queries";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "members", label: "Members" },
  { key: "devices", label: "Devices" },
  { key: "alerts", label: "System Alerts" },
];


export function AdminDashboardPage() {
  const [tab, setTab] = useState("overview");

  const { data: statsData } = useQuery(GET_ADMIN_GLOBAL_STATS, {
    skip: tab !== "overview",
  });
  const { data: growthData } = useQuery(GET_ADMIN_MEMBER_GROWTH_TREND, {
    variables: { input: {} },
    skip: tab !== "overview",
  });

  const [memberPage, setMemberPage] = useState(1);
  const [memberSearch, setMemberSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: membersData, refetch: refetchMembers } = useQuery(
    GET_ADMIN_MEMBERS,
    {
      variables: {
        input: {
          page: memberPage,
          limit: 20,
          search: memberSearch || undefined,
          memberRole: roleFilter || undefined,
          memberStatus: statusFilter || undefined,
        },
      },
      skip: tab !== "members",
    },
  );

  const [updateRole] = useMutation(UPDATE_MEMBER_ROLE);
  const [updateStatus] = useMutation(UPDATE_MEMBER_STATUS);
  const [deleteMember] = useMutation(DELETE_MEMBER);

  const [devicePage, setDevicePage] = useState(1);
  const [deviceStatusFilter, setDeviceStatusFilter] = useState("");

  const { data: deviceHealthData } = useQuery(GET_ADMIN_DEVICE_HEALTH, {
    variables: {
      input: {
        page: devicePage,
        limit: 20,
        deviceStatus: deviceStatusFilter || undefined,
      },
    },
    skip: tab !== "devices",
  });

  const { data: alertsData } = useQuery(GET_ADMIN_SYSTEM_ALERTS, {
    variables: { limit: 50 },
    skip: tab !== "alerts",
  });

  const stats = statsData?.adminGlobalStats;
  const growth = growthData?.adminMemberGrowthTrend;

  async function handleChangeRole(memberId: string, role: string) {
    await updateRole({ variables: { input: { memberId, memberRole: role } } });
    refetchMembers();
  }

  async function handleChangeStatus(memberId: string, status: string) {
    await updateStatus({
      variables: { input: { memberId, memberStatus: status } },
    });
    refetchMembers();
  }

  async function handleDeleteMember(memberId: string) {
    await deleteMember({ variables: { memberId } });
    refetchMembers();
  }

  return (
    <>
      <Header title="Admin Panel" />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
          "& .MuiTab-root": {
            textTransform: "none",
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 500,
          },
        }}
      >
        {TABS.map((t) => (
          <Tab key={t.key} label={t.label} value={t.key} />
        ))}
      </Tabs>

      {/* ═══ OVERVIEW ═══ */}
      {tab === "overview" && stats && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <AdminStatCard
              icon={GroupRoundedIcon}
              label="Total Members"
              value={stats.totalMembers}
              subLabel={`${stats.activeMembers} active`}
            />
            <AdminStatCard
              icon={AgricultureRoundedIcon}
              label="Total Farms"
              value={stats.totalFarms}
            />
            <AdminStatCard
              icon={YardRoundedIcon}
              label="Greenhouses"
              value={stats.totalGreenhouses}
            />
            <AdminStatCard
              icon={MemoryRoundedIcon}
              label="Total Devices"
              value={stats.totalDevices}
            />
            <AdminStatCard
              icon={WifiRoundedIcon}
              label="Online Devices"
              value={stats.onlineDevices}
              color="#35C56E"
            />
            <AdminStatCard
              icon={WifiOffRoundedIcon}
              label="Offline Devices"
              value={stats.offlineDevices}
              color="#9c9c9c"
            />
            <AdminStatCard
              icon={NotificationsActiveRoundedIcon}
              label="Critical Alerts"
              value={stats.criticalAlertsCount}
              color="#e53935"
              subLabel={`${stats.alertsLast24h} in last 24h`}
            />
            <AdminStatCard
              icon={AssignmentTurnedInRoundedIcon}
              label="Total Tasks"
              value={stats.totalTasks}
              subLabel={`${stats.completedTasks} done, ${stats.overdueTasks} overdue`}
            />
          </Box>

          {growth && (
            <MemberGrowthChart
              newRegistrations={growth.newRegistrations}
              growthPercent={growth.growthPercent}
              dataPoints={growth.dataPoints}
            />
          )}
        </Box>
      )}

      {tab === "members" && (
        <MembersTable
          items={membersData?.adminMembers?.items ?? []}
          total={membersData?.adminMembers?.total ?? 0}
          page={memberPage}
          onPageChange={setMemberPage}
          search={memberSearch}
          onSearchChange={(v) => {
            setMemberSearch(v);
            setMemberPage(1);
          }}
          roleFilter={roleFilter}
          onRoleFilterChange={(v) => {
            setRoleFilter(v);
            setMemberPage(1);
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(v) => {
            setStatusFilter(v);
            setMemberPage(1);
          }}
          onChangeRole={handleChangeRole}
          onChangeStatus={handleChangeStatus}
          onDelete={handleDeleteMember}
        />
      )}

      {tab === "devices" && (
        <DeviceHealthTable
          items={deviceHealthData?.adminDeviceHealth?.items ?? []}
          total={deviceHealthData?.adminDeviceHealth?.total ?? 0}
          page={devicePage}
          onPageChange={setDevicePage}
          statusFilter={deviceStatusFilter}
          onStatusFilterChange={(v) => {
            setDeviceStatusFilter(v);
            setDevicePage(1);
          }}
        />
      )}

      {tab === "alerts" && (
        <SystemAlertsList alerts={alertsData?.adminSystemAlerts ?? []} />
      )}
    </>
  );
}
