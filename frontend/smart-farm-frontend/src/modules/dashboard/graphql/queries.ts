import { gql } from "@apollo/client";

/**
 * Backend: module9/admin.resolver.ts dagi kabi emas,
 * bu yerda module1/greenhouse.resolver.ts dagi getGreenhouseSummary
 * va module7/alert.resolver.ts dagi activeAlertsSummary ishlatiladi.
 */

export const GET_ACTIVE_ALERTS_COUNT = gql`
  query GetActiveAlertsCount {
    activeAlertsSummary {
      count
    }
  }
`;

export const GET_GREENHOUSE_SUMMARY = gql`
  query GetGreenhouseSummary($greenHouseId: ID!) {
    getGreenhouseSummary(greenHouseId: $greenHouseId) {
      location
      temperature
      weatherCondition
      highTemp
      lowTemp
      plantHealthScore
      plantHealthStatus
      windSpeed
      soilPh
      humidity
      soilMoisture
    }
  }
`;

export const GET_DEVICE_LIST = gql`
  query GetDeviceList($greenHouseId: ID!) {
    devices(greenHouseId: $greenHouseId) {
      _id
      deviceName
      deviceStatus
      deviceType
    }
  }
`;

export const GET_TASK_LIST = gql`
  query GetTaskList($greenHouseId: ID!) {
    tasks(greenHouseId: $greenHouseId) {
      _id
      taskTitle
      taskDescription
      taskStatus
      startTime
      endTime
    }
  }
`;

export const SUBSCRIBE_SENSOR_ALERT = gql`
  subscription OnSensorAlert($greenHouseId: ID!) {
    sensorAlert(greenHouseId: $greenHouseId) {
      sensorType
      currentValue
      threshold
      severity
      message
      triggeredAt
    }
  }
`;
