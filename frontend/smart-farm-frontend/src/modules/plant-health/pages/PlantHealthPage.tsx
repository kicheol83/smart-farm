import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import { Header } from "@/components/layout/Header";
import { SectionListItem } from "../components/SectionListItem";
import { PlantHealthOverviewCard } from "../components/PlantHealthOverviewCard";
import { PlantSectionListItem } from "../components/PlantSectionListItem";
import { TaskTabListItem } from "../components/TaskTabListItem";
import { DeviceTabListItem } from "../components/DeviceTabListItem";
import { ActivityTabListItem } from "../components/ActivityTabListItem";
import { GreenhouseMapView } from "../components/GreenhouseMapView";
import { SectionDetailPopup } from "../components/SectionDetailPopup";
import {
  GET_GREENHOUSE_SECTION_OVERVIEW,
  GET_SECTIONS_BY_GREENHOUSE,
  GET_SECTION_MONITORING_DETAIL,
  GET_ALL_CROPS,
  GET_MY_ACTION_LOGS,
} from "../graphql/queries";
import { GET_TASK_LIST } from "@/modules/task/graphql/queries";
import { GET_GREENHOUSE_DEVICE_OVERVIEW } from "@/modules/device/graphql/queries";

const TABS = [
  { key: "details", label: "Details" },
  { key: "plant", label: "Plant" },
  { key: "task", label: "Task" },
  { key: "device", label: "Device" },
  { key: "activity", label: "Activity" },
];

