import { gql } from "@apollo/client";

/**
 * Backend: module2/report.resolver.ts → greenhouseFullReport(input: GetReportInput!)
 *
 * Bitta so'rov 6 ta panelni qaytaradi — barcha Report sahifalari
 * (Greenhouse Report, Overall Plant Health, Soil Moisture Trend,
 * Water Usage Analytics, Alerts Summary) shu queryning turli qismlaridan
 * foydalanadi.
 *
 * MUHIM: har bir maydon nomi report.dto.ts fayli bilan qator-baqator
 * solishtirilgan — quyidagi "g'alati" nomlarga alohida e'tibor bering:
 *   - sensorAverages ichida "avg" prefiksi bor (avgTemperature, avgPh...)
 *   - top-level panel nomi "sensorTrends" emas — "trendCharts"
 *   - OverallPlantHealthReport: "currentHealthIndex" (currentScore emas)
 *   - WaterUsageReport: "totalUsage" + "dataPoints" (total/points emas),
 *     WaterUsagePoint ichida "amount" (liters emas)
 *   - SoilMoistureTrendReport: "dataPoints" (trend emas), "current" YO'Q
 *     (faqat average/min/max bor), SoilMoistureTrendPoint da "recordedAt"
 *   - SensorTrendChart: "dataPoints" (points emas), TrendChartPoint da "timestamp"
 */
export const GET_FULL_GREENHOUSE_REPORT = gql`
  query GreenhouseFullReport($input: GetReportInput!) {
    greenhouseFullReport(input: $input) {
      summary {
        greenHouseId
        greenHouseName
        sensorAverages {
          avgTemperature
          avgHumidity
          avgPh
          avgCo2
          avgSoilMoisture
          avgLight
        }
        totalAlerts
        unresolvedAlerts
        totalWaterUsage
        plantHealthScore
        periodStart
        periodEnd
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
        alertsSeverity
      }
    }
  }
`;

export const GET_SAVED_REPORTS = gql`
  query SavedReports($greenHouseId: ID!) {
    savedReports(greenHouseId: $greenHouseId) {
      _id
      reportsType
      generatedAt
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
