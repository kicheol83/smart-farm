import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Typography,
  Pagination,
} from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { format } from "date-fns";
import { t } from "@/i18n/core";

interface ActionLogItem {
  _id: string;
  actionType: string;
  actionResource: string;
  description: string;
  memberFullName: string;
  device?: string;
  ipAddress?: string;
  actionCode?: string;
  createdAt: string;
}

interface UserActionLogTabProps {
  items: ActionLogItem[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}

const COLUMNS = [
  t("txt.user_name"),
  t("txt.time"),
  t("txt.device"),
  t("txt.action_code"),
  t("txt.ip_address"),
  t("txt.action_name"),
];
const PAGE_SIZE = 10;

export function UserActionLogTab({
  items,
  total,
  page,
  onPageChange,
}: UserActionLogTabProps) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Box>
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
            {items.map((a) => (
              <TableRow key={a._id} hover>
                <TableCell
                  sx={{
                    fontFamily: "Satoshi, sans-serif",
                    fontWeight: 500,
                    fontSize: 13,
                    color: "text.primary",
                    borderColor: "divider",
                  }}
                >
                  {a.memberFullName}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: "text.secondary",
                    borderColor: "divider",
                  }}
                >
                  {format(new Date(a.createdAt), "hh:mm a")}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: "text.secondary",
                    borderColor: "divider",
                  }}
                >
                  {a.device ?? "—"}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: "text.secondary",
                    borderColor: "divider",
                  }}
                >
                  {a.actionCode ?? "—"}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: "text.secondary",
                    borderColor: "divider",
                  }}
                >
                  {a.ipAddress ?? "—"}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: "text.primary",
                    borderColor: "divider",
                  }}
                >
                  {a.description}
                </TableCell>
                <TableCell sx={{ borderColor: "divider" }}>
                  <IconButton size="small">
                    <MoreVertRoundedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {items.length === 0 && (
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
                    {t("txt.no_activity_yet")}
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
