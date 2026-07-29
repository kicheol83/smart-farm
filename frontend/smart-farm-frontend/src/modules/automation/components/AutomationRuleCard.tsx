import { Box, Card, Typography, Switch, IconButton } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { formatDistanceToNow } from "date-fns";

interface AutomationRuleCardProps {
  ruleName: string;
  triggerSensorType: string;
  triggerCondition: "BELOW" | "ABOVE";
  triggerThreshold: number;
  actionDurationMinutes?: number;
  enabled: boolean;
  lastTriggeredAt?: string;
  onToggleEnabled: (enabled: boolean) => void;
  onDelete: () => void;
}

function typeLabel(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " ");
}

export function AutomationRuleCard({
  ruleName,
  triggerSensorType,
  triggerCondition,
  triggerThreshold,
  actionDurationMinutes,
  enabled,
  lastTriggeredAt,
  onToggleEnabled,
  onDelete,
}: AutomationRuleCardProps) {
  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 2, bgcolor: "background.paper", p: 2 }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "text.primary",
            }}
          >
            {ruleName}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "text.secondary",
              mt: 0.5,
            }}
          >
            If {typeLabel(triggerSensorType)} is{" "}
            {triggerCondition === "BELOW" ? "below" : "above"}{" "}
            {triggerThreshold}
            {actionDurationMinutes
              ? ` → run for ${actionDurationMinutes} min`
              : ""}
          </Typography>
          {lastTriggeredAt && (
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 11,
                color: "text.secondary",
                mt: 0.5,
              }}
            >
              Last triggered{" "}
              {formatDistanceToNow(new Date(lastTriggeredAt), {
                addSuffix: true,
              })}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Switch
            checked={enabled}
            onChange={(e) => onToggleEnabled(e.target.checked)}
            size="small"
          />
          <IconButton size="small" onClick={onDelete}>
            <DeleteOutlineRoundedIcon
              fontSize="small"
              sx={{ color: "text.secondary" }}
            />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}
