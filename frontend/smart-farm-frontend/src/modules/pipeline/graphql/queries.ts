import { gql } from "@apollo/client";

export const GET_PIPELINE_OVERVIEW = gql`
  query PipelineOverview($greenHouseId: ID!) {
    pipelineOverview(greenHouseId: $greenHouseId) {
      greenHouseId
      readingsLast24h
      readingsLastHour
      anomaliesLast24h
      errorsLast24h
      throughput {
        hour
        readings
        anomalies
      }
      sensors {
        sensorId
        sensorType
        unit
        deviceName
        mean
        std
        sampleSize
        lastValue
        lastReadingAt
        anomaliesLast24h
      }
      devices {
        deviceId
        deviceName
        deviceStatus
        lastSeenAt
        sensorCount
      }
      recentAnomalies {
        _id
        sensorType
        value
        zScore
        meanValue
        severity
        detectedAt
      }
    }
  }
`;
