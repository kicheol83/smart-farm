import { gql } from "@apollo/client";

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
        installedAt
      }
    }
  }
`;

export const GET_DEVICE_WITH_SENSORS = gql`
  query DeviceWithSensors($id: ID!) {
    deviceWithSensors(id: $id) {
      _id
      deviceName
      deviceType
      deviceStatus
      installedAt
      sensors {
        _id
        sensorType
        sensorsUnit
      }
    }
  }
`;

export const CREATE_DEVICE_MUTATION = gql`
  mutation CreateDevice($input: CreateDeviceInput!) {
    createDevice(input: $input) {
      _id
      deviceName
    }
  }
`;

export const UPDATE_DEVICE_STATUS_MUTATION = gql`
  mutation UpdateDeviceStatus($id: ID!, $status: DeviceStatus!) {
    updateDeviceStatus(id: $id, status: $status) {
      _id
      deviceStatus
    }
  }
`;

export const DELETE_DEVICE_MUTATION = gql`
  mutation DeleteDevice($id: ID!) {
    deleteDevice(id: $id)
  }
`;

export const GET_GREENHOUSE_SOIL_MOISTURE = gql`
  query GreenhouseSoilMoisture($greenHouseId: ID!) {
    greenhouseSensorSummary(greenHouseId: $greenHouseId) {
      soilMoisture
    }
  }
`;
