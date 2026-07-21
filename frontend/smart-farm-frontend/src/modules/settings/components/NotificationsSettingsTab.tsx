import { useState } from "react";
import { Box, Typography, TextField, MenuItem } from "@mui/material";
import { NotificationToggleRow } from "./NotificationToggleRow";

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
}

interface NotificationsSettingsTabProps {
  data?: NotificationSettingsData;
  onUpdate: (
    patch: Partial<{
      channels: Partial<NotificationChannels>;
      criticalAlerts: boolean;
      warningAlerts: boolean;
      infoAlerts: boolean;
      deviceOfflineAlerts: boolean;
      reportReadyAlerts: boolean;
    }>,
  ) => void;
}

/**
 * Figma "Settings / Notifications and sounds" tab.
 *
 * DIQQAT: "Floating Notifications", "Lock Screen Notifications",
 * "Notifications Management", "Every X Message will trigger the event",
 * "sent once per Y" — bularning hech biri backendda yo'q, toggle'lari
 * disabled (bosilmaydi) holatda ko'rsatiladi.
 */
export function NotificationsSettingsTab({
  data,
  onUpdate,
}: NotificationsSettingsTabProps) {
  const [everyN, setEveryN] = useState(1);
  const [oncePer, setOncePer] = useState(1);

  if (!data) {
    return (
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          color: "text.secondary",
        }}
      >
        Yuklanmoqda...
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
        Device Notifications
      </Typography>

      <NotificationToggleRow
        label="Connection status notification"
        checked={data.deviceOfflineAlerts}
        onChange={(v) => onUpdate({ deviceOfflineAlerts: v })}
      />
      <NotificationToggleRow
        label="Floating Notifications"
        description="Allow notifications to appear as floating pop-ups on top of other screens for faster visibility."
        checked={false}
        disabled
      />
      <NotificationToggleRow
        label="Lock Screen Notifications"
        description="Allow notifications to appear on the lock screen for quick access and visibility."
        checked={false}
        disabled
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
        Event Alerts Notifications
      </Typography>

      <NotificationToggleRow
        label="Deliver push notifications as alerts"
        description="When turned on, push notification will use critical alerts sounds."
        checked={data.channels.push}
        onChange={(v) => onUpdate({ channels: { push: v } })}
      />
      <NotificationToggleRow
        label="Notifications Management"
        description="When turned ON, end-users will access advanced notification management for this event."
        checked={false}
        disabled
      />
      <NotificationToggleRow
        label="Email Notifications"
        description="We will send you notification to inform you of any updates/changes as events occur for you."
        checked={data.channels.email}
        onChange={(v) => onUpdate({ channels: { email: v } })}
      />

      {/* Bonus — Figma'da yo'q, lekin backend'da HAQIQIY mavjud alertlar */}
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
        Alert Severity (backend'da qo'shimcha mavjud)
      </Typography>
      <NotificationToggleRow
        label="Critical Alerts"
        checked={data.criticalAlerts}
        onChange={(v) => onUpdate({ criticalAlerts: v })}
      />
      <NotificationToggleRow
        label="Warning Alerts"
        checked={data.warningAlerts}
        onChange={(v) => onUpdate({ warningAlerts: v })}
      />
      <NotificationToggleRow
        label="Info Alerts"
        checked={data.infoAlerts}
        onChange={(v) => onUpdate({ infoAlerts: v })}
      />
      <NotificationToggleRow
        label="Report Ready Alerts"
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
          Every
        </Typography>
        <TextField
          size="small"
          type="number"
          value={everyN}
          onChange={(e) => setEveryN(Number(e.target.value))}
          disabled
          sx={{ width: 70 }}
        />
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: "text.secondary",
          }}
        >
          Message will trigger the event
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
          Event will be sent to user only once per
        </Typography>
        <TextField
          select
          size="small"
          value={oncePer}
          onChange={(e) => setOncePer(Number(e.target.value))}
          disabled
          sx={{ width: 90 }}
        >
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
        </TextField>
      </Box>

      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 11,
          color: "text.secondary",
          mt: 1,
        }}
      >
        Bu ikki maydon backend'da hali mavjud emas.
      </Typography>
    </Box>
  );
}
