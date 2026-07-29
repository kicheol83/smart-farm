import { gql } from "@apollo/client";

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

export const GET_CAMERA_SNAPSHOTS = gql`
  query CameraSnapshots($cameraId: ID!, $limit: Int) {
    cameraSnapshots(cameraId: $cameraId, limit: $limit) {
      _id
      snapshotUrl
      captureAt
    }
  }
`;

export const UPDATE_CAMERA_STATUS_MUTATION = gql`
  mutation UpdateCameraStatus($id: ID!, $status: CameraStatus!) {
    updateCameraStatus(id: $id, status: $status) {
      _id
      cameraStatus
    }
  }
`;

export const SAVE_SNAPSHOT_MUTATION = gql`
  mutation SaveSnapshot($input: CreateSnapshotInput!) {
    saveSnapshot(input: $input) {
      _id
      snapshotUrl
    }
  }
`;
