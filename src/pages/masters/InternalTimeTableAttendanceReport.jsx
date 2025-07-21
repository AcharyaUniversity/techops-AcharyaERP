import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Third-party imports
import axios from "../../services/Api";
import { Dialog, DialogTitle, DialogContent, Button, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Alert } from "@mui/material";

// Local component imports
import GridIndex from "../../components/GridIndex";
import CustomSelect from "../../components/Inputs/CustomSelect";
import OverlayLoader from "../../components/OverlayLoader";
import useBreadcrumbs from "../../hooks/useBreadcrumbs";

const empId = sessionStorage.getItem("empId");

const FacultyDetailsAttendanceReportView = () => {
  const location = useLocation();
  const { eventDetails } = location.state;
  const setCrumbs = useBreadcrumbs();

  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [newStatus, setNewStatus] = useState(true); // Default to boolean for consistency
  const [updateModel, setUpdateModel] = useState(false);
  const [attendanceUpdateInfo, setAttendanceUpdateInfo] = useState("");
  const [eligibleToUpdateAttendance, setEligibleToUpdateAttendance] =
    useState(false);

  // --- Effects ---

  useEffect(() => {
    getData();
    setCrumbs([
      { name: "Calendar", link: "/Dashboard" },
      { name: "Attendance" },
    ]);
  }, []);

  useEffect(() => {
    attendanceUpdateEligibilityCheck();
  }, [data]);

  // --- API Calls ---

  const getData = async () => {
    setLoader(true);
    try {
      const res = await axios.get(
        `/api/academic/getInternalAttendanceDetailsOfStudentList/${eventDetails.internal_id}/${eventDetails.emp_ids}`
      );
      const result = res.data.data?.map((_data, index) => ({
        ..._data,
        exam_attendance_id: _data?.id,
        id: index, // Unique ID for the grid row
        present: _data?.present_status,
      }));
      setData(result || []);
    } catch (err) {
      console.error("Failed to fetch attendance data:", err);
    } finally {
      setLoader(false);
    }
  };

  const attendanceUpdateEligibilityCheck = () => {
    if (data.length > 0) {
      //  Date object from attendance created timestamp
      const attendanceCreatedTime = new Date(data[0].created_date);
      console.log(attendanceCreatedTime);
      // Current Date object
      const currentTime = new Date();

      // 1. Calculate the difference in milliseconds
      const diffInMilliseconds =
        currentTime.getTime() - attendanceCreatedTime.getTime();

      // 2. Calculate 48 hours in milliseconds (48 * 60 minutes * 60 seconds * 1000 ms)
      const fortyEightHoursInMilliseconds = 48 * 60 * 60 * 1000;

      // 3. Check if the difference is positive and less than 48 hours
      const isLessThan48Hours =
        diffInMilliseconds > 0 &&
        diffInMilliseconds < fortyEightHoursInMilliseconds;

      if (isLessThan48Hours) {
        setEligibleToUpdateAttendance(true);
        setAttendanceUpdateInfo(
          "Attendance can only be updated within 48 hours of being marked."
        );
      } else {
        setEligibleToUpdateAttendance(false);

        setAttendanceUpdateInfo(
          "The 48-hour period for modifying this attendance record has passed."
        );
      }

      return isLessThan48Hours;
    }

    return false;
  };

  const updateAttendance = async () => {
    if (!editingStudent) return;
    const payload = [
      {
        exam_attendance_id: editingStudent.exam_attendance_id,
        present_status: newStatus ? "P" : "A",
      },
    ];
    await axios
      .put(`/api/academic/updateInternalAttendance`, payload)
      .then((res) => {
        if (res?.data?.success) {
          setEditingStudent(null);
          getData();
        }
      })
      .catch((err) => console.error("Failed to update attendance:", err));
  };

  const updateAttendanceInBulk = async () => {
    const payload = selectedRows.map((row) => ({
      exam_attendance_id: row.exam_attendance_id,
      present_status: newStatus ? "P" : "A",
    }));

    await axios
      .put(`/api/academic/updateInternalAttendance`, payload)
      .then((res) => {
        if (res?.data?.success) {
          setUpdateModel(false);
          setSelectedRows([]);
          getData();
        }
      })
      .catch((err) => console.error("Failed to update bulk attendance:", err));
  };

  // --- Handlers & Helpers ---

  const handleEditClick = (item) => {
    // Check if the item from the grid row is valid
    if (item) {
      setEditingStudent(item);

      // This line correctly converts the string "P" into the boolean `true`
      const isPresent =
        item.present_status === true || item.present_status === "P";

      // This sets the state for the dropdown, which will now correctly select "Present"
      setNewStatus(isPresent);
    }
  };

  const onSelectionModelChange = (ids) => {
    const selected = ids.map((id) => data.find((row) => row.id === id));
    setSelectedRows(selected);
  };

  const checkFullAccess = (employeeId) => {
    const rolesWithAccess = [1, 5]; // Admin, Super Admin
    const currentEmpId = sessionStorage.getItem("empId");
    try {
      const { roleId } = JSON.parse(sessionStorage.getItem("AcharyaErpUser"));
      return (
        rolesWithAccess.includes(roleId) ||
        (currentEmpId == employeeId && eligibleToUpdateAttendance)
      );
    } catch (error) {
      console.error("Failed to parse user data from sessionStorage:", error);
      return false;
    }
  };

  // --- Grid Columns ---

  const columns = [
    { field: "auid", headerName: "AUID", flex: 1 },
    { field: "student_name", headerName: "Name", flex: 1 },
    {
      field: "present_status",
      headerName: "Attendance",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Box component="span">{params.row.present}</Box>
          {checkFullAccess(empId) && (
            <EditIcon
              onClick={() => handleEditClick(params.row)}
              sx={{ cursor: "pointer", color: "primary.main", marginLeft: 3 }}
            />
          )}
        </Box>
      ),
    },
  ];

  return (
    <div>
      {attendanceUpdateInfo && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {attendanceUpdateInfo}
        </Alert>
      )}

      <Box>
        <Box sx={{ display: "flex", justifyContent: "end", mb: 2 }}>
          {checkFullAccess(empId) && (
            <Button
              variant="contained"
              color="success"
              disabled={selectedRows.length === 0}
              onClick={() => {
                setUpdateModel(true);
                setNewStatus(true); // Default to 'Present'
              }}
            >
              Update Attendance
            </Button>
          )}
        </Box>

        {loader ? (
          <OverlayLoader />
        ) : (
          <GridIndex
            rows={data}
            columns={columns}
            checkboxSelection
            onRowSelectionModelChange={onSelectionModelChange}
          />
        )}

        {/* Single Student Update Dialog */}
        <Dialog
          open={editingStudent !== null}
          onClose={() => setEditingStudent(null)}
        >
          <DialogTitle>Update Attendance</DialogTitle>
          <DialogContent>
            <CustomSelect
              name="present_status"
              value={newStatus}
              items={[
                { label: "Present (P)", value: true },
                { label: "Absent (A)", value: false },
              ]}
              handleChange={(e) => setNewStatus(e.target.value)}
            />
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => setEditingStudent(null)}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={updateAttendance}
                disabled={typeof newStatus !== "boolean"}
              >
                Save
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Bulk Update Dialog */}
        <Dialog open={updateModel} onClose={() => setUpdateModel(false)}>
          <DialogTitle>Update Attendance in Bulk</DialogTitle>
          <DialogContent>
            <CustomSelect
              name="present_status"
              value={newStatus}
              items={[
                { label: "Present (P)", value: true },
                { label: "Absent (A)", value: false },
              ]}
              handleChange={(e) => setNewStatus(e.target.value)}
            />
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => setUpdateModel(false)}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={updateAttendanceInBulk}
                disabled={typeof newStatus !== "boolean"}
              >
                Save
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </div>
  );
};

export default FacultyDetailsAttendanceReportView;
