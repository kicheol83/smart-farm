import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Box, Typography, Chip } from "@mui/material";
import { Header } from "@/components/layout/Header";
import { ZoneIrrigationCard } from "../components/ZoneIrrigationCard";
import { GET_GREENHOUSE_SECTION_OVERVIEW } from "@/modules/plant-health/graphql/queries";
import {
  GET_ACTUATORS_BY_GREENHOUSE,
  TOGGLE_ACTUATOR,
} from "@/modules/automation/graphql/queries";
import { GET_WATER_ZONE_USAGE_REPORT } from "@/modules/report/graphql/queries";
import { useActiveGreenhouse } from "@/lib/useActiveGreenhouse";
import { t } from "@/i18n/core";

const IRRIGATION_ACTUATOR_TYPES = ["WATER_PUMP", "SOLENOID_VALVE"];

export function IrrigationPage() {
  const { greenHouseId } = useActiveGreenhouse();
  const hasGreenhouse = greenHouseId.length > 0;

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: sectionData } = useQuery(GET_GREENHOUSE_SECTION_OVERVIEW, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
  });

  const { data: actuatorData, refetch: refetchActuators } = useQuery(
    GET_ACTUATORS_BY_GREENHOUSE,
    {
      variables: { greenHouseId },
      skip: !hasGreenhouse,
    },
  );

  const { data: zoneUsageData } = useQuery(GET_WATER_ZONE_USAGE_REPORT, {
    variables: { input: { greenHouseId } },
    skip: !hasGreenhouse,
  });

  const [toggleActuator] = useMutation(TOGGLE_ACTUATOR);

  const sections = sectionData?.greenhouseSectionOverview?.sections ?? [];
  const actuators = actuatorData?.actuatorsByGreenhouse ?? [];
  const zones = zoneUsageData?.waterZoneUsageReport?.zones ?? [];

  const irrigationActuatorBySection = new Map(
    actuators
      .filter(
        (a: any) =>
          IRRIGATION_ACTUATOR_TYPES.includes(a.actuatorType) && a.sectionId,
      )
      .map((a: any) => [a.sectionId, a]),
  );
  const usageBySection = new Map(
    zones.map((z: any) => [z.sectionId, z.totalUsage]),
  );

  const unassignedActuators = actuators.filter(
    (a: any) =>
      IRRIGATION_ACTUATOR_TYPES.includes(a.actuatorType) && !a.sectionId,
  );

  async function handleToggle(
    actuatorId: string,
    status: "ON" | "OFF",
    withAutoOff = false,
  ) {
    setTogglingId(actuatorId);
    try {
      await toggleActuator({
        variables: {
          input: {
            actuatorId,
            status,
            autoOffAfterMinutes: withAutoOff && status === "ON" ? 5 : undefined,
          },
        },
      });
      refetchActuators();
    } finally {
      setTogglingId(null);
    }
  }

  if (!hasGreenhouse) {
    return (
      <>
        <Header title={t("txt.irrigation")} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60%",
          }}
        >
          <Typography color="text.secondary">
            {t("txt.no_greenhouse_selected_yet")}
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header title={t("txt.irrigation")} />

      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          color: "text.secondary",
          mb: 2,
        }}
      >
        Har bir zona (Section) uchun joriy tuproq namligi, bog'langan sug'orish
        qurilmasi va bugungi suv sarfi. Batafsil avtomatlashtirish qoidalari
        uchun{" "}
        <Box
          component="span"
          sx={{ color: "primary.main", cursor: "pointer" }}
          onClick={() => (window.location.href = "/automation")}
        >
          {t("txt.automation")}
        </Box>{" "}
        sahifasiga o'ting.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        {sections.map((s: any) => {
          const actuator = irrigationActuatorBySection.get(s.sectionId) as any;
          return (
            <ZoneIrrigationCard
              key={s.sectionId}
              sectionName={s.sectionName}
              soilMoisture={s.soilMoisture}
              actuatorName={actuator?.actuatorName}
              actuatorStatus={actuator?.actuatorStatus}
              lastToggledAt={actuator?.lastToggledAt}
              autoOffAt={actuator?.autoOffAt}
              todayUsageLiters={
                usageBySection.get(s.sectionId) as number | undefined
              }
              toggling={togglingId === actuator?._id}
              onToggle={(status) =>
                actuator && handleToggle(actuator._id, status)
              }
              onQuickWater={() =>
                actuator && handleToggle(actuator._id, "ON", true)
              }
            />
          );
        })}
      </Box>

      {sections.length === 0 && (
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: "text.secondary",
            textAlign: "center",
            py: 6,
          }}
        >
          {t("txt.no_sections_zones_yet")}
        </Typography>
      )}

      {unassignedActuators.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "text.primary",
              mb: 1,
            }}
          >
            {t("txt.shared_irrigation_devices")}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "text.secondary",
              mb: 1.5,
            }}
          >
            {t("txt.these_devices_are_not_linked_to_a_zone_for_examp")}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {unassignedActuators.map((a: any) => (
              <Chip
                key={a._id}
                label={`${a.actuatorName} — ${a.actuatorStatus}`}
                sx={{ bgcolor: "background.paper" }}
              />
            ))}
          </Box>
        </Box>
      )}
    </>
  );
}
