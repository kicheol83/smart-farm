import { gql } from "@apollo/client";

export const GET_ADMIN_GLOBAL_STATS = gql`
  query AdminGlobalStats {
    adminGlobalStats {
      totalMembers
      activeMembers
      inactiveMembers
      totalFarms
      totalGreenhouses
      totalDevices
      onlineDevices
      offlineDevices
      totalSensors
      alertsLast24h
      criticalAlertsCount
      totalTasks
      completedTasks
      overdueTasks
    }
  }
`;

export const GET_ADMIN_MEMBER_GROWTH_TREND = gql`
  query AdminMemberGrowthTrend($input: GetGrowthTrendInput!) {
    adminMemberGrowthTrend(input: $input) {
      newRegistrations
      growthPercent
      dataPoints {
        date
        count
      }
    }
  }
`;

export const GET_ADMIN_MEMBERS = gql`
  query AdminMembers($input: GetAdminMembersInput!) {
    adminMembers(input: $input) {
      items {
        _id
        memberFullName
        memberEmail
        memberRole
        memberStatus
        memberAvatar
        farmsCount
        createdAt
      }
      total
      page
      totalPages
    }
  }
`;

export const UPDATE_MEMBER_ROLE = gql`
  mutation AdminUpdateMemberRole($input: UpdateMemberRoleInput!) {
    adminUpdateMemberRole(input: $input) {
      _id
      memberRole
    }
  }
`;

export const UPDATE_MEMBER_STATUS = gql`
  mutation AdminUpdateMemberStatus($input: UpdateMemberStatusInput!) {
    adminUpdateMemberStatus(input: $input) {
      _id
      memberStatus
    }
  }
`;

export const DELETE_MEMBER = gql`
  mutation AdminDeleteMember($memberId: ID!) {
    adminDeleteMember(memberId: $memberId)
  }
`;

export const GET_ADMIN_DEVICE_HEALTH = gql`
  query AdminDeviceHealth($input: GetDeviceHealthInput!) {
    adminDeviceHealth(input: $input) {
      items {
        deviceId
        deviceName
        deviceStatus
        deviceType
        greenHouseName
        farmName
        ownerEmail
        installedAt
        updatedAt
      }
      total
      page
      totalPages
    }
  }
`;

export const GET_ADMIN_SYSTEM_ALERTS = gql`
  query AdminSystemAlerts($limit: Int) {
    adminSystemAlerts(limit: $limit) {
      alertId
      alertsType
      alertsSeverity
      alertsThreshold
      ownerEmail
      greenHouseName
      createdAt
    }
  }
`;
