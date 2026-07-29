import { gql } from "@apollo/client";

export const GET_FULL_GREENHOUSE_REPORT = gql`
  query GreenhouseFullReport($input: GetReportInput!) {
    greenhouseFullReport(input: $input) {
      summary {
        greenHouseId
        greenHouseName
        totalAlerts
        unresolvedAlerts
        totalWaterUsage
        plantHealthScore
        periodStart
        periodEnd
        sensorAverages {
          avgTemperature
          avgHumidity
          avgPh
          avgCo2
          avgSoilMoisture
          avgLight
        }
      }
      plantHealth {
        currentHealthIndex
        changePercent
        status
        trend {
          date
          healthIndex
          plantValue
        }
      }
      soilMoisture {
        average
        min
        max
        changePercent
        dataPoints {
          recordedAt
          value
        }
      }
      waterUsage {
        totalUsage
        dailyAverage
        changePercent
        dataPoints {
          date
          amount
        }
      }
      alertsSummary {
        total
        critical
        warning
        info
        items {
          alertsType
          alertsSeverity
          count
          lastOccurred
        }
      }
      trendCharts {
        sensorType
        unit
        current
        average
        min
        max
        dataPoints {
          timestamp
          value
        }
      }
    }
  }
`;

export const GET_ACTIVE_ALERTS_SUMMARY = gql`
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
        sectionId
        deviceId
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_REPORT_ENTRIES = gql`
  query ReportEntries($input: GetReportEntriesInput!) {
    reportEntries(input: $input) {
      items {
        _id
        entryDate
        sectionName
        plantName
        areaM2
        healthIndex
        status
        harvestPrediction
        soilMoisture
        humidity
        pestDisease
        description
      }
      total
      page
      totalPages
    }
  }
`;

export const GENERATE_REPORT_ENTRY = gql`
  mutation GenerateReportEntry($input: CreateReportEntryInput!) {
    generateReportEntry(input: $input) {
      _id
      sectionName
      healthIndex
      status
    }
  }
`;

export const GET_WATER_EFFICIENCY_REPORT = gql`
  query WaterEfficiencyReport($input: GetWaterAnalyticsInput!) {
    waterEfficiencyReport(input: $input) {
      efficiencyScore
      averageWaterPerPlant
      irrigationDurationMinutes
      totalUsage
    }
  }
`;

export const GET_WATER_ANOMALY_DETECTION = gql`
  query WaterAnomalyDetection($input: GetWaterAnalyticsInput!) {
    waterAnomalyDetection(input: $input) {
      anomalyCount
      alertThresholdPercent
      lastScan
      anomalies {
        date
        amount
        deviationPercent
      }
    }
  }
`;

export const GET_WATER_COST_ESTIMATION = gql`
  query WaterCostEstimation($input: GetWaterAnalyticsInput!) {
    waterCostEstimation(input: $input) {
      costPerDay
      trendPercent
      status
      costPerLiter
    }
  }
`;

export const GET_WATER_ZONE_USAGE_REPORT = gql`
  query WaterZoneUsageReport($input: GetWaterAnalyticsInput!) {
    waterZoneUsageReport(input: $input) {
      zones {
        sectionId
        sectionName
        totalUsage
        note
      }
    }
  }
`;

export const SAVE_REPORT_MUTATION = gql`
  mutation SaveReport($input: SaveReportInput!) {
    saveReport(input: $input) {
      _id
      reportsType
      generatedAt
    }
  }
`;
