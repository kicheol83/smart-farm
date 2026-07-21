import { Tabs, Tab } from "@mui/material";

const TABS = [
  { key: "general", label: "General" },
  { key: "units", label: "Unit customization" },
  { key: "activity", label: "User actions log" },
  { key: "notifications", label: "Notifications and sounds" },
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
