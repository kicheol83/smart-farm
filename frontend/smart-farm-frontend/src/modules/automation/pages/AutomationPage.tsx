import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Box, Typography, Button, Tabs, Tab } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Header } from "@/components/layout/Header";
import { ActuatorCard } from "../components/ActuatorCard";
import { AutomationRuleCard } from "../components/AutomationRuleCard";
import { CreateActuatorDialog } from "../components/CreateActuatorDialog";
import { CreateRuleDialog } from "../components/CreateRuleDialog";
import {
  GET_ACTUATORS_BY_GREENHOUSE,
  CREATE_ACTUATOR,
  TOGGLE_ACTUATOR,
  SET_ACTUATOR_SPEED,
  DELETE_ACTUATOR,
  GET_AUTOMATION_RULES,
  CREATE_AUTOMATION_RULE,
  UPDATE_AUTOMATION_RULE,
  DELETE_AUTOMATION_RULE,
} from "../graphql/queries";
import { GET_GREENHOUSE_DEVICE_OVERVIEW } from "@/modules/device/graphql/queries";
import { useActiveGreenhouse } from "@/lib/useActiveGreenhouse";

export function AutomationPage() {
  const { greenHouseId } = useActiveGreenhouse();
  const hasGreenhouse = greenHouseId.length > 0;

  const [tab, setTab] = useState("actuators");
  const [actuatorDialogOpen, setActuatorDialogOpen] = useState(false);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: actuatorData, refetch: refetchActuators } = useQuery(
    GET_ACTUATORS_BY_GREENHOUSE,
    {
      variables: { greenHouseId },
      skip: !hasGreenhouse,
    },
  );

  const { data: rulesData, refetch: refetchRules } = useQuery(
    GET_AUTOMATION_RULES,
    {
      variables: { greenHouseId },
      skip: !hasGreenhouse,
    },
  );

  const { data: deviceData } = useQuery(GET_GREENHOUSE_DEVICE_OVERVIEW, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
  });

  const [createActuator] = useMutation(CREATE_ACTUATOR);
  const [toggleActuator] = useMutation(TOGGLE_ACTUATOR);
  const [setActuatorSpeed] = useMutation(SET_ACTUATOR_SPEED);
  const [deleteActuator] = useMutation(DELETE_ACTUATOR);
  const [createRule] = useMutation(CREATE_AUTOMATION_RULE);
  const [updateRule] = useMutation(UPDATE_AUTOMATION_RULE);
  const [deleteRule] = useMutation(DELETE_AUTOMATION_RULE);

  const actuators = actuatorData?.actuatorsByGreenhouse ?? [];
  const rules = rulesData?.automationRulesByGreenhouse ?? [];
  const devices = deviceData?.greenhouseDeviceOverview?.devices ?? [];

  async function handleCreateActuator(d: {
    actuatorName: string;
    actuatorType: string;
    deviceId: string;
  }) {
    await createActuator({ variables: { input: { ...d, greenHouseId } } });
    setActuatorDialogOpen(false);
    refetchActuators();
  }

  async function handleToggle(actuatorId: string, status: "ON" | "OFF") {
    setTogglingId(actuatorId);
    try {
      await toggleActuator({
        variables: {
          input: {
            actuatorId,
            status,
            autoOffAfterMinutes: status === "ON" ? 5 : undefined,
          },
        },
      });
      refetchActuators();
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDeleteActuator(id: string) {
    await deleteActuator({ variables: { id } });
    refetchActuators();
  }

  async function handleSetSpeed(actuatorId: string, speedPercent: number) {
    await setActuatorSpeed({
      variables: { input: { actuatorId, speedPercent } },
    });
    refetchActuators();
  }

  async function handleCreateRule(d: any) {
    await createRule({ variables: { input: { ...d, greenHouseId } } });
    setRuleDialogOpen(false);
    refetchRules();
  }

  async function handleToggleRule(id: string, enabled: boolean) {
    await updateRule({ variables: { id, input: { enabled } } });
    refetchRules();
  }

  async function handleDeleteRule(id: string) {
    await deleteRule({ variables: { id } });
    refetchRules();
  }

  if (!hasGreenhouse) {
    return (
      <>
        <Header title="Automation" />
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
      <Header title="Automation" />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
          "& .MuiTab-root": {
            textTransform: "none",
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 500,
          },
        }}
      >
        <Tab label="Actuators" value="actuators" />
        <Tab label="Automation Rules" value="rules" />
      </Tabs>

      {tab === "actuators" && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon fontSize="small" />}
              onClick={() => setActuatorDialogOpen(true)}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Add Actuator
            </Button>
          </Box>

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
            {actuators.map((a: any) => (
              <ActuatorCard
                key={a._id}
                actuatorName={a.actuatorName}
                actuatorType={a.actuatorType}
                actuatorStatus={a.actuatorStatus}
                speedPercent={a.speedPercent}
                autoOffAt={a.autoOffAt}
                lastToggledAt={a.lastToggledAt}
                toggling={togglingId === a._id}
                onToggle={(status) => handleToggle(a._id, status)}
                onSetSpeed={(speed) => handleSetSpeed(a._id, speed)}
                onDelete={() => handleDeleteActuator(a._id)}
              />
            ))}
          </Box>

          {actuators.length === 0 && (
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "text.secondary",
                textAlign: "center",
                py: 6,
              }}
            >
              Hali actuator qo'shilmagan. Relay, suv nasosi, valve, lampa yoki
              ventilyator qo'shing.
            </Typography>
          )}
        </Box>
      )}

      {tab === "rules" && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon fontSize="small" />}
              onClick={() => setRuleDialogOpen(true)}
              disabled={actuators.length === 0}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Add Rule
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {rules.map((r: any) => (
              <AutomationRuleCard
                key={r._id}
                ruleName={r.ruleName}
                triggerSensorType={r.triggerSensorType}
                triggerCondition={r.triggerCondition}
                triggerThreshold={r.triggerThreshold}
                actionDurationMinutes={r.actionDurationMinutes}
                enabled={r.enabled}
                lastTriggeredAt={r.lastTriggeredAt}
                onToggleEnabled={(enabled) => handleToggleRule(r._id, enabled)}
                onDelete={() => handleDeleteRule(r._id)}
              />
            ))}
          </Box>

          {rules.length === 0 && (
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "text.secondary",
                textAlign: "center",
                py: 6,
              }}
            >
              {actuators.length === 0
                ? "Avval kamida bitta actuator qo'shing, keyin qoida yaratish mumkin bo'ladi."
                : "Hali avtomatlashtirish qoidasi yo'q."}
            </Typography>
          )}
        </Box>
      )}

      <CreateActuatorDialog
        open={actuatorDialogOpen}
        devices={devices}
        onClose={() => setActuatorDialogOpen(false)}
        onSubmit={handleCreateActuator}
      />
      <CreateRuleDialog
        open={ruleDialogOpen}
        actuators={actuators}
        onClose={() => setRuleDialogOpen(false)}
        onSubmit={handleCreateRule}
      />
    </>
  );
}
