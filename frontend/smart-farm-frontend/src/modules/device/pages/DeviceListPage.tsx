import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { Header } from "@/components/layout/Header";
import { DeviceSummaryCard } from "../components/DeviceSummaryCard";
import { DeviceListItem } from "../components/DeviceListItem";
import { DeviceDetailPanel } from "../components/DeviceDetailPanel";
import { AddDeviceDialog } from "../components/AddDeviceDialog";

import {
  GET_GREENHOUSE_DEVICE_OVERVIEW,
  GET_DEVICE_WITH_SENSORS,
  GET_GREENHOUSE_SOIL_MOISTURE,
  CREATE_DEVICE_MUTATION,
  UPDATE_DEVICE_STATUS_MUTATION,
  DELETE_DEVICE_MUTATION,
} from "../graphql/queries";
import { useActiveGreenhouse } from "@/lib/useActiveGreenhouse";

type DeviceStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE" | "ERROR";

export function DeviceListPage() {
  const { greenHouseId } = useActiveGreenhouse();
  const hasGreenhouse = greenHouseId.length > 0;

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    data: overviewData,
    refetch: refetchOverview,
    loading: overviewLoading,
  } = useQuery(GET_GREENHOUSE_DEVICE_OVERVIEW, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
  });

  const { data: detailData, loading: detailLoading } = useQuery(
    GET_DEVICE_WITH_SENSORS,
    {
      variables: { id: selectedId },
      skip: !selectedId,
    },
  );

  const { data: soilData } = useQuery(GET_GREENHOUSE_SOIL_MOISTURE, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
  });

  const [createDevice] = useMutation(CREATE_DEVICE_MUTATION);
  const [updateStatus] = useMutation(UPDATE_DEVICE_STATUS_MUTATION);
  const [deleteDevice] = useMutation(DELETE_DEVICE_MUTATION);

  const overview = overviewData?.greenhouseDeviceOverview;
  const allDevices = overview?.devices ?? [];

  const filteredDevices = allDevices.filter((d: any) =>
    d.deviceName.toLowerCase().includes(search.toLowerCase()),
  );

  const sensorCount =
    overview?.typeCounts?.find((t: any) => t.deviceType === "SENSOR_HUB")
      ?.count ?? 0;
  const cameraCount =
    overview?.typeCounts?.find((t: any) => t.deviceType === "CAMERA")?.count ??
    0;
  const offlineCount = overview?.statusCounts?.offline ?? 0;
  const issueCount = overview?.statusCounts?.error ?? 0;

  async function handleCreateDevice(data: {
    deviceName: string;
    deviceType: string;
    installedAt: string;
  }) {
    await createDevice({ variables: { input: { ...data, greenHouseId } } });
    setDialogOpen(false);
    refetchOverview();
  }

  async function handleStatusChange(status: DeviceStatus) {
    if (!selectedId) return;
    await updateStatus({ variables: { id: selectedId, status } });
    refetchOverview();
  }

  async function handleDelete() {
    if (!selectedId) return;
    await deleteDevice({ variables: { id: selectedId } });
    setSelectedId(null);
    refetchOverview();
  }

  if (!hasGreenhouse) {
    return (
      <>
        <Header title="Device Status" />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60%",
          }}
        >
          <Typography color="text.secondary">
            Hali greenhouse tanlanmagan
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header title="Device Status" />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <DeviceSummaryCard
          dotColor="#35C56E"
          label="Sensor Connected"
          value={sensorCount}
        />
        <DeviceSummaryCard
          dotColor="#2196f3"
          label="Camera Connected"
          value={cameraCount}
        />
        <DeviceSummaryCard
          dotColor="#9c9c9c"
          label="Offline Device"
          value={offlineCount}
        />
        <DeviceSummaryCard
          dotColor="#f9ad19"
          label="Device Issue"
          value={issueCount}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search device"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon
                  sx={{ fontSize: 18, color: "text.secondary" }}
                />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 240 }}
        />

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton
              onClick={() => refetchOverview()}
              sx={{ bgcolor: "background.paper", borderRadius: 2 }}
            >
              <RefreshRoundedIcon
                fontSize="small"
                sx={{
                  animation: overviewLoading
                    ? "spin 1s linear infinite"
                    : "none",
                  "@keyframes spin": { to: { transform: "rotate(360deg)" } },
                }}
              />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            All Device
          </Button>
          <Button
            variant="outlined"
            startIcon={<TuneRoundedIcon fontSize="small" />}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Add Device
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1.4fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 1.5,
            maxHeight: 640,
            overflowY: "auto",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: "text.primary",
              px: 1,
              pb: 1,
            }}
          >
            Device List
          </Typography>

          {filteredDevices.map((d: any) => (
            <DeviceListItem
              key={d._id}
              deviceName={d.deviceName}
              deviceType={d.deviceType}
              deviceStatus={d.deviceStatus}
              greenHouseName={overview?.greenHouseName}
              selected={d._id === selectedId}
              onClick={() => setSelectedId(d._id)}
            />
          ))}

          {filteredDevices.length === 0 && (
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "text.secondary",
                textAlign: "center",
                py: 3,
              }}
            >
              Qurilma topilmadi
            </Typography>
          )}
        </Box>

        <DeviceDetailPanel
          device={detailData?.deviceWithSensors}
          loading={detailLoading}
          soilMoistureValue={soilData?.greenhouseSensorSummary?.soilMoisture}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </Box>

      <AddDeviceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateDevice}
      />
    </>
  );
}
