import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Box, Typography } from "@mui/material";
import { Header } from "@/components/layout/Header";
import { CameraLocationSidebar } from "../components/CameraLocationSidebar";
import { CameraVideoPreview } from "../components/CameraVideoPreview";
import { CameraInfoPanel } from "../components/CameraInfoPanel";
import { CameraPlaybackPanel } from "../components/CameraPlaybackPanel";
import {
  GET_CAMERAS_BY_GREENHOUSE,
  GET_CAMERA_SNAPSHOTS,
  SAVE_SNAPSHOT_MUTATION,
} from "../graphql/queries";

export function LiveViewPage() {
  const greenHouseId = localStorage.getItem("currentGreenhouseId") || "";
  const hasGreenhouse = greenHouseId.length > 0;

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: camerasData } = useQuery(GET_CAMERAS_BY_GREENHOUSE, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
    onCompleted: (d) => {
      if (!selectedId && d?.camerasByGreenhouse?.length > 0) {
        setSelectedId(d.camerasByGreenhouse[0]._id);
      }
    },
  });

  const cameras = camerasData?.camerasByGreenhouse ?? [];
  const selectedIndex = cameras.findIndex((c: any) => c._id === selectedId);
  const selectedCamera = cameras[selectedIndex];
  const cameraLabel =
    selectedCamera?.cameraName ??
    (selectedIndex >= 0 ? `Camera ${selectedIndex + 1}` : "Camera");

  const { data: snapshotsData } = useQuery(GET_CAMERA_SNAPSHOTS, {
    variables: { cameraId: selectedId, limit: 20 },
    skip: !selectedId,
  });

  const [saveSnapshot] = useMutation(SAVE_SNAPSHOT_MUTATION);

  if (!hasGreenhouse) {
    return (
      <>
        <Header title="Live View" />
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
      <Header title="Live View" />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "260px 1.6fr 320px" },
          gap: 2,
          height: { lg: "calc(100vh - 140px)" },
        }}
      >
        <CameraLocationSidebar
          cameras={cameras}
          selectedId={selectedId}
          onSelect={setSelectedId}
          search={search}
          onSearchChange={setSearch}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto",
          }}
        >
          {selectedCamera ? (
            <>
              <CameraVideoPreview
                cameraLabel={cameraLabel}
                cameraStatus={selectedCamera.cameraStatus}
                cameraStreamUrl={selectedCamera.cameraStreamUrl}
                onSnapshot={() => {
                  void saveSnapshot;
                }}
              />
              <CameraInfoPanel
                cameraLabel={cameraLabel}
                cameraName={selectedCamera.cameraName}
                model={selectedCamera.model}
                networkStatus={selectedCamera.networkStatus}
                resolution={selectedCamera.resolution}
                encoding={selectedCamera.encoding}
              />
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 300,
                bgcolor: "background.paper",
                borderRadius: 2,
              }}
            >
              <Typography color="text.secondary">
                Chapdan kamera tanlang
              </Typography>
            </Box>
          )}
        </Box>

        <CameraPlaybackPanel
          snapshots={snapshotsData?.cameraSnapshots ?? []}
          cameraLabel={cameraLabel}
        />
      </Box>
    </>
  );
}
