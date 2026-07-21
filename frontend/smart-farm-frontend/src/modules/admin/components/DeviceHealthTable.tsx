import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Chip,
  TextField,
  MenuItem,
  Pagination,
} from "@mui/material";
import { format } from "date-fns";

interface DeviceHealthItem {
  deviceId: string;
  deviceName: string;
  deviceStatus: string;
  deviceType: string;
  greenHouseName: string;
  farmName: string;
  ownerEmail: string;
  updatedAt: string;
}

interface DeviceHealthTableProps {
  items: DeviceHealthItem[];
  total: number;
  page: number;
  onPageChange: (p: number) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
}

const PAGE_SIZE = 20;
const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  ONLINE: { color: "#1a7a4c", bg: "rgba(53,197,110,0.14)" },
  OFFLINE: { color: "#6b6b6b", bg: "rgba(156,156,156,0.14)" },
  MAINTENANCE: { color: "#a06a0a", bg: "rgba(249,173,25,0.14)" },
  ERROR: { color: "#c62828", bg: "rgba(229,57,53,0.14)" },
};

export function DeviceHealthTable({
  items,
  total,
  page,
  onPageChange,
  statusFilter,
  onStatusFilterChange,
}: DeviceHealthTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="ONLINE">Online</MenuItem>
          <MenuItem value="OFFLINE">Offline</MenuItem>
          <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
          <MenuItem value="ERROR">Error</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {[
                "Device",
                "Type",
                "Status",
                "Greenhouse",
                "Farm",
                "Owner",
                "Last Updated",
              ].map((c) => (
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
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((d) => {
              const style =
                STATUS_COLOR[d.deviceStatus] ?? STATUS_COLOR.OFFLINE;
              return (
                <TableRow key={d.deviceId} hover>
                  <TableCell
                    sx={{
                      fontFamily: "Satoshi, sans-serif",
                      fontWeight: 500,
                      fontSize: 13,
                      color: "text.primary",
                      borderColor: "divider",
                    }}
                  >
                    {d.deviceName}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  >
                    {d.deviceType}
                  </TableCell>
                  <TableCell sx={{ borderColor: "divider" }}>
                    <Chip
                      label={d.deviceStatus}
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
                    {d.greenHouseName}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  >
                    {d.farmName}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  >
                    {d.ownerEmail}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  >
                    {format(new Date(d.updatedAt), "MMM dd, HH:mm")}
                  </TableCell>
                </TableRow>
              );
            })}

            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  sx={{ textAlign: "center", py: 4, borderColor: "divider" }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                    }}
                  >
                    Qurilma topilmadi
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => onPageChange(p)}
            size="small"
          />
        </Box>
      )}
    </Box>
  );
}
