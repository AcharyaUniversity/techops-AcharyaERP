import { useEffect, useState } from "react";
import axios from "../../../services/Api";
import {
  Box,
  Grid,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import { useLocation } from "react-router-dom";
import FormPaperWrapper from "../../../components/FormPaperWrapper";
import InternalAttendanceEntry from "./InternalAttendanceEntry";
import useAlert from "../../../hooks/useAlert";
import InternalTimeTableAttendanceReport from "./../../masters/InternalTimeTableAttendanceReport";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.headerWhite.main,
    border: "1px solid rgba(224, 224, 224, 1)",
    textAlign: "center",
  },
}));

const StyledTableCellBody = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.body}`]: {
    border: "1px solid rgba(224, 224, 224, 1)",
  },
}));

function InternalAssesmentAttendance() {
  const [attendanceTaken, setAttendanceTaken] = useState(false);

  const setCrumbs = useBreadcrumbs();
  const location = useLocation();
  const { setAlertMessage, setAlertOpen } = useAlert();

  const eventDetails = location.state?.eventDetails;

  useEffect(() => {
    checkAttendanceStatus();
    setCrumbs([
      { name: "Calendar", link: "/dashboard" },
      { name: "Internal Assesment Attendance" },
    ]);
  }, []);

  const checkAttendanceStatus = async () => {
    try {
      const attRes = await axios.get(
        `/api/academic/checkInternalExamAttendanceStatusList/${eventDetails.stdAssignmentids}`
      );
      const attendanceStatusData = attRes.data.data;
      const statusList = attendanceStatusData.filter(
        (obj) => obj.attendance_status === true
      );
      setAttendanceTaken(attendanceStatusData.length === statusList.length);
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message: err.response?.data?.message || "Something went wrong.",
      });
      setAlertOpen(true);
    }
  };

  const DisplayBodyText = ({ label }) => (
    <Typography variant="subtitle2" color="textSecondary">
      {label}
    </Typography>
  );

  return (
    <Box>
      <FormPaperWrapper>
        <Grid container rowSpacing={4}>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Internal Name</StyledTableCell>
                    <StyledTableCell>Exam Date</StyledTableCell>
                    <StyledTableCell>Time Slot</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <StyledTableCellBody>
                      <DisplayBodyText label={eventDetails.internal_name} />
                    </StyledTableCellBody>
                    <StyledTableCellBody
                      sx={{ textAlign: "center !important" }}
                    >
                      <DisplayBodyText label={eventDetails.date_of_exam} />
                    </StyledTableCellBody>
                    <StyledTableCellBody
                      sx={{ textAlign: "center !important" }}
                    >
                      <DisplayBodyText label={eventDetails.timeSlots} />
                    </StyledTableCellBody>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12}>
            {attendanceTaken ? (
              <InternalTimeTableAttendanceReport eventDetails={eventDetails} />
            ) : (
              <InternalAttendanceEntry
                eventDetails={eventDetails}
                checkAttendanceStatus={checkAttendanceStatus}
              />
            )}
          </Grid>
        </Grid>
      </FormPaperWrapper>
    </Box>
  );
}

export default InternalAssesmentAttendance;
