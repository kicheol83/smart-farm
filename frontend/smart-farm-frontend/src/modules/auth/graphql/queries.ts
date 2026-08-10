import { gql } from "@apollo/client";

export const GOOGLE_AUTH_MUTATION = gql`
  mutation GoogleAuth($input: GoogleAuthInput!) {
    googleAuth(input: $input) {
      accessToken
      isNewMember
    }
  }
`;