import { useState } from "react";
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  IconButton,
  Menu,
  Pagination,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { format } from "date-fns";

interface Member {
  _id: string;
  memberFullName: string;
  memberEmail: string;
  memberRole: string;
  memberStatus: string;
  memberAvatar?: string;
  farmsCount: number;
  createdAt: string;
}

interface MembersTableProps {
  items: Member[];
  total: number;
  page: number;
  onPageChange: (p: number) => void;
  search: string;
  onSearchChange: (v: string) => void;
  roleFilter: string;
  onRoleFilterChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  onChangeRole: (memberId: string, role: string) => void;
  onChangeStatus: (memberId: string, status: string) => void;
  onDelete: (memberId: string) => void;
}

const PAGE_SIZE = 20;

const ROLE_COLOR: Record<string, string> = {
  ADMIN: "#c62828",
  WORKER: "#1565c0",
};
const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  ACTIVE: { color: "#1a7a4c", bg: "rgba(53,197,110,0.14)" },
  INACTIVE: { color: "#6b6b6b", bg: "rgba(156,156,156,0.14)" },
  SUSPENDED: { color: "#c62828", bg: "rgba(229,57,53,0.14)" },
};

export function MembersTable({
  items,
  total,
  page,
  onPageChange,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onChangeRole,
  onChangeStatus,
  onDelete,
}: MembersTableProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuMember, setMenuMember] = useState<Member | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 260 }}
        />
        <TextField
          select
          size="small"
          label="Role"
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All Roles</MenuItem>
          <MenuItem value="ADMIN">Admin</MenuItem>
          <MenuItem value="WORKER">Worker</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="INACTIVE">Inactive</MenuItem>
          <MenuItem value="SUSPENDED">Suspended</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {["Member", "Role", "Status", "Farms", "Joined", ""].map((c) => (
                <TableCell
                  key={c}
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 12,
                    color: "text.secondary",
                    borderColor: "divider",
                  }}
                >
                  {c}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((m) => {
              const statusStyle =
                STATUS_COLOR[m.memberStatus] ?? STATUS_COLOR.ACTIVE;
              return (
                <TableRow key={m._id} hover>
                  <TableCell sx={{ borderColor: "divider" }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        src={m.memberAvatar}
                        sx={{ width: 32, height: 32, fontSize: 13 }}
                      >
                        {m.memberFullName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "Satoshi, sans-serif",
                            fontWeight: 500,
                            fontSize: 13,
                            color: "text.primary",
                          }}
                        >
                          {m.memberFullName}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: 12,
                            color: "text.secondary",
                          }}
                        >
                          {m.memberEmail}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderColor: "divider" }}>
                    <Chip
                      label={m.memberRole}
                      size="small"
                      sx={{
                        bgcolor: "action.selected",
                        color: ROLE_COLOR[m.memberRole] ?? "text.primary",
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ borderColor: "divider" }}>
                    <Chip
                      label={m.memberStatus}
                      size="small"
                      sx={{
                        bgcolor: statusStyle.bg,
                        color: statusStyle.color,
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.primary",
                      borderColor: "divider",
                    }}
                  >
                    {m.farmsCount}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  >
                    {format(new Date(m.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell sx={{ borderColor: "divider" }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setMenuAnchor(e.currentTarget);
                        setMenuMember(m);
                      }}
                    >
                      <MoreVertRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}

            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  sx={{ textAlign: "center", py: 4, borderColor: "divider" }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                    }}
                  >
                    A'zo topilmadi
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

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {menuMember?.memberRole !== "ADMIN" && (
          <MenuItem
            onClick={() => {
              onChangeRole(menuMember!._id, "ADMIN");
              setMenuAnchor(null);
            }}
          >
            Make Admin
          </MenuItem>
        )}
        {menuMember?.memberRole !== "WORKER" && (
          <MenuItem
            onClick={() => {
              onChangeRole(menuMember!._id, "WORKER");
              setMenuAnchor(null);
            }}
          >
            Make Worker
          </MenuItem>
        )}
        {menuMember?.memberStatus !== "ACTIVE" && (
          <MenuItem
            onClick={() => {
              onChangeStatus(menuMember!._id, "ACTIVE");
              setMenuAnchor(null);
            }}
          >
            Activate
          </MenuItem>
        )}
        {menuMember?.memberStatus !== "SUSPENDED" && (
          <MenuItem
            onClick={() => {
              onChangeStatus(menuMember!._id, "SUSPENDED");
              setMenuAnchor(null);
            }}
          >
            Suspend
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            onDelete(menuMember!._id);
            setMenuAnchor(null);
          }}
          sx={{ color: "error.main" }}
        >
          Delete Member
        </MenuItem>
      </Menu>
    </Box>
  );
}
