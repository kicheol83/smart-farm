import { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Alert,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

interface Coordinate {
  lat: number;
  lng: number;
}

interface AddMapAreaDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    sectorName: string;
    sectorArea: number;
    centerPoint: Coordinate;
    coordinates: Coordinate[];
  }) => void;
}

function estimatePolygonArea(coords: Coordinate[]): number {
  if (coords.length < 3) return 0;
  const R = 111_320;
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const xi = coords[i].lng * R;
    const yi = coords[i].lat * R;
    const xj = coords[j].lng * R;
    const yj = coords[j].lat * R;
    area += xi * yj - xj * yi;
  }
  return Math.abs(area / 2);
}

export function AddMapAreaDialog({
  open,
  onClose,
  onSubmit,
}: AddMapAreaDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [areaName, setAreaName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedCoords, setParsedCoords] = useState<Coordinate[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  function resetForm() {
    setAreaName("");
    setLocationName("");
    setFileName(null);
    setParsedCoords([]);
    setFileError(null);
    setLatitude("");
    setLongitude("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isGeoJson = /\.(geojson|json)$/i.test(file.name);
    if (!isGeoJson) {
      setFileName(file.name);
      setFileError(
        "Invalid file format. Please upload a boundary file in KML or GeoJSON format.",
      );
      setParsedCoords([]);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        const ring: number[][] =
          json?.geometry?.coordinates?.[0] ??
          json?.coordinates?.[0] ??
          json?.features?.[0]?.geometry?.coordinates?.[0];

        if (!Array.isArray(ring)) {
          throw new Error("no polygon ring found");
        }

        const coords: Coordinate[] = ring.map(([lng, lat]: number[]) => ({
          lat,
          lng,
        }));
        setParsedCoords(coords);
        setFileName(file.name);
        setFileError(null);
      } catch {
        setFileName(file.name);
        setFileError(
          "Invalid file format. Please upload a boundary file in KML or GeoJSON format.",
        );
        setParsedCoords([]);
      }
    };
    reader.readAsText(file);
  }

  function handleSubmit() {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (
      !areaName ||
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      parsedCoords.length < 3
    )
      return;

    onSubmit({
      sectorName: areaName,
      sectorArea: Math.round(estimatePolygonArea(parsedCoords)),
      centerPoint: { lat, lng },
      coordinates: parsedCoords,
    });
    resetForm();
  }

  const canSubmit =
    areaName.length > 0 &&
    latitude.length > 0 &&
    longitude.length > 0 &&
    parsedCoords.length >= 3 &&
    !fileError;
  const estimatedArea =
    parsedCoords.length >= 3
      ? Math.round(estimatePolygonArea(parsedCoords))
      : null;

  return (
    <Dialog
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        New Sector Map Area
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Area Name"
            size="small"
            placeholder="Enter area name"
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
          />
          <TextField
            label="Location Name"
            size="small"
            placeholder="Enter location name"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            helperText="Backend'da hali saqlanmaydi"
          />
        </Box>

        <Box>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
              mb: 0.5,
            }}
          >
            Boundary File
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".geojson,.json,.kml"
            onChange={handleFileChange}
          />

          {fileName ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                border: 1,
                borderColor: fileError ? "error.main" : "divider",
                borderRadius: 2,
                px: 2,
                py: 1.5,
              }}
            >
              <DescriptionRoundedIcon
                fontSize="small"
                sx={{ color: "text.secondary" }}
              />
              <Typography
                sx={{ fontFamily: "Inter, sans-serif", fontSize: 13, flex: 1 }}
              >
                {fileName}
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  setFileName(null);
                  setParsedCoords([]);
                  setFileError(null);
                }}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 2,
                py: 3,
                cursor: "pointer",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <CloudUploadRoundedIcon sx={{ color: "text.secondary" }} />
              <Typography
                sx={{
                  fontFamily: "Satoshi, sans-serif",
                  fontSize: 13,
                  color: "text.primary",
                }}
              >
                Click to upload
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 11,
                  color: "text.secondary",
                }}
              >
                Upload Boundary File (KML/GeoJSON)
              </Typography>
            </Box>
          )}

          {fileError && (
            <Alert severity="error" sx={{ mt: 1, fontSize: 12 }}>
              {fileError}
            </Alert>
          )}
          {estimatedArea !== null && !fileError && (
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "text.secondary",
                mt: 0.5,
              }}
            >
              Taxminiy maydon: ~{estimatedArea.toLocaleString()} m² (
              {parsedCoords.length} nuqta)
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Latitude Coordinates"
            size="small"
            placeholder="Enter latitude coordinates"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
          <TextField
            label="Longitude Coordinates"
            size="small"
            placeholder="Enter longitude coordinates"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          fullWidth
          onClick={() => {
            resetForm();
            onClose();
          }}
          variant="outlined"
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          onClick={handleSubmit}
          disabled={!canSubmit}
          variant="contained"
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
