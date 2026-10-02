import { useQuery } from "@apollo/client";
import { Box, Chip, Paper, Typography } from "@mui/material";
import { GET_ACTUATORS_BY_GREENHOUSE } from "@/modules/automation/graphql/queries";
import { useLive } from "@/lib/live/LiveProvider";

type Actuator = {
  _id: string;
  actuatorName: string;
  actuatorType: string;
  actuatorStatus: string;
  autoOffAt?: string | null;
};

export function ClosedLoopCard({ greenHouseId }: { greenHouseId: string }) {
  const { actuatorEvents, readings } = useLive();
  const { data } = useQuery(GET_ACTUATORS_BY_GREENHOUSE, {
    variables: { greenHouseId },
    skip: !greenHouseId,
    pollInterval: 30000,
  });

  const actuators: Actuator[] = data?.actuatorsByGreenhouse ?? [];
  const latestStatus = new Map<string, string>();
  for (const event of [...actuatorEvents].reverse()) {
    latestStatus.set(event.actuatorId, event.status);
  }
  const soil = readings.SOIL_MOISTURE?.value;

  return (
    <Paper sx={{ p: 2.5, borderRadius: 3 }} elevation={0}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Closed loop · sensor → rule → actuator
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Soil moisture now: {soil !== undefined ? `${soil}%` : "—"}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
        {actuators.length === 0 && (
          <Typography color="text.secondary">No actuators configured for this greenhouse.</Typography>
        )}
        {actuators.map((actuator) => {
          const status = latestStatus.get(actuator._id) ?? actuator.actuatorStatus;
          return (
            <Box
              key={actuator._id}
              sx={{ border: 1, borderColor: status === "ON" ? "success.main" : "divider", borderRadius: 2, px: 2, py: 1.25, minWidth: 180 }}
            >
              <Typography sx={{ fontWeight: 600 }}>{actuator.actuatorName}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                <Chip size="small" label={status} color={status === "ON" ? "success" : "default"} />
                <Typography variant="caption" color="text.secondary">
                  {actuator.actuatorType}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
        Automation events (this session)
      </Typography>
      {actuatorEvents.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Waiting for an automation rule to fire…
        </Typography>
      )}
      {actuatorEvents.map((event) => (
        <Box
          key={`${event.timestamp}-${event.actuatorId}`}
          sx={{ display: "flex", gap: 1.5, alignItems: "center", py: 0.75, borderBottom: 1, borderColor: "divider" }}
        >
          <Chip size="small" label={event.status} color={event.status === "ON" ? "success" : "default"} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {event.actuatorName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            {event.reason ?? "Manual control"}
            {event.waterAmount ? ` · ${event.waterAmount} L recorded` : ""}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(event.timestamp).toLocaleTimeString()}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}
