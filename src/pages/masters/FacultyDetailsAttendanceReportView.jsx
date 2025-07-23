import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import axios from "../../services/Api";
import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TableContainer,
  Paper,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Alert } from "@mui/material";
import moment from "moment";
import GridIndex from "../../components/GridIndex";
import CustomSelect from "../../components/Inputs/CustomSelect";
import OverlayLoader from "../../components/OverlayLoader";
import useBreadcrumbs from "../../hooks/useBreadcrumbs";

const empId = sessionStorage.getItem("empId");

const FacultyDetailsAttendanceReportView = () => {
  const location = useLocation();
  const { eventDetails } = location.state;
  const [Data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updateModel, setUpdateModel] = useState(false);
  const [reportingIds, setReportingIds] = useState([]);
  const [attendanceUpdateInfo, setAttendanceUpdateInfo] = useState("");
  const [eligibleToUpdateAttendance, setEligibleToUpdateAttendance] =
    useState(false);
  const setCrumbs = useBreadcrumbs();

  useEffect(() => {
    getEmployeeData();
    getdata();
    setCrumbs([
      { name: "Calendar", link: "/Dashboard" },
      { name: "Attendance" },
    ]);
  }, []);

  useEffect(() => {
    attendanceUpdateEligibilityCheck();
  }, [Data]);

  const getEmployeeData = async () => {};

  const getdata = async () => {
    setLoader(true);
    await axios
      .get(`api/student/studentAttendanceDetailsForReport/${eventDetails.id}`)
      .then(async (res) => {
        await axios
          .get(`/api/employee/EmployeeDetails/${res.data.data[0].emp_id}`)
          .then((res) => {
            const temp = [];
            res.data.data.map((obj) => {
              temp.push(obj.report_id, obj.leave_approver1_emp_id);
            });
            setReportingIds(temp);
          })
          .catch((err) => console.error(err));
        setLoader(false);
        const result = res.data.data?.map((_data, index) => ({
          ..._data,
          index: index,
          selected: false,
          present: _data?.present_status ? "P" : "A",
        }));
        setData(result);
      })
      .catch((err) => console.error(err));
  };

  const handleEditClick = (item, index) => {
    setEditingStudent({ ...item, index: index });
    setNewStatus(Data[index].present_status);
  };

  const updateAttendance = async () => {
    const payload = [
      {
        student_attendance_id: editingStudent?.id,
        school_id: editingStudent?.school_id,
        ac_year_id: editingStudent?.ac_year_id,
        course_id: editingStudent?.course_id,
        remarks: "",
        description: editingStudent?.description,
        student_id: editingStudent?.student_id,
        present_status: editingStudent?.present_status,
        offline_status: editingStudent?.offline_status,
        batch_id: editingStudent?.batch_id,
        section_id: editingStudent?.section_id,
        date_of_class: new Date(editingStudent?.date_of_class)?.toISOString(),
        time_slots_id: editingStudent?.time_slots_id,
        lesson_id: editingStudent?.lesson_id,
        time_table_id: editingStudent?.time_table_id,
        year_or_sem: 1,
        active: true,
        course_assignment_id: editingStudent?.course_assignment_id,
        lesson_assignment_id: editingStudent?.lesson_assignment_id,
        emp_id: editingStudent?.emp_id,
        syllabus_objective: editingStudent?.syllabus_objective,
      },
    ];

    await axios
      .put(`api/student/studentAttendance/${editingStudent?.id}`, payload)
      .then((res) => {
        if (res?.data?.success) {
          setEditingStudent(null);
          getdata();
        }
      })
      .catch((err) => console.error(err));
  };

  const attendanceUpdateEligibilityCheck = () => {
    if (Data.length > 0) {
      //  Date object from attendance created timestamp
      const attendanceCreatedTime = new Date(Data[0].created_date);
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

  const checkFullAccess = (id) => {
    //1-admin, 5-super admin, headHr-13, director-14, cprdsa-10, HR-4, accounts - 3
    // const roles = [1, 5, 13, 14, 10, 4, 3];
    const roles = [1, 5];
    const mergedArray = [...roles, ...reportingIds];
    const empID = sessionStorage.getItem("empId");
    const { roleId } = JSON.parse(sessionStorage.getItem("AcharyaErpUser"));
    if (
      mergedArray?.includes(roleId) ||
      (empID == id && eligibleToUpdateAttendance)
    ) {
      return true;
    } else {
      return false;
    }
  };

  const columns = [
    { field: "auid", headerName: "AUID", flex: 1 },
    {
      field: "usn",
      headerName: "USN",
      flex: 1,
      valueGetter: (value, row) => (row.usn ? row.usn : "NA"),
    },
    { field: "student_name", headerName: "Name", flex: 1 },
    {
      field: "reporting_date",
      headerName: "Reporting Date",
      flex: 1,
      valueGetter: (value, row) =>
        row.reportingDate
          ? moment(row.reportingDate).format("DD-MM-YYYY")
          : "NA",
    },
    {
      field: "current_year",
      headerName: "Year/Sem",
      flex: 1,
      valueGetter: (value, row) =>
        row.current_year ? row.current_year + "/" + row.current_sem : "NA",
    },
    {
      field: "present_status",
      headerName: "Attendance",
      flex: 1,
      renderCell: (params) => (
        <>
          <p>{params.row.present}</p>
          {checkFullAccess(empId) && (
            <EditIcon
              onClick={() => handleEditClick(params.row, params.row.index)}
              sx={{ marginLeft: 3 }}
            />
          )}
        </>
      ),
    },
  ];

  const onSelectionModelChange = (ids) => {
    const selectedRow = ids.map((val) => Data.find((row) => row.id === val));
    setSelectedRows([...selectedRow]);
  };

  const updateAttendanceInBulk = async () => {
    const ids = selectedRows?.map((id) => id?.id);

    const payload = selectedRows?.map((editingStudent) => {
      return {
        student_attendance_id: editingStudent?.id,
        school_id: editingStudent?.school_id,
        ac_year_id: editingStudent?.ac_year_id,
        course_id: editingStudent?.course_id,
        remarks: "",
        description: editingStudent?.description,
        student_id: editingStudent?.student_id,
        present_status: newStatus,
        offline_status: editingStudent?.offline_status,
        batch_id: editingStudent?.batch_id,
        section_id: editingStudent?.section_id,
        date_of_class: new Date(editingStudent?.date_of_class).toISOString(),
        time_slots_id: editingStudent?.time_slots_id,
        lesson_id: editingStudent?.lesson_id,
        time_table_id: editingStudent?.time_table_id,
        year_or_sem: 1,
        active: true,
        lesson_assignment_id: editingStudent?.lesson_assignment_id,
        course_assignment_id: editingStudent?.course_assignment_id,
        emp_id: editingStudent?.emp_id,
        syllabus_id: editingStudent?.syllabus_id,
        syllabus_objective: editingStudent?.syllabus_objective,
      };
    });

    await axios
      .put(`api/student/studentAttendance/${ids?.join(",")}`, payload)
      .then((res) => {
        if (res?.data?.success) {
          setUpdateModel(false);
          setSelectedRows([]);
          getdata();
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "rgba(74, 87, 169, 0.1)" }}>
            <TableRow>
              <TableCell>Date of Class</TableCell>
              <TableCell>Interval</TableCell>
              <TableCell>Topic Taught</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Learning Style</TableCell>
              <TableCell>Teaching Mode</TableCell>
              <TableCell>Teaching Aid</TableCell>

              <TableCell>Syllabus</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* {Data.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  {moment(item.date_of_class).format("DD-MM-YYYY")}
                </TableCell>
                <TableCell>
                  {item.starting_time} - {item.ending_time}
                </TableCell>
                <TableCell>{item.contents}</TableCell>
                <TableCell>{item.description}</TableCell>
              </TableRow>
            ))} */}

            <TableRow>
              <TableCell>
                {moment(Data?.[0]?.date_of_class).format("DD-MM-YYYY")}
              </TableCell>
              <TableCell>
                {Data?.[0]?.starting_time} - {Data?.[0]?.ending_time}
              </TableCell>
              <TableCell>{Data?.[0]?.contents}</TableCell>
              <TableCell>{Data?.[0]?.type}</TableCell>
              <TableCell>{Data?.[0]?.learning_style}</TableCell>
              <TableCell>{Data?.[0]?.teaching_mode}</TableCell>
              <TableCell>{Data?.[0]?.teaching_aid}</TableCell>
              <TableCell>{Data?.[0]?.syllabus_objective}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {attendanceUpdateInfo && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {attendanceUpdateInfo}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "end" }}>
        {checkFullAccess(empId) && (
          <Button
            variant="contained"
            color="success"
            disabled={selectedRows?.length === 0}
            onClick={() => {
              setUpdateModel(true);
              setNewStatus("P");
            }}
            sx={{ marginLeft: "4px", mb: 2 }}
          >
            Update Attendance
          </Button>
        )}
      </Box>

      {loader ? (
        <OverlayLoader />
      ) : (
        <GridIndex
          rows={Data}
          columns={columns}
          checkboxSelection
          onRowSelectionModelChange={(ids) => onSelectionModelChange(ids)}
        />
      )}

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
            handleChange={(e) => {
              setEditingStudent((prev) => ({
                ...prev,
                present_status: e.target.value,
              }));
              setNewStatus(e.target.value);
            }}
          />

          <div style={{ marginTop: 10 }}>
            <Button
              color="primary"
              style={{ marginRight: 10 }}
              onClick={() => updateAttendance()}
              disabled={typeof newStatus !== "boolean"}
            >
              Save
            </Button>
            <Button onClick={() => setEditingStudent(null)} color="primary">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={updateModel} onClose={() => setUpdateModel(false)}>
        <DialogTitle>Update Attendance in bulk</DialogTitle>
        <DialogContent>
          <CustomSelect
            name="present_status"
            value={newStatus}
            items={[
              { label: "Present (P)", value: true },
              { label: "Absent (A)", value: false },
            ]}
            handleChange={(e) => {
              setNewStatus(e.target.value);
            }}
          />

          <div style={{ marginTop: 10 }}>
            <Button
              color="primary"
              style={{ marginRight: 10 }}
              onClick={() => updateAttendanceInBulk()}
              disabled={typeof newStatus !== "boolean"}
            >
              Save
            </Button>
            <Button onClick={() => setUpdateModel(false)} color="primary">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacultyDetailsAttendanceReportView;
