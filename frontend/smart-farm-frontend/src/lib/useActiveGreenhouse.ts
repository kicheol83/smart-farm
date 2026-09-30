import { gql, useQuery } from "@apollo/client";
import { useEffect } from "react";

const STORAGE_KEY = "greenHouseId";

const GET_MY_FARMS_FOR_GREENHOUSE = gql`
  query ActiveGreenhouseFarms {
    myFarms {
      _id
    }
  }
`;

const GET_GREENHOUSES_FOR_FARM = gql`
  query ActiveGreenhouseList($farmsId: ID!) {
    greenhousesByFarm(farmsId: $farmsId) {
      _id
      greenHouseName
    }
  }
`;

type GreenhouseOption = {
  _id: string;
  greenHouseName: string;
};

export function useActiveGreenhouse(): {
  greenHouseId: string;
  greenHouseName: string;
  greenhouses: GreenhouseOption[];
  loading: boolean;
} {
  const stored = localStorage.getItem(STORAGE_KEY) ?? "";

  const { data: farmsData, loading: farmsLoading } = useQuery(GET_MY_FARMS_FOR_GREENHOUSE);
  const farmsId: string | undefined = farmsData?.myFarms?.[0]?._id;

  const { data: greenhouseData, loading: greenhousesLoading } = useQuery(GET_GREENHOUSES_FOR_FARM, {
    variables: { farmsId },
    skip: !farmsId,
  });

  const greenhouses: GreenhouseOption[] = greenhouseData?.greenhousesByFarm ?? [];
  const loading = farmsLoading || greenhousesLoading;
  const active = greenhouses.find((greenhouse) => greenhouse._id === stored) ?? greenhouses[0];
  const greenHouseId = active?._id ?? "";

  useEffect(() => {
    if (loading) {
      return;
    }
    if (greenHouseId !== "" && greenHouseId !== stored) {
      localStorage.setItem(STORAGE_KEY, greenHouseId);
    } else if (greenHouseId === "" && stored !== "") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [greenHouseId, loading, stored]);

  return {
    greenHouseId,
    greenHouseName: active?.greenHouseName ?? "",
    greenhouses,
    loading,
  };
}
