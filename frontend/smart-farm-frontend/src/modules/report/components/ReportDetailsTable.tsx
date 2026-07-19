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
} from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { format } from "date-fns";

interface SavedReport {
  _id: string;
  reportsType: string;
  generatedAt: string;
}

interface ReportDetailsTableProps {
  reports: SavedReport[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const COLUMNS = [
  "Date",
  "Plant",
  "Area",
  "Health",
  "Status",
  "Harvest Prediction",
  "Moisture",
  "Humidity",
  "Pest Disease",
  "Description",
];

export function ReportDetailsTable({
  reports,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ReportDetailsTableProps) {
  const totalPages = Math.max(1, Math.ceil(reports.length / pageSize));
  const paged = reports.slice((page - 1) * pageSize, page * pageSize);

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
            {paged.map((r) => (
              <TableRow key={r._id} hover>
                <TableCell
                  sx={{
                    fontFamily: "Satoshi, sans-serif",
                    fontSize: 13,
                    color: "text.primary",
                    borderColor: "divider",
                    whiteSpace: "nowrap",
                  }}
                >
                  {format(new Date(r.generatedAt), "dd MMM yy")}
                </TableCell>
                {COLUMNS.slice(1).map((c) => (
                  <TableCell
                    key={c}
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  >
                    —
                  </TableCell>
                ))}
                <TableCell sx={{ borderColor: "divider" }}>
                  <IconButton size="small">
                    <MoreVertRoundedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {paged.length === 0 && (
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
                    Hali saqlangan report yo'q
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

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
            Showing
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
            Out of {reports.length}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <PageButton
            label="Back"
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
            label="Next"
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
