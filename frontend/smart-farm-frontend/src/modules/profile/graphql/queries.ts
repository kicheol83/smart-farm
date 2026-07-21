import { gql } from "@apollo/client";

export const UPLOAD_AVATAR_MUTATION = gql`
  mutation UploadAvatar($file: Upload!) {
    uploadAvatar(file: $file) {
      url
      key
      originalName
      mimeType
      size
    }
  }
`;

export const REQUEST_SENSITIVE_UPDATE = gql`
  mutation RequestSensitiveUpdate($input: RequestSensitiveUpdateInput!) {
    requestSensitiveUpdate(input: $input) {
      message
    }
  }
`;

export const CONFIRM_SENSITIVE_UPDATE = gql`
  mutation ConfirmSensitiveUpdate($input: ConfirmSensitiveUpdateInput!) {
    confirmSensitiveUpdate(input: $input) {
      message
      accessToken
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      message
    }
  }
`;

export const GET_DELETE_ACCOUNT_REASONS = gql`
  query DeleteAccountReasons {
    deleteAccountReasons {
      value
      label
    }
  }
`;

export const DELETE_ACCOUNT_MUTATION = gql`
  mutation DeleteAccount($input: DeleteAccountInput!) {
    deleteAccount(input: $input) {
      message
    }
  }
`;
