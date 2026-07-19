import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Box, Typography, Button } from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import { Header } from "@/components/layout/Header";
import { ReportDetailsTable } from "../components/ReportDetailsTable";
import { GET_SAVED_REPORTS } from "../graphql/queries";

export function ReportDetailsPage() {
  localStorage.setItem("greenHouseId", "6a2daf715e4567e07ca5d328");
  const greenHouseId = localStorage.getItem("greenHouseId") || "";
  const hasGreenhouse = greenHouseId.length > 0;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data } = useQuery(GET_SAVED_REPORTS, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
  });

  const reports = data?.savedReports ?? [];

  function handleExport() {
    const rows = [
      ["Date", "Type"],
      ...reports.map((r: any) => [
        new Date(r.generatedAt).toISOString().slice(0, 10),
        r.reportsType,
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
        <Header title="Report Details" />
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
      <Header title="Report Details" />

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
          Export
        </Button>
        <Button
          variant="outlined"
          startIcon={<CalendarTodayRoundedIcon fontSize="small" />}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Date Range
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
        Report Details
      </Typography>

      <ReportDetailsTable
        reports={reports}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </>
  );
}
