import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Alert, Snackbar } from "@mui/material";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useActiveGreenhouse } from "@/lib/useActiveGreenhouse";
import { t } from "@/i18n/core";

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

export type ActuatorEvent = {
  actuatorId: string;
  actuatorName: string;
  actuatorType: string;
  status: string;
  reason?: string | null;
  waterAmount?: number | null;
  timestamp: string;
};

type Notice = { key: string; severity: "error" | "warning" | "info" | "success"; title: string; body: string };

type LiveContextValue = {
  connected: boolean;
  readings: Record<string, LiveReading>;
  lastUpdate: string | null;
  deviceStatus: Record<string, DeviceStatusEvent>;
  messagesPerMinute: number;
  messageCount: number;
  actuatorEvents: ActuatorEvent[];
};

const LiveContext = createContext<LiveContextValue>({
  connected: false,
  readings: {},
  lastUpdate: null,
  deviceStatus: {},
  messagesPerMinute: 0,
  messageCount: 0,
  actuatorEvents: [],
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
  const [notices, setNotices] = useState<Notice[]>([]);
  const [actuatorEvents, setActuatorEvents] = useState<ActuatorEvent[]>([]);
  const [messagesPerMinute, setMessagesPerMinute] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const messageTimes = useRef<number[]>([]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const cutoff = Date.now() - 60000;
      messageTimes.current = messageTimes.current.filter((time) => time >= cutoff);
      setMessagesPerMinute(messageTimes.current.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, []);

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
      messageTimes.current.push(Date.now());
      setMessageCount((count) => count + 1);
    };
    const onAlert = (event: AlertEvent) => {
      const notice: Notice = {
        key: `${event.timestamp}-${event.alertType}`,
        severity: SEVERITY[event.severity] ?? "warning",
        title: event.type === "ANOMALY" ? t("live.toast.anomaly", { type: event.alertType }) : t("live.toast.alert", { type: event.alertType }),
        body: `${event.message} (${event.currentValue})`,
      };
      setNotices((previous) => [...previous.slice(-4), notice]);
    };
    const onActuatorUpdate = (event: ActuatorEvent) => {
      setActuatorEvents((previous) => [event, ...previous].slice(0, 20));
      const water = event.waterAmount ? t("live.toast.water", { amount: event.waterAmount }) : "";
      const notice: Notice = {
        key: `${event.timestamp}-${event.actuatorId}`,
        severity: event.status === "ON" ? "info" : "success",
        title: `${event.actuatorName} → ${event.status}`,
        body: `${event.reason ?? t("live.toast.manual")}${water}`,
      };
      setNotices((previous) => [...previous.slice(-4), notice]);
    };
    const onDeviceStatus = (event: DeviceStatusEvent) => {
      setDeviceStatus((previous) => ({ ...previous, [event.deviceId]: event }));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("sensor-update", onSensorUpdate);
    socket.on("alert", onAlert);
    socket.on("device-status", onDeviceStatus);
    socket.on("actuator-update", onActuatorUpdate);

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
      socket.off("actuator-update", onActuatorUpdate);
      disconnectSocket();
      setConnected(false);
      setReadings({});
    };
  }, [greenHouseId, subscribe]);

  const value = useMemo(
    () => ({ connected, readings, lastUpdate, deviceStatus, messagesPerMinute, messageCount, actuatorEvents }),
    [connected, readings, lastUpdate, deviceStatus, messagesPerMinute, messageCount, actuatorEvents],
  );

  const current = notices[0];
  const dismiss = () => setNotices((previous) => previous.slice(1));

  return (
    <LiveContext.Provider value={value}>
      {children}
      <Snackbar
        key={current?.key ?? "none"}
        open={current !== undefined}
        autoHideDuration={6000}
        onClose={dismiss}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {current ? (
          <Alert
            variant="filled"
            severity={current.severity}
            onClose={dismiss}
            sx={{ minWidth: 300 }}
          >
            <strong>{current.title}</strong>
            <br />
            {current.body}
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
