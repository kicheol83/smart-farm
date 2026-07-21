import { gql } from "@apollo/client";

export const GET_GREENHOUSE_FARM_ID = gql`
  query GetGreenhouseFarmId($id: ID!) {
    greenhouse(id: $id) {
      _id
      farmsId
    }
  }
`;

export const GET_FIELD_MAPS_BY_FARM = gql`
  query FieldMapsByFarm($farmId: ID!) {
    fieldMapsByFarm(farmId: $farmId) {
      _id
      fieldName
      totalArea
      centerPoint {
        lat
        lng
      }
    }
  }
`;

export const GET_FIELD_MAP_WITH_SECTORS = gql`
  query FieldMapWithSectors($fieldId: ID!) {
    fieldMapWithSectors(fieldId: $fieldId) {
      _id
      fieldName
      totalArea
      farmId
      createdAt
      updatedAt
      boundaryCoordinates {
        lat
        lng
      }
      centerPoint {
        lat
        lng
      }
      sectors {
        _id
        sectorName
        sectorStatus
        sectorArea
        ndviValue
        ndviLevel
        healthIndex
        fieldId
        cropsId
        createdAt
        updatedAt
        coordinates {
          lat
          lng
        }
        centerPoint {
          lat
          lng
        }
      }
    }
  }
`;

export const CREATE_SECTOR_MUTATION = gql`
  mutation CreateSector($input: CreateSectorInput!) {
    createSector(input: $input) {
      _id
      sectorName
    }
  }
`;

export const CREATE_FIELD_MAP_MUTATION = gql`
  mutation CreateFieldMap($input: CreateFieldMapInput!) {
    createFieldMap(input: $input) {
      _id
      fieldName
    }
  }
`;

export const DELETE_SECTOR_MUTATION = gql`
  mutation DeleteSector($id: ID!) {
    deleteSector(id: $id)
  }
`;

export const GET_FIELD_NDVI_MAP = gql`
  query FieldNdviMap($fieldId: ID!) {
    fieldNdviMap(fieldId: $fieldId) {
      fieldId
      averageNdvi
      lastUpdated
    }
  }
`;

export const GET_FIELD_ANALYTICS = gql`
  query FieldAnalytics($fieldId: ID!, $from: String, $to: String) {
    fieldAnalytics(fieldId: $fieldId, from: $from, to: $to) {
      fieldId
      fieldName
      avgNdvi
      avgHealthIndex
      totalSectors
      activeSectors
      analyticsHistory {
        date
        ndviValue
        healthIndex
        soilMoisture
      }
    }
  }
`;
