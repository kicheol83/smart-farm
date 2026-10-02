import { useQuery } from "@apollo/client";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { Header } from "@/components/layout/Header";
import { useActiveGreenhouse } from "@/lib/useActiveGreenhouse";
import { useLive } from "@/lib/live/LiveProvider";
import { GET_PIPELINE_OVERVIEW } from "../graphql/queries";
import { PipelineFlow } from "../components/PipelineFlow";

type PipelineSensor = {
  sensorId: string;
  sensorType: string;
  unit?: string | null;
  deviceName: string;
  mean?: number | null;
  std?: number | null;
  sampleSize: number;
  lastValue?: number | null;
  lastReadingAt?: string | null;
  anomaliesLast24h: number;
};

type PipelineAnomaly = {
  _id: string;
  sensorType: string;
  value: number;
  zScore: number;
  meanValue: number;
  severity: string;
  detectedAt: string;
};

type PipelineDevice = {
  deviceId: string;
  deviceName: string;
  deviceStatus: string;
  lastSeenAt?: string | null;
  sensorCount: number;
};

type ThroughputPoint = { hour: string; readings: number; anomalies: number };

const number = new Intl.NumberFormat();

function formatValue(value: number | null | undefined, digits = 2): string {
  return value === null || value === undefined ? "—" : number.format(Number(value.toFixed(digits)));
}

function MetricCard({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: string }) {
  return (
    <Paper sx={{ p: 2.5, borderRadius: 3, flex: "1 1 180px" }} elevation={0}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color: accent ?? "text.primary", mt: 0.5 }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
    </Paper>
  );
}

function zScoreColor(z: number | null): "default" | "warning" | "error" | "success" {
  if (z === null) return "default";
  const absolute = Math.abs(z);
  if (absolute >= 3) return "error";
  if (absolute >= 2) return "warning";
  return "success";
}

export function PipelinePage() {
  const { greenHouseId } = useActiveGreenhouse();
  const { connected, readings, lastUpdate, messagesPerMinute, messageCount } = useLive();

  const { data, loading } = useQuery(GET_PIPELINE_OVERVIEW, {
    variables: { greenHouseId },
    skip: !greenHouseId,
    pollInterval: 30000,
  });

  const overview = data?.pipelineOverview;
  const throughput: ThroughputPoint[] = overview?.throughput ?? [];
  const hours = throughput.map((point) =>
    new Date(point.hour).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Header title="IoT Pipeline" />

      <Paper sx={{ p: 2.5, borderRadius: 3 }} elevation={0}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Data flow
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {connected ? `${number.format(messageCount)} readings received in this session` : "Realtime connection offline"}
          </Typography>
        </Box>
        <PipelineFlow pulseKey={lastUpdate} active={connected} />
      </Paper>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <MetricCard label="LIVE THROUGHPUT" value={`${messagesPerMinute}/min`} hint="sensor readings pushed over WebSocket" accent="#35C56E" />
        <MetricCard label="READINGS · 24H" value={overview ? number.format(overview.readingsLast24h) : "—"} hint={overview ? `${number.format(overview.readingsLastHour)} in the last hour` : undefined} />
        <MetricCard label="ANOMALIES · 24H" value={overview ? number.format(overview.anomaliesLast24h) : "—"} hint="Z-score ≥ 2 against rolling stats" accent={overview?.anomaliesLast24h ? "#F5A524" : undefined} />
        <MetricCard label="PIPELINE ERRORS · 24H" value={overview ? number.format(overview.errorsLast24h) : "—"} hint="auth, parse and storage failures" accent={overview?.errorsLast24h ? "#E5484D" : undefined} />
      </Box>

      <Paper sx={{ p: 2.5, borderRadius: 3 }} elevation={0}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Throughput · last 24 hours
        </Typography>
        {throughput.length > 0 ? (
          <BarChart
            height={260}
            series={[
              { data: throughput.map((point) => point.readings), label: "Readings", color: "#35C56E" },
              { data: throughput.map((point) => point.anomalies), label: "Anomalies", color: "#F5A524" },
            ]}
            xAxis={[{ data: hours, scaleType: "band" }]}
            margin={{ left: 50, right: 20, top: 40, bottom: 30 }}
            grid={{ horizontal: true }}
          />
        ) : (
          <Typography color="text.secondary">{loading ? "Loading…" : "No readings yet."}</Typography>
        )}
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 3 }} elevation={0}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Sensors · live value vs. rolling statistics
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sensor</TableCell>
                <TableCell>Device</TableCell>
                <TableCell align="right">Live value</TableCell>
                <TableCell align="right">Mean ± σ</TableCell>
                <TableCell align="right">Z-score</TableCell>
                <TableCell align="right">Samples</TableCell>
                <TableCell align="right">Anomalies 24h</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(overview?.sensors ?? []).map((sensor: PipelineSensor) => {
                const live = readings[sensor.sensorType];
                const value = live?.value ?? sensor.lastValue ?? null;
                const z =
                  value !== null && sensor.mean != null && sensor.std ? (value - sensor.mean) / sensor.std : null;
                return (
                  <TableRow key={sensor.sensorId}>
                    <TableCell sx={{ fontWeight: 600 }}>{sensor.sensorType}</TableCell>
                    <TableCell>{sensor.deviceName}</TableCell>
                    <TableCell align="right">
                      {formatValue(value)} {sensor.unit ?? ""}
                      {live && <Chip label="live" size="small" color="success" sx={{ ml: 1, height: 18 }} />}
                    </TableCell>
                    <TableCell align="right">
                      {sensor.mean != null ? `${formatValue(sensor.mean)} ± ${formatValue(sensor.std)}` : "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={z === null ? "—" : z.toFixed(2)} size="small" color={zScoreColor(z)} variant="outlined" />
                    </TableCell>
                    <TableCell align="right">{number.format(sensor.sampleSize)}</TableCell>
                    <TableCell align="right">{sensor.anomaliesLast24h}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        <Paper sx={{ p: 2.5, borderRadius: 3, flex: "2 1 420px" }} elevation={0}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Recent anomalies
          </Typography>
          {(overview?.recentAnomalies ?? []).length === 0 && (
            <Typography color="text.secondary">No anomalies detected.</Typography>
          )}
          {(overview?.recentAnomalies ?? []).map((anomaly: PipelineAnomaly) => (
            <Box
              key={anomaly._id}
              sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1, borderBottom: 1, borderColor: "divider" }}
            >
              <Chip
                label={anomaly.severity}
                size="small"
                color={anomaly.severity === "CRITICAL" ? "error" : "warning"}
              />
              <Typography sx={{ fontWeight: 600, minWidth: 130 }}>{anomaly.sensorType}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                {formatValue(anomaly.value)} (mean {formatValue(anomaly.meanValue)}, z = {anomaly.zScore.toFixed(2)})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(anomaly.detectedAt).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 3, flex: "1 1 280px" }} elevation={0}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Devices
          </Typography>
          {(overview?.devices ?? []).map((device: PipelineDevice) => (
            <Box key={device.deviceId} sx={{ py: 1, borderBottom: 1, borderColor: "divider" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontWeight: 600 }}>{device.deviceName}</Typography>
                <Chip
                  label={device.deviceStatus}
                  size="small"
                  color={device.deviceStatus === "ONLINE" || device.deviceStatus === "ACTIVE" ? "success" : "default"}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {device.sensorCount} sensors · last seen{" "}
                {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : "—"}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Box>
    </Box>
  );
}

