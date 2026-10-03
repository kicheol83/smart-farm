import { MenuItem, Select } from "@mui/material";
import { LANGS, type Lang } from "./core";
import { useI18n } from "./I18nProvider";

const LABELS: Record<Lang, string> = { ko: "한국어", en: "English", uz: "O'zbekcha" };

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();

  return (
    <Select
      size="small"
      value={lang}
      onChange={(event) => setLang(event.target.value as Lang)}
      inputProps={{ "aria-label": t("common.language") }}
      sx={{ borderRadius: 2, fontSize: 13, "& .MuiSelect-select": { py: 0.75 } }}
    >
      {LANGS.map((option) => (
        <MenuItem key={option} value={option} sx={{ fontSize: 13 }}>
          {LABELS[option]}
        </MenuItem>
      ))}
    </Select>
  );
}
