import { gql } from "@apollo/client";

export const GET_ACTUATORS_BY_GREENHOUSE = gql`
  query ActuatorsByGreenhouse($greenHouseId: ID!) {
    actuatorsByGreenhouse(greenHouseId: $greenHouseId) {
      _id
      actuatorName
      actuatorType
      actuatorStatus
      speedPercent
      deviceId
      sectionId
      autoModeEnabled
      lastToggledAt
      autoOffAt
    }
  }
`;

export const SET_ACTUATOR_SPEED = gql`
  mutation SetActuatorSpeed($input: SetActuatorSpeedInput!) {
    setActuatorSpeed(input: $input) {
      _id
      actuatorStatus
      speedPercent
    }
  }
`;

export const CREATE_ACTUATOR = gql`
  mutation CreateActuator($input: CreateActuatorInput!) {
    createActuator(input: $input) {
      _id
      actuatorName
    }
  }
`;

export const TOGGLE_ACTUATOR = gql`
  mutation ToggleActuator($input: ToggleActuatorInput!) {
    toggleActuator(input: $input) {
      _id
      actuatorStatus
      autoOffAt
      lastToggledAt
    }
  }
`;

export const DELETE_ACTUATOR = gql`
  mutation DeleteActuator($id: ID!) {
    deleteActuator(id: $id)
  }
`;

export const GET_AUTOMATION_RULES = gql`
  query AutomationRulesByGreenhouse($greenHouseId: ID!) {
    automationRulesByGreenhouse(greenHouseId: $greenHouseId) {
      _id
      ruleName
      actuatorId
      triggerSensorType
      triggerCondition
      triggerThreshold
      sectionId
      actionDurationMinutes
      enabled
      lastTriggeredAt
    }
  }
`;

export const CREATE_AUTOMATION_RULE = gql`
  mutation CreateAutomationRule($input: CreateAutomationRuleInput!) {
    createAutomationRule(input: $input) {
      _id
      ruleName
    }
  }
`;

export const UPDATE_AUTOMATION_RULE = gql`
  mutation UpdateAutomationRule($id: ID!, $input: UpdateAutomationRuleInput!) {
    updateAutomationRule(id: $id, input: $input) {
      _id
      enabled
    }
  }
`;

export const DELETE_AUTOMATION_RULE = gql`
  mutation DeleteAutomationRule($id: ID!) {
    deleteAutomationRule(id: $id)
  }
`;
