import { gql } from "@apollo/client";

export const GET_ACTIVE_ALERTS_COUNT = gql`
  query ActiveAlertsSummary($greenHouseId: ID!) {
    activeAlertsSummary(greenHouseId: $greenHouseId) {
      total
      critical
      warning
      info
      recentAlerts {
        _id
        alertsType
        alertsThreshold
        alertsActualValues
        alertsSeverity
        sensorsId
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_GREENHOUSE_SUMMARY = gql`
  query GreenhouseSensorSummary($greenHouseId: ID!) {
    greenhouseSensorSummary(greenHouseId: $greenHouseId) {
      greenHouseId
      greenHouseName
      temperature
      humidity
      ph
      light
      co2
      soilMoisture
      lastUpdated
    }
  }
`;

export const GET_GREENHOUSE_DETAIL = gql`
  query GetGreenhouseDetail($id: ID!) {
    greenhouse(id: $id) {
      _id
      greenHouseName
      greenHouseType
      greenHouseSize
    }
  }
`;

export const GET_GREENHOUSE_DEVICE_OVERVIEW = gql`
  query GreenhouseDeviceOverview($greenHouseId: ID!) {
    greenhouseDeviceOverview(greenHouseId: $greenHouseId) {
      greenHouseId
      greenHouseName
      statusCounts {
        total
        online
        offline
        maintenance
        error
      }
      typeCounts {
        deviceType
        count
      }
      devices {
        _id
        deviceName
        deviceType
        deviceStatus
      }
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

export const GET_CAMERAS_BY_GREENHOUSE = gql`
  query CamerasByGreenhouse($greenHouseId: ID!) {
    camerasByGreenhouse(greenHouseId: $greenHouseId) {
      _id
      cameraStreamUrl
      cameraStatus
      greenHouseId
      cameraName
      model
      networkStatus
      resolution
      encoding
      createdAt
      updatedAt
    }
  }
`;

export const GET_TASK_BOARD_OVERVIEW = gql`
  query TaskBoardOverview($greenHousesId: ID!) {
    taskBoardOverview(greenHousesId: $greenHousesId) {
      greenHouseId
      totalTasks
      completedTasks
      inProgressTasks
      overdueTasks
      columns {
        status
        count
        tasks {
          _id
          taskTitle
          taskDescription
          taskStatus
          taskPriority
          dueDate
        }
      }
    }
  }
`;
