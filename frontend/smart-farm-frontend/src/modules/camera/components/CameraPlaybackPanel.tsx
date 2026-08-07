import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";

interface Snapshot {
  _id: string;
  snapshotUrl: string;
  captureAt: string;
}

interface CameraPlaybackPanelProps {
  snapshots: Snapshot[];
  cameraLabel: string;
}

type FilterOption = "ALL" | "TODAY" | "YESTERDAY" | "THIS_WEEK";

const FILTER_LABEL: Record<FilterOption, string> = {
  ALL: "All",
  TODAY: "Today",
  YESTERDAY: "Yesterday",
  THIS_WEEK: "This Week",
};

export function CameraPlaybackPanel({
  snapshots,
  cameraLabel,
}: CameraPlaybackPanelProps) {
  const [filter, setFilter] = useState<FilterOption>("ALL");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const filtered = applyFilter(snapshots, filter);
  const groups = groupByDate(filtered);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        bgcolor: "background.paper",
        borderRadius: 2,
        p: 2.5,
        height: "100%",
        overflowY: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "text.primary",
          }}
        >
          Playback
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<TuneRoundedIcon fontSize="small" />}
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {FILTER_LABEL[filter]}
        </Button>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          {(Object.keys(FILTER_LABEL) as FilterOption[]).map((f) => (
            <MenuItem
              key={f}
              onClick={() => {
                setFilter(f);
                setMenuAnchor(null);
              }}
            >
              {filter === f && (
                <ListItemIcon>
                  <CheckRoundedIcon fontSize="small" />
                </ListItemIcon>
              )}
              <ListItemText inset={filter !== f}>
                {FILTER_LABEL[f]}
              </ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {groups.map(([label, items]) => (
        <Box
          key={label}
          sx={{ display: "flex", flexDirection: "column", gap: 1 }}
        >
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "text.secondary",
            }}
          >
            {label}
          </Typography>

          {items.map((s) => (
            <Box
              key={s._id}
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "center",
                p: 1,
                borderRadius: 2,
                "&:hover": { bgcolor: "action.hover" },
                cursor: "pointer",
              }}
            >
              <Box
                component="img"
                src={s.snapshotUrl}
                alt=""
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 1.5,
                  objectFit: "cover",
                  bgcolor: "action.selected",
                }}
              />
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Satoshi, sans-serif",
                    fontWeight: 500,
                    fontSize: 13,
                    color: "text.primary",
                  }}
                >
                  {cameraLabel}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 11,
                    color: "text.secondary",
                  }}
                >
                  {format(new Date(s.captureAt), "yyyy-MM-dd hh:mm a")}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 11,
                    color: "text.secondary",
                  }}
                >
                  Recorded by {cameraLabel}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      ))}

      {filtered.length === 0 && (
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: "text.secondary",
            textAlign: "center",
            py: 3,
          }}
        >
          {snapshots.length === 0
            ? "Hali snapshot yo'q"
            : "Bu davr uchun snapshot topilmadi"}
        </Typography>
      )}
    </Box>
  );
}

function applyFilter(snapshots: Snapshot[], filter: FilterOption): Snapshot[] {
  if (filter === "ALL") return snapshots;
  return snapshots.filter((s) => {
    const d = new Date(s.captureAt);
    if (filter === "TODAY") return isToday(d);
    if (filter === "YESTERDAY") return isYesterday(d);
    if (filter === "THIS_WEEK") return isThisWeek(d, { weekStartsOn: 1 });
    return true;
  });
}

function groupByDate(snapshots: Snapshot[]): [string, Snapshot[]][] {
  const today: Snapshot[] = [];
  const yesterday: Snapshot[] = [];
  const older: Record<string, Snapshot[]> = {};

  for (const s of snapshots) {
    const d = new Date(s.captureAt);
    if (isToday(d)) {
      today.push(s);
    } else if (isYesterday(d)) {
      yesterday.push(s);
    } else {
      const key = format(d, "dd MMM yyyy");
      if (!older[key]) older[key] = [];
      older[key].push(s);
    }
  }

  const result: [string, Snapshot[]][] = [];
  if (today.length) result.push(["Today", today]);
  if (yesterday.length) result.push(["Yesterday", yesterday]);
  Object.entries(older).forEach(([k, v]) => result.push([k, v]));
  return result;
}
