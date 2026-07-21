import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Card } from "@mui/material";
import { Header } from "@/components/layout/Header";
import { SettingsTabs } from "../components/SettingsTabs";
import { GeneralSettingsTab } from "../components/GeneralSettingsTab";
import { UnitSettingsTab } from "../components/UnitSettingsTab";
import { UserActionLogTab } from "../components/UserActionLogTab";
import {
  GET_MY_SETTINGS,
  UPDATE_GENERAL_SETTINGS,
  UPDATE_UNIT_SETTINGS,
  GET_MY_ACTION_LOGS_FOR_SETTINGS,
  GET_MY_NOTIFICATION_SETTINGS,
  UPDATE_NOTIFICATION_SETTINGS,
} from "../graphql/queries";
import { NotificationsSettingsTab } from "../components/NotificationsSettingsTab";

export function SettingsPage() {
  const [tab, setTab] = useState("general");
  const [activityPage, setActivityPage] = useState(1);

  const { data, refetch } = useQuery(GET_MY_SETTINGS);
  const [updateGeneral, { loading: savingGeneral }] = useMutation(
    UPDATE_GENERAL_SETTINGS,
  );
  const [updateUnits, { loading: savingUnits }] =
    useMutation(UPDATE_UNIT_SETTINGS);

  const { data: activityData } = useQuery(GET_MY_ACTION_LOGS_FOR_SETTINGS, {
    variables: { input: { page: activityPage, limit: 10 } },
    skip: tab !== "activity",
  });

  const { data: notifData } = useQuery(GET_MY_NOTIFICATION_SETTINGS, {
    skip: tab !== "notifications",
  });
  const [updateNotifications] = useMutation(UPDATE_NOTIFICATION_SETTINGS);

  const settings = data?.mySettings;

  async function handleSaveGeneral(d: { timezone: string }) {
    await updateGeneral({ variables: { input: { timezone: d.timezone } } });
    refetch();
  }

  async function handleSaveUnits(d: {
    temperatureUnit: string;
    areaUnit: string;
    waterUnit: string;
    timeFormat: string;
  }) {
    await updateUnits({ variables: { input: { units: d } } });
    refetch();
  }

  async function handleUpdateNotifications(patch: any) {
    await updateNotifications({ variables: { input: patch } });
  }

  return (
    <>
      <Header title="Settings" />

      <Card
        elevation={0}
        sx={{ borderRadius: 2, bgcolor: "background.paper", p: 3 }}
      >
        <SettingsTabs value={tab} onChange={setTab} />

        {tab === "general" && (
          <GeneralSettingsTab
            timezone={settings?.timezone}
            onSave={handleSaveGeneral}
            saving={savingGeneral}
          />
        )}

        {tab === "units" && (
          <UnitSettingsTab
            units={settings?.units}
            onSave={handleSaveUnits}
            saving={savingUnits}
          />
        )}

        {tab === "activity" && (
          <UserActionLogTab
            items={activityData?.myActionLogs?.items ?? []}
            total={activityData?.myActionLogs?.total ?? 0}
            page={activityPage}
            onPageChange={setActivityPage}
          />
        )}

        {tab === "notifications" && (
          <NotificationsSettingsTab
            data={notifData?.myNotificationSettings}
            onUpdate={handleUpdateNotifications}
          />
        )}
      </Card>
    </>
  );
}
