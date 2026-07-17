import { Box, Typography, Button } from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { format, isToday, isYesterday } from "date-fns";

interface Snapshot {
  _id: string;
  snapshotUrl: string;
  captureAt: string;
}

interface CameraPlaybackPanelProps {
  snapshots: Snapshot[];
  cameraLabel: string;
}

export function CameraPlaybackPanel({
  snapshots,
  cameraLabel,
}: CameraPlaybackPanelProps) {
  const groups = groupByDate(snapshots);

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
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Filter
        </Button>
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

      {snapshots.length === 0 && (
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: "text.secondary",
            textAlign: "center",
            py: 3,
          }}
        >
          Hali snapshot yo'q
        </Typography>
      )}
    </Box>
  );
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
