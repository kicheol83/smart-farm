import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Alert, Snackbar } from "@mui/material";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useActiveGreenhouse } from "@/lib/useActiveGreenhouse";

export type LiveReading = {
  value: number;
  unit: string;
  timestamp: string;
};

type SensorUpdateEvent = {
  sensorType: string;
  value: number;
  unit: string;
  timestamp: string;
};

type AlertEvent = {
  type: string;
  alertType: string;
  severity: string;
  message: string;
  currentValue: number;
  timestamp: string;
};

type DeviceStatusEvent = {
  deviceId: string;
  deviceName: string;
  status: string;
  timestamp: string;
};

type LiveContextValue = {
  connected: boolean;
  readings: Record<string, LiveReading>;
  lastUpdate: string | null;
  deviceStatus: Record<string, DeviceStatusEvent>;
};

const LiveContext = createContext<LiveContextValue>({
  connected: false,
  readings: {},
  lastUpdate: null,
  deviceStatus: {},
});

const SEVERITY: Record<string, "error" | "warning" | "info"> = {
  CRITICAL: "error",
  HIGH: "error",
  WARNING: "warning",
  MEDIUM: "warning",
  LOW: "info",
};

export function LiveProvider({ children }: { children: ReactNode }) {
  const { greenHouseId } = useActiveGreenhouse();
  const [connected, setConnected] = useState(false);
  const [readings, setReadings] = useState<Record<string, LiveReading>>({});
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<Record<string, DeviceStatusEvent>>({});
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);

  const subscribe = useCallback(() => {
    if (greenHouseId) {
      getSocket().emit("subscribe-greenhouse", { greenHouseId });
    }
  }, [greenHouseId]);

  useEffect(() => {
    if (!greenHouseId || !localStorage.getItem("accessToken")) {
      return;
    }

    const socket = getSocket();

    const onConnect = () => {
      setConnected(true);
      subscribe();
    };
    const onDisconnect = () => setConnected(false);
    const onSensorUpdate = (event: SensorUpdateEvent) => {
      setReadings((previous) => ({
        ...previous,
        [event.sensorType]: { value: event.value, unit: event.unit, timestamp: event.timestamp },
      }));
      setLastUpdate(event.timestamp);
    };
    const onAlert = (event: AlertEvent) => {
      setAlerts((previous) => [...previous.slice(-4), event]);
    };
    const onDeviceStatus = (event: DeviceStatusEvent) => {
      setDeviceStatus((previous) => ({ ...previous, [event.deviceId]: event }));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("sensor-update", onSensorUpdate);
    socket.on("alert", onAlert);
    socket.on("device-status", onDeviceStatus);

    if (socket.connected) {
      onConnect();
    } else {
      connectSocket();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("sensor-update", onSensorUpdate);
      socket.off("alert", onAlert);
      socket.off("device-status", onDeviceStatus);
      disconnectSocket();
      setConnected(false);
      setReadings({});
    };
  }, [greenHouseId, subscribe]);

  const value = useMemo(
    () => ({ connected, readings, lastUpdate, deviceStatus }),
    [connected, readings, lastUpdate, deviceStatus],
  );

  const current = alerts[0];

  return (
    <LiveContext.Provider value={value}>
      {children}
      <Snackbar
        key={current ? `${current.timestamp}-${current.alertType}` : "none"}
        open={current !== undefined}
        autoHideDuration={6000}
        onClose={() => setAlerts((previous) => previous.slice(1))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {current ? (
          <Alert
            variant="filled"
            severity={SEVERITY[current.severity] ?? "warning"}
            onClose={() => setAlerts((previous) => previous.slice(1))}
            sx={{ minWidth: 300 }}
          >
            <strong>{current.type === "ANOMALY" ? "Anomaly" : "Alert"} · {current.alertType}</strong>
            <br />
            {current.message} ({current.currentValue})
          </Alert>
        ) : (
          <span />
        )}
      </Snackbar>
    </LiveContext.Provider>
  );
}

export function useLive(): LiveContextValue {
  return useContext(LiveContext);
}
