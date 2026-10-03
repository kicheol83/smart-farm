import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Header } from "@/components/layout/Header";
import { ReportDetailsTable } from "../components/ReportDetailsTable";
import { GET_REPORT_ENTRIES, GENERATE_REPORT_ENTRY } from "../graphql/queries";
import { GET_SECTIONS_BY_GREENHOUSE } from "@/modules/plant-health/graphql/queries";
import { useActiveGreenhouse } from "@/lib/useActiveGreenhouse";
import { t } from "@/i18n/core";

export function ReportDetailsPage() {
  const { greenHouseId } = useActiveGreenhouse();
  const hasGreenhouse = greenHouseId.length > 0;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [pestDisease, setPestDisease] = useState("");
  const [description, setDescription] = useState("");

  const { data, refetch } = useQuery(GET_REPORT_ENTRIES, {
    variables: { input: { greenHouseId, page, limit: pageSize } },
    skip: !hasGreenhouse,
  });

  const { data: sectionsData } = useQuery(GET_SECTIONS_BY_GREENHOUSE, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
  });

  const [generateEntry, { loading: generating }] = useMutation(
    GENERATE_REPORT_ENTRY,
  );

  const entries = data?.reportEntries?.items ?? [];
  const total = data?.reportEntries?.total ?? 0;
  const sections = sectionsData?.sectionsByGreenhouse ?? [];

  async function handleGenerate() {
    if (!selectedSectionId) return;
    await generateEntry({
      variables: {
        input: {
          sectionId: selectedSectionId,
          pestDisease: pestDisease || undefined,
          description: description || undefined,
        },
      },
    });
    setDialogOpen(false);
    setSelectedSectionId("");
    setPestDisease("");
    setDescription("");
    refetch();
  }

  function handleExport() {
    const rows = [
      [
        t("txt.date"),
        t("txt.plant"),
        t("txt.area"),
        t("txt.health"),
        t("txt.status"),
        t("txt.harvest_prediction"),
        t("txt.moisture"),
        t("txt.humidity"),
        t("txt.pest_disease"),
        t("txt.description"),
      ],
      ...entries.map((e: any) => [
        new Date(e.entryDate).toISOString().slice(0, 10),
        e.plantName ?? "",
        e.areaM2 ?? "",
        e.healthIndex,
        e.status,
        e.harvestPrediction
          ? new Date(e.harvestPrediction).toISOString().slice(0, 10)
          : "",
        e.soilMoisture ?? "",
        e.humidity ?? "",
        e.pestDisease ?? "",
        e.description ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report-details.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!hasGreenhouse) {
    return (
      <>
        <Header title={t("txt.report_details")} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60%",
          }}
        >
          <Typography color="text.secondary">
            {t("txt.no_greenhouse_selected_yet")}
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header title={t("txt.report_details")} />

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-end",
          gap: 1,
          mb: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
          onClick={handleExport}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {t("txt.export")}
        </Button>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon fontSize="small" />}
          onClick={() => setDialogOpen(true)}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {t("txt.generate_entry")}
        </Button>
      </Box>

      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          fontSize: 20,
          color: "text.primary",
          mb: 2,
        }}
      >
        {t("txt.report_details")}
      </Typography>

      <ReportDetailsTable
        entries={entries}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ fontFamily: "Satoshi, sans-serif", fontWeight: 700 }}
        >
          {t("txt.generate_report_entry")}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <TextField
            select
            label={t("txt.section")}
            fullWidth
            size="small"
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
          >
            {sections.map((s: any) => (
              <MenuItem key={s._id} value={s._id}>
                {s.sectionName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t("txt.pest_disease_optional")}
            fullWidth
            size="small"
            placeholder={t("txt.no_pest")}
            value={pestDisease}
            onChange={(e) => setPestDisease(e.target.value)}
          />
          <TextField
            label={t("txt.description_optional")}
            fullWidth
            multiline
            rows={2}
            size="small"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ textTransform: "none" }}
          >
            {t("txt.cancel")}
          </Button>
          <Button
            onClick={handleGenerate}
            variant="contained"
            disabled={!selectedSectionId || generating}
            sx={{ textTransform: "none" }}
          >
            {t("txt.generate")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
