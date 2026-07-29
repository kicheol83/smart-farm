import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
} from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Header } from "@/components/layout/Header";
import { SectorAreaListItem } from "../components/SectorAreaListItem";
import { MapAreaView } from "../components/MapAreaView";
import { AddMapAreaDialog } from "../components/AddMapAreaDialog";
import { DateSelectorRow } from "../components/DateSelectorRow";
import { MapAreaTrendChart } from "../components/MapAreaTrendChart";
import {
  GET_GREENHOUSE_FARM_ID,
  GET_FIELD_MAPS_BY_FARM,
  GET_FIELD_MAP_WITH_SECTORS,
  GET_FIELD_NDVI_MAP,
  GET_FIELD_ANALYTICS,
  CREATE_SECTOR_MUTATION,
  DELETE_SECTOR_MUTATION,
} from "../graphql/queries";

export function MapAreaPage() {
  localStorage.setItem("greenHouseId", "6a2daf715e4567e07ca5d328");
  const greenHouseId = localStorage.getItem("greenHouseId") || "";
  const hasGreenhouse = greenHouseId.length > 0;

  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuSectorId, setMenuSectorId] = useState<string | null>(null);

  const { data: farmData } = useQuery(GET_GREENHOUSE_FARM_ID, {
    variables: { id: greenHouseId },
    skip: !hasGreenhouse,
  });
  const farmsId = farmData?.greenhouse?.farmsId;

  const { data: fieldMapsData } = useQuery(GET_FIELD_MAPS_BY_FARM, {
    variables: { farmId: farmsId },
    skip: !farmsId,
  });
  const fieldId = fieldMapsData?.fieldMapsByFarm?.[0]?._id;

  const { data: fieldDetailData, refetch: refetchField } = useQuery(
    GET_FIELD_MAP_WITH_SECTORS,
    {
      variables: { fieldId },
      skip: !fieldId,
    },
  );

  const { data: ndviData } = useQuery(GET_FIELD_NDVI_MAP, {
    variables: { fieldId },
    skip: !fieldId,
  });

  const { data: analyticsData } = useQuery(GET_FIELD_ANALYTICS, {
    variables: { fieldId },
    skip: !fieldId,
  });

  const [createSector] = useMutation(CREATE_SECTOR_MUTATION);
  const [deleteSector] = useMutation(DELETE_SECTOR_MUTATION);

  const fieldMap = fieldDetailData?.fieldMapWithSectors;
  const sectors = fieldMap?.sectors ?? [];
  const selectedSector =
    sectors.find((s: any) => s._id === selectedSectorId) ?? sectors[0];

  async function handleCreateSector(data: {
    sectorName: string;
    sectorArea: number;
    centerPoint: any;
    coordinates: any[];
  }) {
    if (!fieldId) return;
    await createSector({
      variables: {
        input: {
          sectorName: data.sectorName,
          sectorArea: data.sectorArea,
          coordinates: data.coordinates,
          centerPoint: data.centerPoint,
          fieldId,
        },
      },
    });
    setDialogOpen(false);
    setSuccessOpen(true);
    refetchField();
  }

  async function handleDeleteSector() {
    if (!menuSectorId) return;
    await deleteSector({ variables: { id: menuSectorId } });
    setMenuAnchor(null);
    refetchField();
  }

  if (!hasGreenhouse) {
    return (
      <>
        <Header title="Map" />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60%",
          }}
        >
          <Typography color="text.secondary">
            Hali greenhouse tanlanmagan
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header title="Map" />

      {/* Import + Add Map Area */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<FileUploadOutlinedIcon fontSize="small" />}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Import
        </Button>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon fontSize="small" />}
          onClick={() => setDialogOpen(true)}
          disabled={!fieldId}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Add Map Area
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "300px 1fr" },
          gap: 2,
          height: { lg: "calc(100vh - 200px)" },
        }}
      >
        {/* Chap panel */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 2,
            overflowY: "auto",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "text.primary",
              mb: 1,
            }}
          >
            Sector Map Area
          </Typography>

          {sectors.map((s: any) => (
            <SectorAreaListItem
              key={s._id}
              sectorName={s.sectorName}
              sectorArea={s.sectorArea}
              centerPoint={s.centerPoint}
              locationName={fieldMap?.locationName}
              selected={s._id === selectedSector?._id}
              onClick={() => setSelectedSectorId(s._id)}
              onMenuOpen={(e) => {
                setMenuAnchor(e.currentTarget);
                setMenuSectorId(s._id);
              }}
            />
          ))}

          {sectors.length === 0 && (
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "text.secondary",
                textAlign: "center",
                py: 3,
              }}
            >
              {fieldId
                ? "Hali sector qo'shilmagan"
                : "Field xaritasi topilmadi"}
            </Typography>
          )}
        </Box>

        {/* Xarita */}
        <MapAreaView
          sectors={sectors}
          selectedSector={selectedSector}
          averageNdvi={ndviData?.fieldNdviMap?.averageNdvi}
          locationName={fieldMap?.locationName}
          onSelectSector={setSelectedSectorId}
          onOpenInfoMenu={(e) => {
            setMenuAnchor(e.currentTarget);
            setMenuSectorId(selectedSector?._id ?? null);
          }}
        />
      </Box>

      {/* Sana tanlagich + trend grafigi */}
      {fieldId && (
        <Box sx={{ mt: 2 }}>
          <DateSelectorRow
            dates={(analyticsData?.fieldAnalytics?.analyticsHistory ?? []).map(
              (p: any) => p.date,
            )}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
          />
          <MapAreaTrendChart
            points={analyticsData?.fieldAnalytics?.analyticsHistory ?? []}
          />
        </Box>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={handleDeleteSector} sx={{ color: "error.main" }}>
          Delete Sector
        </MenuItem>
      </Menu>

      <AddMapAreaDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateSector}
      />

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity="success"
          onClose={() => setSuccessOpen(false)}
          sx={{ borderRadius: 2 }}
        >
          Sector Map Area successfully added!
        </Alert>
      </Snackbar>
    </>
  );
}
