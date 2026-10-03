import { useState } from "react";
import { Box, Typography, TextField, MenuItem } from "@mui/material";
import { NotificationToggleRow } from "./NotificationToggleRow";
import { t } from "@/i18n/core";

interface NotificationChannels {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

interface NotificationSettingsData {
  enabled: boolean;
  channels: NotificationChannels;
  criticalAlerts: boolean;
  warningAlerts: boolean;
  infoAlerts: boolean;
  deviceOfflineAlerts: boolean;
  reportReadyAlerts: boolean;
  floatingNotifications?: boolean;
  lockScreenNotifications?: boolean;
  notificationsManagement?: boolean;
  triggerEveryNMessages?: number;
  sendOncePerDays?: number;
}

type UpdatePatch = Partial<{
  channels: Partial<NotificationChannels>;
  criticalAlerts: boolean;
  warningAlerts: boolean;
  infoAlerts: boolean;
  deviceOfflineAlerts: boolean;
  reportReadyAlerts: boolean;
  floatingNotifications: boolean;
  lockScreenNotifications: boolean;
  notificationsManagement: boolean;
  triggerEveryNMessages: number;
  sendOncePerDays: number;
}>;

interface NotificationsSettingsTabProps {
  data?: NotificationSettingsData;
  onUpdate: (patch: UpdatePatch) => void;
}

export function NotificationsSettingsTab({
  data,
  onUpdate,
}: NotificationsSettingsTabProps) {
  const [everyN, setEveryN] = useState(data?.triggerEveryNMessages ?? 1);
  const [oncePer, setOncePer] = useState(data?.sendOncePerDays ?? 1);

  if (!data) {
    return (
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          color: "text.secondary",
        }}
      >
        {t("txt.loading")}
      </Typography>
    );
  }

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          fontSize: 15,
          color: "text.primary",
          mb: 1,
        }}
      >
        {t("txt.device_notifications")}
      </Typography>

      <NotificationToggleRow
        label={t("txt.connection_status_notification")}
        checked={data.deviceOfflineAlerts}
        onChange={(v) => onUpdate({ deviceOfflineAlerts: v })}
      />
      <NotificationToggleRow
        label={t("txt.floating_notifications")}
        description={t("txt.allow_notifications_to_appear_as_floating_pop_up")}
        checked={data.floatingNotifications ?? true}
        onChange={(v) => onUpdate({ floatingNotifications: v })}
      />
      <NotificationToggleRow
        label={t("txt.lock_screen_notifications")}
        description={t("txt.allow_notifications_to_appear_on_the_lock_screen")}
        checked={data.lockScreenNotifications ?? true}
        onChange={(v) => onUpdate({ lockScreenNotifications: v })}
      />

      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          fontSize: 15,
          color: "text.primary",
          mt: 3,
          mb: 1,
        }}
      >
        {t("txt.event_alerts_notifications")}
      </Typography>

      <NotificationToggleRow
        label={t("txt.deliver_push_notifications_as_alerts")}
        description={t("txt.when_turned_on_push_notifications_use_critical_a")}
        checked={data.channels.push}
        onChange={(v) => onUpdate({ channels: { push: v } })}
      />
      <NotificationToggleRow
        label={t("txt.notifications_management")}
        description={t("txt.when_turned_on_advanced_notification_management_")}
        checked={data.notificationsManagement ?? false}
        onChange={(v) => onUpdate({ notificationsManagement: v })}
      />
      <NotificationToggleRow
        label={t("txt.email_notifications")}
        description={t("txt.we_will_email_you_when_relevant_events_occur")}
        checked={data.channels.email}
        onChange={(v) => onUpdate({ channels: { email: v } })}
      />

      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          fontSize: 15,
          color: "text.primary",
          mt: 3,
          mb: 1,
        }}
      >
        {t("txt.alert_severity")}
      </Typography>
      <NotificationToggleRow
        label={t("txt.critical_alerts")}
        checked={data.criticalAlerts}
        onChange={(v) => onUpdate({ criticalAlerts: v })}
      />
      <NotificationToggleRow
        label={t("txt.warning_alerts")}
        checked={data.warningAlerts}
        onChange={(v) => onUpdate({ warningAlerts: v })}
      />
      <NotificationToggleRow
        label={t("txt.info_alerts")}
        checked={data.infoAlerts}
        onChange={(v) => onUpdate({ infoAlerts: v })}
      />
      <NotificationToggleRow
        label={t("txt.report_ready_alerts")}
        checked={data.reportReadyAlerts}
        onChange={(v) => onUpdate({ reportReadyAlerts: v })}
      />

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          mt: 3,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: "text.secondary",
          }}
        >
          {t("txt.every")}
        </Typography>
        <TextField
          size="small"
          type="number"
          value={everyN}
          onChange={(e) => {
            const v = Number(e.target.value);
            setEveryN(v);
            onUpdate({ triggerEveryNMessages: v });
          }}
          inputProps={{ min: 1 }}
          sx={{ width: 70 }}
        />
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: "text.secondary",
          }}
        >
          {t("txt.message_will_trigger_the_event")}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          mt: 1.5,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: "text.secondary",
          }}
        >
          {t("txt.event_will_be_sent_only_once_per")}
        </Typography>
        <TextField
          select
          size="small"
          value={oncePer}
          onChange={(e) => {
            const v = Number(e.target.value);
            setOncePer(v);
            onUpdate({ sendOncePerDays: v });
          }}
          sx={{ width: 110 }}
        >
          <MenuItem value={1}>{t("txt.1_day")}</MenuItem>
          <MenuItem value={2}>{t("txt.2_days")}</MenuItem>
          <MenuItem value={7}>{t("txt.7_days")}</MenuItem>
        </TextField>
      </Box>
    </Box>
  );
}
