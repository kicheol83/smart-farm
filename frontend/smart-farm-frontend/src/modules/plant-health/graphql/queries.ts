import { gql } from "@apollo/client";

export const GET_GREENHOUSE_SECTION_OVERVIEW = gql`
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
        greenHouseId
        updatedAt
      }
    }
  }
`;

export const GET_SECTION_MONITORING_DETAIL = gql`
  query SectionMonitoringDetail($sectionId: ID!) {
    sectionMonitoringDetail(sectionId: $sectionId) {
      sectionId
      sectionName
      sectionStatus
      healthIndex
      temperature
      humidity
      soilMoisture
      ph
      lastUpdated
    }
  }
`;

export const GET_ALL_CROPS = gql`
  query AllCrops {
    crops {
      _id
      cropsName
    }
  }
`;

export const GET_SECTIONS_BY_GREENHOUSE = gql`
  query SectionsByGreenhouse($greenHouseId: ID!) {
    sectionsByGreenhouse(greenHouseId: $greenHouseId) {
      _id
      sectionName
      sectionType
      sectionStatus
      sectionArea
      plantCount
      currentHealthIndex
      greenHouseId
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_ACTION_LOGS = gql`
  query MyActionLogs($input: GetActionLogsInput!) {
    myActionLogs(input: $input) {
      items {
        _id
        actionType
        actionResource
        description
        memberFullName
        createdAt
      }
      total
    }
  }
`;
