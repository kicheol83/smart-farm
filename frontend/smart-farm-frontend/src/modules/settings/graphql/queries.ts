import { gql } from "@apollo/client";

export const GET_FARM = gql`
  query GetFarm($farmId: ID!) {
    farm(farmId: $farmId) {
      _id
      farmName
      farmLocation
      farmDescription
    }
  }
`;

export const UPDATE_FARM = gql`
  mutation UpdateFarm($farmId: ID!, $input: UpdateFarmInput!) {
    updateFarm(farmId: $farmId, input: $input) {
      _id
      farmName
      farmLocation
      farmDescription
    }
  }
`;

export const GET_MY_SETTINGS = gql`
  query MySettings {
    mySettings {
      _id
      language
      timezone
      units {
        temperatureUnit
        areaUnit
        waterUnit
        timeFormat
      }
    }
  }
`;

export const UPDATE_GENERAL_SETTINGS = gql`
  mutation UpdateGeneralSettings($input: UpdateGeneralSettingsInput!) {
    updateGeneralSettings(input: $input) {
      _id
      language
      timezone
    }
  }
`;

export const UPDATE_UNIT_SETTINGS = gql`
  mutation UpdateUnitSettings($input: UpdateGeneralSettingsInput!) {
    updateUnitSettings(input: $input) {
      _id
      units {
        temperatureUnit
        areaUnit
        waterUnit
        timeFormat
      }
    }
  }
`;

export const GET_MY_NOTIFICATION_SETTINGS = gql`
  query MyNotificationSettingsForSettings {
    myNotificationSettings {
      _id
      enabled
      channels {
        email
        push
        inApp
      }
      criticalAlerts
      warningAlerts
      infoAlerts
      deviceOfflineAlerts
      reportReadyAlerts
      floatingNotifications
      lockScreenNotifications
      notificationsManagement
      triggerEveryNMessages
      sendOncePerDays
    }
  }
`;

export const UPDATE_NOTIFICATION_SETTINGS = gql`
  mutation UpdateNotificationSettingsForSettings(
    $input: UpdateNotificationSettingsInput!
  ) {
    updateNotificationSettings(input: $input) {
      _id
      enabled
      channels {
        email
        push
        inApp
      }
      criticalAlerts
      warningAlerts
      infoAlerts
      deviceOfflineAlerts
      reportReadyAlerts
      floatingNotifications
      lockScreenNotifications
      notificationsManagement
      triggerEveryNMessages
      sendOncePerDays
    }
  }
`;

export const GET_MY_ACTION_LOGS_FOR_SETTINGS = gql`
  query MyActionLogsForSettings($input: GetActionLogsInput!) {
    myActionLogs(input: $input) {
      items {
        _id
        actionType
        actionResource
        description
        memberFullName
        device
        ipAddress
        actionCode
        createdAt
      }
      total
      page
    }
  }
`;