export function PlantHealthPage() {
  localStorage.setItem("greenHouseId", "6a2daf715e4567e07ca5d328");
  const greenHouseId = localStorage.getItem("greenHouseId") || "";
  const hasGreenhouse = greenHouseId.length > 0;

  const [tab, setTab] = useState("details");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: overviewData } = useQuery(GET_GREENHOUSE_SECTION_OVERVIEW, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
  });

  const { data: sectionsData } = useQuery(GET_SECTIONS_BY_GREENHOUSE, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
  });

  const { data: cropsData } = useQuery(GET_ALL_CROPS, { skip: !hasGreenhouse });

  const { data: detailData } = useQuery(GET_SECTION_MONITORING_DETAIL, {
    variables: { sectionId: selectedId },
    skip: !selectedId,
  });

  const { data: taskListData } = useQuery(GET_TASK_LIST, {
    variables: { input: { greenHousesId: greenHouseId, page: 1, limit: 20 } },
    skip: !hasGreenhouse || tab !== "task",
  });

  const { data: deviceData } = useQuery(GET_GREENHOUSE_DEVICE_OVERVIEW, {
    variables: { greenHouseId },
    skip: !hasGreenhouse || tab !== "device",
  });

  const { data: activityData } = useQuery(GET_MY_ACTION_LOGS, {
    variables: { input: { page: 1, limit: 20 } },
    skip: !hasGreenhouse || tab !== "activity",
  });

  const overview = overviewData?.greenhouseSectionOverview;
  const sections = sectionsData?.sectionsByGreenhouse ?? [];
  const cropsMap = new Map(
    (cropsData?.crops ?? []).map((c: any) => [c._id, c.cropsName]),
  );

  const mapSections = overview?.sections ?? [];
  const selectedDetail = detailData?.sectionMonitoringDetail;
  const selectedSectionFull = sections.find((s: any) => s._id === selectedId);
  const selectedPlantName = selectedSectionFull?.cropsId
    ? cropsMap.get(selectedSectionFull.cropsId)
    : undefined;

  if (!hasGreenhouse) {
    return (
      <>
        <Header title="Plant Health & Section Monitoring" />
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
      <Header title="Greenhouse Monitoring" />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "340px 1fr" },
          gap: 2,
          height: { lg: "calc(100vh - 140px)" },
        }}
      >
        {/* Chap panel */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 2,
            overflowY: "auto",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons={false}
            sx={{
              minHeight: "auto",
              mb: 1,
              "& .MuiTab-root": {
                textTransform: "none",
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 500,
                fontSize: 13,
                minHeight: "auto",
                px: 1.5,
              },
            }}
          >
            {TABS.map((t) => (
              <Tab key={t.key} label={t.label} value={t.key} />
            ))}
          </Tabs>

          {tab === "details" && (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {sections.map((s: any) => (
                <SectionListItem
                  key={s._id}
                  sectionName={s.sectionName}
                  sectionStatus={s.sectionStatus}
                  healthIndex={s.currentHealthIndex}
                  plantName={
                    s.cropsId ? (cropsMap.get(s.cropsId) as string) : undefined
                  }
                  sectionArea={s.sectionArea}
                  selected={s._id === selectedId}
                  onClick={() => setSelectedId(s._id)}
                />
              ))}

              {sections.length === 0 && (
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: "text.secondary",
                    textAlign: "center",
                    py: 3,
                  }}
                >
                  Hali section yaratilmagan
                </Typography>
              )}
            </Box>
          )}

          {tab === "plant" && (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <PlantHealthOverviewCard
                overallHealthIndex={overview?.overallHealthIndex}
              />

              {sections.map((s: any) => (
                <PlantSectionListItem
                  key={s._id}
                  sectionName={s.sectionName}
                  healthIndex={s.currentHealthIndex}
                  plantName={
                    s.cropsId ? (cropsMap.get(s.cropsId) as string) : undefined
                  }
                  selected={s._id === selectedId}
                  onClick={() => setSelectedId(s._id)}
                />
              ))}

              {sections.length === 0 && (
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: "text.secondary",
                    textAlign: "center",
                    py: 3,
                  }}
                >
                  Hali section yaratilmagan
                </Typography>
              )}
            </Box>
          )}

          {tab === "task" && (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 11,
                  color: "text.secondary",
                  mb: 1,
                  fontStyle: "italic",
                }}
              >
                Bu vazifalar greenhouse darajasida — section bo'yicha
                filtrlanmagan.
              </Typography>

              {(taskListData?.taskList?.items ?? []).map((t: any) => (
                <TaskTabListItem
                  key={t._id}
                  taskTitle={t.taskTitle}
                  taskDescription={t.taskDescription}
                  taskStatus={t.taskStatus}
                  updatedAt={t.updatedAt}
                />
              ))}

              {(taskListData?.taskList?.items ?? []).length === 0 && (
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: "text.secondary",
                    textAlign: "center",
                    py: 3,
                  }}
                >
                  Hali vazifa yo'q
                </Typography>
              )}
            </Box>
          )}

          {tab === "device" && (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 11,
                  color: "text.secondary",
                  mb: 1,
                  fontStyle: "italic",
                }}
              >
                Bu qurilmalar greenhouse darajasida — section bo'yicha
                filtrlanmagan.
              </Typography>

              {(deviceData?.greenhouseDeviceOverview?.devices ?? []).map(
                (d: any) => (
                  <DeviceTabListItem
                    key={d._id}
                    deviceName={d.deviceName}
                    deviceType={d.deviceType}
                    deviceStatus={d.deviceStatus}
                    updatedAt={d.updatedAt}
                  />
                ),
              )}

              {(deviceData?.greenhouseDeviceOverview?.devices ?? []).length ===
                0 && (
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: "text.secondary",
                    textAlign: "center",
                    py: 3,
                  }}
                >
                  Hali qurilma yo'q
                </Typography>
              )}
            </Box>
          )}

          {tab === "activity" && (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 11,
                  color: "text.secondary",
                  mb: 1,
                  fontStyle: "italic",
                }}
              >
                Bu audit-jurnal foydalanuvchi darajasida — section bo'yicha
                filtrlanmagan.
              </Typography>

              {(activityData?.myActionLogs?.items ?? []).map((a: any) => (
                <ActivityTabListItem
                  key={a._id}
                  actionType={a.actionType}
                  actionResource={a.actionResource}
                  description={a.description}
                  memberFullName={a.memberFullName}
                  createdAt={a.createdAt}
                />
              ))}

              {(activityData?.myActionLogs?.items ?? []).length === 0 && (
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: "text.secondary",
                    textAlign: "center",
                    py: 3,
                  }}
                >
                  Hali faoliyat yozuvi yo'q
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* O'ng panel — xarita + popup */}
        <Box sx={{ position: "relative", minHeight: 400 }}>
          <GreenhouseMapView
            sections={mapSections}
            selectedId={selectedId}
            onSelectSection={(id) => setSelectedId(id)}
          />

          {selectedId && selectedDetail && (
            <SectionDetailPopup
              section={selectedDetail}
              plantName={selectedPlantName as string | undefined}
              sectionArea={selectedSectionFull?.sectionArea}
              variant={
                tab === "plant"
                  ? "plant"
                  : tab === "task"
                    ? "task"
                    : tab === "device"
                      ? "device"
                      : tab === "activity"
                        ? "activity"
                        : "details"
              }
              onClose={() => setSelectedId(null)}
            />
          )}
        </Box>
      </Box>
    </>
  );
}
