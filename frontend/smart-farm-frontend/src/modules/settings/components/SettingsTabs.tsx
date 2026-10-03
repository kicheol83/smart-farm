import { Tabs, Tab } from "@mui/material";
import { t } from "@/i18n/core";

const TABS = [
  { key: "general", label: t("txt.general") },
  { key: "units", label: t("txt.unit_customization") },
  { key: "activity", label: t("txt.user_actions_log") },
  { key: "notifications", label: t("txt.notifications_and_sounds") },
];

interface SettingsTabsProps {
  value: string;
  onChange: (v: string) => void;
}

export function SettingsTabs({ value, onChange }: SettingsTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, v) => onChange(v)}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        mb: 3,
        "& .MuiTab-root": {
          textTransform: "none",
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 500,
          fontSize: 14,
        },
      }}
    >
      {TABS.map((t) => (
        <Tab key={t.key} label={t.label} value={t.key} />
      ))}
    </Tabs>
  );
}
