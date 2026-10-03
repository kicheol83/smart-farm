import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  Typography,
  Chip,
} from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { format } from "date-fns";
import { t } from "@/i18n/core";
import { dateLocale } from "@/i18n/core";

type EntryStatus = "DONE" | "OPTIMAL" | "ATTENTION";

interface ReportEntry {
  _id: string;
  entryDate: string;
  sectionName: string;
  plantName?: string;
  areaM2?: number;
  healthIndex: number;
  status: EntryStatus;
  harvestPrediction?: string;
  soilMoisture?: number;
  humidity?: number;
  pestDisease?: string;
  description?: string;
}

interface ReportDetailsTableProps {
  entries: ReportEntry[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const STATUS_STYLE: Record<
  EntryStatus,
  { label: string; color: string; bg: string }
> = {
  DONE: { label: t("txt.done"), color: "#1a7a4c", bg: "rgba(53,197,110,0.14)" },
  OPTIMAL: { label: t("txt.optimal"), color: "#a06a0a", bg: "rgba(249,173,25,0.14)" },
  ATTENTION: {
    label: t("txt.attention"),
    color: "#c62828",
    bg: "rgba(229,57,53,0.14)",
  },
};

const COLUMNS = [
  t("txt.date"),
  t("txt.plant"),
  t("txt.area"),
  t("txt.health"),
  t("txt.status"),
  t("txt.harvest_prediction"),
  t("txt.moisture"),
  t("txt.humidity"),
  t("txt.pest_disease"),
  t("txt.description"),
];

export function ReportDetailsTable({
  entries,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ReportDetailsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Box
      sx={{ bgcolor: "background.paper", borderRadius: 2, overflow: "hidden" }}
    >
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {COLUMNS.map((c) => (
                <TableCell
                  key={c}
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 12,
                    color: "text.secondary",
                    borderColor: "divider",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c}
                </TableCell>
              ))}
              <TableCell sx={{ borderColor: "divider" }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((e) => {
              const style = STATUS_STYLE[e.status];
              return (
                <TableRow key={e._id} hover>
                  <TableCell
                    sx={{
                      fontFamily: "Satoshi, sans-serif",
                      fontSize: 13,
                      color: "text.primary",
                      borderColor: "divider",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {format(new Date(e.entryDate), "PP", { locale: dateLocale() })}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  >
                    {e.plantName ?? "—"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  >
                    {e.areaM2 !== undefined ? `${e.areaM2} m²` : "—"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  >
                    {Math.round(e.healthIndex)}%
                  </TableCell>
                  <TableCell sx={{ borderColor: "divider" }}>
                    <Chip
                      label={style.label}
                      size="small"
                      sx={{
                        bgcolor: style.bg,
                        color: style.color,
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  >
                    {e.harvestPrediction
                      ? format(new Date(e.harvestPrediction), "PP", { locale: dateLocale() })
                      : "—"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  >
                    {e.soilMoisture !== undefined
                      ? `${Math.round(e.soilMoisture)}%`
                      : "—"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  >
                    {e.humidity !== undefined
                      ? `${Math.round(e.humidity)}%`
                      : "—"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  >
                    {e.pestDisease ?? t("txt.no_pest")}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  >
                    {e.description ?? "—"}
                  </TableCell>
                  <TableCell sx={{ borderColor: "divider" }}>
                    <IconButton size="small">
                      <MoreVertRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}

            {entries.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length + 1}
                  sx={{ textAlign: "center", py: 4, borderColor: "divider" }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                    }}
                  >
                    {t("txt.no_report_entries_yet")}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Pastki sahifalash */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            {t("txt.showing")}
          </Typography>
          <Select
            size="small"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            sx={{ fontSize: 13, height: 32 }}
          >
            {[10, 20, 50].map((n) => (
              <MenuItem key={n} value={n} sx={{ fontSize: 13 }}>
                {n}
              </MenuItem>
            ))}
          </Select>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Out of {total}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <PageButton
            label={t("txt.back")}
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          />
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(
            (p) => (
              <PageButton
                key={p}
                label={String(p)}
                active={p === page}
                onClick={() => onPageChange(p)}
              />
            ),
          )}
          {totalPages > 3 && (
            <Typography sx={{ px: 1, color: "text.secondary" }}>...</Typography>
          )}
          {totalPages > 3 && (
            <PageButton
              label={String(totalPages)}
              active={page === totalPages}
              onClick={() => onPageChange(totalPages)}
            />
          )}
          <PageButton
            label={t("txt.next")}
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
          />
        </Box>
      </Box>
    </Box>
  );
}

function PageButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        border: "none",
        borderRadius: 1.5,
        px: 1.25,
        py: 0.75,
        fontFamily: "Inter, sans-serif",
        fontSize: 13,
        cursor: disabled ? "default" : "pointer",
        bgcolor: active ? "text.primary" : "transparent",
        color: active
          ? "background.paper"
          : disabled
            ? "text.disabled"
            : "text.primary",
        "&:hover": { bgcolor: active ? "text.primary" : "action.hover" },
      }}
    >
      {label}
    </Box>
  );
}
