import { useState, useEffect } from "react";
import GridIndex from "../../../components/GridIndex";
import { Check, HighlightOff } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CustomModal from "../../../components/CustomModal";
import axios from "../../../services/Api";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ModalWrapper from "../../../components/ModalWrapper";
import CustomMultipleAutocomplete from "../../../components/Inputs/CustomMultipleAutocomplete";
import CustomAutocomplete from "../../../components/Inputs/CustomAutocomplete";
import useAlert from "../../../hooks/useAlert";
import { Box, Button, IconButton, Grid, Checkbox } from "@mui/material";
import moment from "moment";

const deptID = JSON.parse(sessionStorage.getItem("userData"))?.dept_id;

const initialValues = {
  schoolId: null,
  programSpeId: null,
  programSpeIdOne: null,
  yearsemId: null,
  userId: "",
  userEmail: [],
  acYearId: null,
};

const ELIGIBLE_REPORTED_STATUS = {
  1: "No status",
  2: "Not Eligible",
  3: "Eligible",
  4: "Not Reported",
  5: "Pass Out",
  6: "Promoted",
};

const userID = JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.userId;

function BatchAssignmentIndex() {
  const [rows, setRows] = useState([]);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    buttons: [],
  });
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const { setAlertMessage, setAlertOpen } = useAlert();
  const [modalOpen, setModalOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [programSpeOptions, setProgramSpeOptions] = useState([]);
  const [programSpeOptionsOne, setProgramSpeOptionsOne] = useState([]);
  const [yearSemOptions, setYearSemOptions] = useState([]);
  const [SchoolNameOptions, setSchoolNameOptions] = useState([]);
  const [acYearId, setAcYearId] = useState(null);
  const [names, setNames] = useState([]);
  const [search, setSearch] = useState("");
  const [schID, setschID] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [data, setData] = useState();
  const [batchStudentDetails, setBatchStudentDetails] = useState([]);
  const [otherStudentIds, setOtherStudentIds] = useState();
  const [rowData, setRowData] = useState();
  const [programId, setProgramId] = useState(null);
  const [programAssigmentId, setProgramAssignmentId] = useState(null);
  const [acYearOptions, setAcYearOptions] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [status, setStatus] = useState("");
  const [employeeData, setEmployeeData] = useState();
  const [selectAll, setSelectAll] = useState(false);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const columns = [
    { field: "ac_year", headerName: "Academic Year", flex: 1 },
    { field: "school_name_short", headerName: "School", flex: 1 },

    {
      field: "program_specialization_short_name",
      headerName: "Specialization",
      flex: 1,
    },
    { field: "batch_name", headerName: "Batch", flex: 1 },
    {
      field: "current_year",
      headerName: "Year/Sem",
      flex: 1,
      valueGetter: (value, row) =>
        row.current_sem ? row.current_sem : row.current_year,
    },
    { field: "interval_type_short", headerName: "Interval Type", flex: 1 },
    { field: "created_username", headerName: "Created By", flex: 1 },

    {
      field: "created_date",
      headerName: "Created Date",
      flex: 1,
      valueGetter: (value, row) =>
        moment(row.created_date).format("DD-MM-YYYY"),
    },

    {
      field: "id",
      flex: 1,
      headerName: "Update",
      renderCell: (params) => {
        if (status === "school") {
          return (
            <IconButton
              onClick={() =>
                navigate(
                  `/FacultyBatchAssignmentSchool/Update/${params.row.id}`,
                  { state: "schoolupdate" }
                )
              }
            >
              <EditIcon />
            </IconButton>
          );
        } else if (status === "user") {
          return (
            <IconButton
              onClick={() =>
                navigate(
                  `/FacultyBatchAssignmentUser/Update/${params.row.id}`,
                  {
                    state: "userupdate",
                  }
                )
              }
            >
              <EditIcon />
            </IconButton>
          );
        }
      },
    },
    {
      field: "add_student",
      headerName: "Add Student",
      type: "actions",
      getActions: (params) => [
        <IconButton
          label="Result"
          color="primary"
          onClick={() => handleStudent(params)}
        >
          <AddCircleOutlineIcon />
        </IconButton>,
      ],
    },
    {
      field: "Add_User",
      headerName: "Guest User",
      type: "actions",
      getActions: (params) => [
        <IconButton
          label="Result"
          color="primary"
          onClick={() => handleAddUser(params)}
        >
          <AddCircleOutlineIcon />
        </IconButton>,
      ],
    },

    {
      field: "active",
      headerName: "Active",
      flex: 1,
      type: "actions",
      getActions: (params) => [
        params.row.active === true ? (
          <IconButton
            style={{ color: "green" }}
            onClick={() => handleActive(params)}
          >
            <Check />
          </IconButton>
        ) : (
          <IconButton
            style={{ color: "red" }}
            onClick={() => handleActive(params)}
          >
            <HighlightOff />
          </IconButton>
        ),
      ],
    },
  ];
  useEffect(() => {
    getData();
    getSchoolNameOptions();
    getAcYearData();
    getProgramSpeData();
  }, [
    schID,
    values.yearsemId,
    values.schoolId,
    acYearId,
    schID,
    values.programSpeIdOne,
  ]);

  useEffect(() => {
    getSameCollegeStudents();
  }, [values.schoolId, values.acYearId, values.programSpeIdOne]);

  useEffect(() => {
    getSpecializationData();
  }, [values.schoolId]);

  useEffect(() => {
    getEmployeeDetails();
  }, []);

  useEffect(() => {
    getData();
  }, [employeeData]);

  const getEmployeeDetails = async () => {
    try {
      const response = await axios.get(
        `/api/employee/getEmployeeDetailsBasedOnUserID/${userID}`
      );

      if (response.data.data) {
        setEmployeeData(response.data.data);
        setValues((prev) => ({
          ...prev,
          ["schoolId"]: response.data.data.school_id,
        }));
      } else {
        setAlertMessage({
          severity: "error",
          message: "School not found for this employee",
        });
        setAlertOpen(true);
      }
    } catch {
      setAlertMessage({
        severity: "error",
        message: "Error Occured",
      });
      setAlertOpen(true);
    }
  };

  const getSpecializationData = async () => {
    if (values.schoolId)
      await axios
        .get(
          `/api/academic/fetchAllProgramsWithSpecialization/${values.schoolId}`
        )
        .then((res) => {
          setProgramSpeOptionsOne(
            res.data.data.map((obj) => ({
              value: obj.program_specialization_id,
              label: obj.specialization_with_program,
            }))
          );
        })
        .catch((err) => console.error(err));
  };

  const getSameCollegeStudents = async (params) => {
    if (
      rowData?.student_ids === "" &&
      values.programSpeIdOne &&
      values.schoolId &&
      values.acYearId
    ) {
      await axios
        .get(
          `/api/academic/fetchUnAssignedStudentDetailsOfSchool?ac_year_id=${
            values.acYearId
          }&school_id=${values.schoolId}&program_specialization_id=${
            values.programSpeIdOne
          }&program_id=${programId}&current_year_sem=${
            rowData.current_year ? rowData.current_year : rowData.current_sem
          }&program_assignment_id=${programAssigmentId}`
        )
        .then((res) => {
          const rowId = res.data.data.map((obj) => ({
            ...obj,
            id: obj.student_id,
            checked: false,
          }));
          setBatchStudentDetails(rowId);
        })
        .catch((err) => console.error(err));
    } else if (
      rowData?.student_ids !== "" &&
      values.programSpeIdOne &&
      values.schoolId &&
      values.acYearId
    ) {
      await axios
        .get(
          `/api/academic/fetchUnAssignedStudentDetailsOfSchool?ac_year_id=${
            values.acYearId
          }&school_id=${values.schoolId}&student_ids=${
            rowData?.student_ids
          }&program_specialization_id=${
            values.programSpeIdOne
          }&program_id=${programId}&current_year_sem=${
            rowData.current_year ? rowData.current_year : rowData.current_sem
          }&program_assignment_id=${programAssigmentId}`
        )
        .then((res) => {
          const rowId = res.data.data.map((obj) => ({
            ...obj,
            id: obj.student_id,
            checked: false,
          }));
          setBatchStudentDetails(rowId);
        })
        .catch((err) => console.error(err));
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleChangeAdvance = async (name, newValue) => {
    if (name === "programSpeIdOne") {
      await axios
        .get(
          `/api/academic/fetchAllProgramsWithSpecialization/${rowData.school_id}`
        )
        .then((res) => {
          res.data.data.filter((obj) => {
            if (obj.program_specialization_id === newValue) {
              setProgramId(obj.program_id);
              setProgramAssignmentId(obj.program_assignment_id);
            }
          });
        })
        .catch((err) => console.error(err));

      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }

    if (name === "programSpeId") {
      await axios
        .get(
          `/api/academic/fetchProgramWithSpecialization/${acYearId}/${values.schoolId}`
        )
        .then((res) => {
          const yearsem = [];

          res.data.data.filter((fil) => {
            if (fil.program_specialization_id === newValue) {
              yearsem.push(fil);
            }
          });

          yearsem.map((obj) => {
            if (obj.program_type_code === "YEA") {
              const years = yearsem.map((obj) => obj.number_of_years);
              const newYear = [];

              for (let i = 1; i <= Math.max(...years); i++) {
                newYear.push({ value: i, label: "year" + "-" + i });
              }
              setYearSemOptions(
                newYear.map((obj) => ({
                  value: obj.value,
                  label: obj.label,
                }))
              );
            } else {
              const years = yearsem.map((obj) => obj.number_of_semester);
              const newYear = [];

              for (let i = 1; i <= Math.max(...years); i++) {
                newYear.push({ value: i, label: "sem" + "-" + i });
              }
              setYearSemOptions(
                newYear.map((obj) => ({
                  value: obj.value,
                  label: obj.label,
                }))
              );
            }
          });
        })
        .catch((err) => console.error(err));
    }
    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const getSchoolNameOptions = async () => {
    await axios
      .get(`/api/institute/school`)
      .then((res) => {
        setSchoolNameOptions(
          res.data.data
            .filter((fil) => fil.school_id !== schID)
            .map((obj) => ({
              value: obj.school_id,
              label: obj.school_name,
            }))
        );
      })
      .catch((err) => console.error(err));
  };

  const getAcYearData = async () => {
    await axios
      .get(`/api/academic/academic_year`)
      .then((res) => {
        setAcYearOptions(
          res.data.data.map((obj) => ({
            value: obj.ac_year_id,
            label: obj.ac_year,
          }))
        );
      })
      .catch((err) => console.error(err));
  };

  const getProgramSpeData = async () => {
    if (values.schoolId)
      await axios
        .get(
          `/api/academic/fetchProgramWithSpecialization/${acYearId}/${values.schoolId}`
        )
        .then((res) => {
          setProgramSpeOptions(
            res.data.data.map((obj) => ({
              value: obj.program_specialization_id,
              label: obj.program_name,
            }))
          );
        })
        .catch((err) => console.error(err));
  };

  const getData = async () => {
    let url = "";
    if (
      pathname.toLowerCase() === "/facultymaster/school/batch" &&
      employeeData
    ) {
      url = `/api/academic/fetchAllBatchAssignmentDetailsBasedOnSchoolAndCreatedBy?page=${0}&page_size=${100000}&sort=created_date&schoolId=${
        employeeData.school_id
      }`;
      setStatus("school");
    } else if (pathname.toLowerCase() === "/facultymaster/user/batch") {
      url = `/api/academic/fetchAllBatchAssignmentDetailsBasedOnSchoolAndCreatedBy?page=${0}&page_size=${100000}&sort=created_date&createdBy=${userID}`;
      setStatus("user");
    } else if (pathname.toLowerCase() === "/facultymaster/dept/batch") {
      url = `/api/academic/fetchAllBatchAssignmentDetailsBasedOnSchoolAndCreatedBy?page=${0}&page_size=${100000}&sort=created_date&dept_id=${deptID}`;
      setStatus("");
    }

    const response = await axios.get(`${url}`);

    setRows(response.data.data);
  };

  const handleStudent = async (params) => {
    setRowData(params.row);
    setAcYearId(params.row.ac_year_id);

    setStudentOpen(true);
    setValues(initialValues);
    setBatchStudentDetails([]);
  };

  const handleAddUser = async (params) => {
    setData(params.row);
    setUsersOpen(true);
    setAssignedUsers([]);
    const userIdSplit = params.row.guest_uesr_ids
      ? params.row.guest_uesr_ids.split(",")
      : [];

    const numberUser = userIdSplit.map((item) => Number(item));

    setValues((prev) => ({ ...prev, userEmail: numberUser }));
    await axios
      .get(`/api/getGuestDetailsData`)
      .then((res) => {
        setNames(
          res.data.data.map((obj) => ({
            value: obj.id,
            label: obj.username + "-" + obj.email,
          }))
        );
      })
      .catch((err) => console.error(err));

    await axios
      .get(
        `/api/academic/getBatchAssignmentUserId?guest_uesr_ids=${params.row.guest_uesr_ids}`
      )
      .then((res) => {
        setAssignedUsers(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  const handleCreateUser = async () => {
    const temp = {};
    temp.active = true;
    temp.batch_assignment_id = data.id;
    temp.batch_id = data.batch_id;
    temp.school_id = data.school_id;
    temp.program_id = data.program_id;
    temp.ac_year_id = data.ac_year_id;
    temp.section_id = data.section_id;
    temp.current_year = data.current_year;
    temp.current_sem = data.current_sem;
    temp.student_ids = data.student_ids;
    temp.batch_type = data.batch_type;
    temp.batch_master_id = data.batch_master_id;
    temp.guest_uesr_ids = values.userEmail.toString();
    temp.remarks = data.remarks;
    temp.interval_type_id = data.interval_type_id;

    await axios
      .put(`/api/academic/BatchAssignment/${data.id}`, temp)
      .then((res) => {
        setLoading(false);
        setAlertMessage({
          severity: "success",
          message: res.data.message,
        });
        setAlertOpen(true);
        setAlertMessage({
          severity: "success",
          message: "Form Submitted Successfully",
        });
        setUsersOpen(false);
        getData();
      })
      .catch((err) => {
        setLoading(false);
        setAlertMessage({
          severity: "error",
          message: err.response.data
            ? err.response.data.message
            : "Error submitting",
        });
        setAlertOpen(true);
      });
  };

  const handleCreateStudent = async () => {
    const studentsIds = [];

    batchStudentDetails.map((obj) => {
      if (obj.checked === true) {
        studentsIds.push(obj.student_id);
      }
    });

    const temp = {};
    temp.active = true;
    temp.batch_assignment_id = rowData.id;
    temp.batch_id = rowData.batch_id;
    temp.school_id = rowData.school_id;
    temp.program_id = rowData.program_id;
    temp.ac_year_id = rowData.ac_year_id;
    temp.section_id = rowData.section_id;
    temp.current_year = rowData.current_year;
    temp.current_sem = rowData.current_sem;
    temp.student_ids =
      rowData.student_ids && studentsIds.length === 0
        ? rowData.student_ids
        : rowData.student_ids && studentsIds.length > 0
        ? rowData.student_ids + "," + studentsIds?.toString()
        : studentsIds?.toString();
    temp.batch_type = rowData.batch_type;
    temp.batch_master_id = rowData.batch_master_id;
    temp.guest_uesr_ids = rowData.guest_uesr_ids
      ? rowData.guest_uesr_ids.toString()
      : null;
    temp.remarks = rowData.remarks;
    temp.interval_type_id = rowData.interval_type_id;

    await axios
      .put(`/api/academic/BatchAssignment/${rowData.id}`, temp)
      .then((res) => {
        setLoading(false);
        setAlertMessage({
          severity: "success",
          message: res.data.message,
        });
        setAlertOpen(true);
        setAlertMessage({
          severity: "success",
          message: "Form Submitted Successfully",
        });
        setStudentOpen(false);
      })
      .catch((err) => {
        setLoading(false);
        setAlertMessage({
          severity: "error",
          message: err.response.data
            ? err.response.data.message
            : "Error submitting",
        });
        setAlertOpen(true);
      });
  };

  const handleActive = async (params) => {
    const id = params.row.id;

    const handleToggle = async () => {
      if (params.row.active === true) {
        await axios
          .delete(`/api/academic/BatchAssignment/${id}`)
          .then((res) => {
            if (res.status === 200) {
              getData();
            }
          })
          .catch((err) => console.error(err));
      } else {
        await axios
          .delete(`/api/academic/activateBatchAssignment/${id}`)
          .then((res) => {
            if (res.status === 200) {
              getData();
            }
          })
          .catch((err) => console.error(err));
      }
    };
    params.row.active === true
      ? setModalContent({
          title: "Deactivate",
          message: "Do you want to make it Inactive?",
          buttons: [
            { name: "Yes", color: "primary", func: handleToggle },
            { name: "No", color: "primary", func: () => {} },
          ],
        })
      : setModalContent({
          title: "",
          message: "Do you want to make it Active?",
          buttons: [
            { name: "Yes", color: "primary", func: handleToggle },
            { name: "No", color: "primary", func: () => {} },
          ],
        });
    setModalOpen(true);
  };

  const columnsStudent = [
    {
      field: "isSelected",
      headerName: "Checkbox Selection",
      flex: 1,
      sortable: false,
      renderHeader: () => (
        <FormGroup>
          <FormControlLabel control={headerCheckbox} />
        </FormGroup>
      ),
      renderCell: (params) => (
        <Checkbox
          sx={{ padding: 0 }}
          checked={params.row.checked}
          onChange={handleCheckboxChange(params.row.student_id)}
        />
      ),
    },
    {
      field: "student_name",
      headerName: "Student Name",
      flex: 1,
    },
    {
      field: "auid",
      headerName: "AUID",
      flex: 1,
    },
    {
      field: "usn",
      headerName: "USN",
      flex: 1,
      valueGetter: (value, row) => row.usn ?? "NA",
    },
    {
      field: "reporting_date",
      headerName: "Reported Date",
      flex: 1,
      valueGetter: (value, row) =>
        row.reporting_date
          ? moment(row.reporting_date).format("DD-MM-YYYY")
          : "NA",
    },
    {
      field: "current",
      headerName: "Year/Sem",
      flex: 1,
      valueGetter: (value, row) =>
        row.current_year ? row.current_year + "/" + row.current_sem : "NA",
    },
    {
      field: "eligible_reported_status",
      headerName: "Reported",
      flex: 1,
      valueGetter: (value, row) =>
        row.eligible_reported_status
          ? ELIGIBLE_REPORTED_STATUS[row.eligible_reported_status]
          : "",
    },
  ];

  useEffect(() => {
    setSelectAll(batchStudentDetails.every((obj) => obj.checked));
  }, [batchStudentDetails]);

  const headerCheckbox = (
    <Checkbox
      checked={selectAll}
      onClick={(e) => handleHeaderCheckboxChange(e)}
    />
  );

  const handleCheckboxChange = (id) => (event) => {
    const studentUpdatedList = batchStudentDetails.map((obj) =>
      obj.student_id === id ? { ...obj, checked: event.target.checked } : obj
    );
    setBatchStudentDetails(studentUpdatedList);
  };

  const handleHeaderCheckboxChange = (e) => {
    const allStudentsSelected = batchStudentDetails.map((obj) => ({
      ...obj,
      checked: e.target.checked,
    }));

    setBatchStudentDetails(allStudentsSelected);
  };

  return (
    <>
      <CustomModal
        open={modalOpen}
        setOpen={setModalOpen}
        title={modalContent.title}
        message={modalContent.message}
        buttons={modalContent.buttons}
      />

      <ModalWrapper
        title="Add Guest Users"
        maxWidth={1000}
        open={usersOpen}
        setOpen={setUsersOpen}
      >
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          rowSpacing={2}
          columnSpacing={2}
          mt={2}
        >
          <>
            <Grid item xs={12} md={8}>
              <CustomMultipleAutocomplete
                name="userEmail"
                label="User Email"
                handleChangeAdvance={handleChangeAdvance}
                options={names}
                value={values.userEmail}
              />
            </Grid>
            <Grid item md={4}>
              <Button
                variant="contained"
                disableElevation
                sx={{
                  borderRadius: 2,
                }}
                startIcon={<AddIcon />}
                onClick={handleCreateUser}
              >
                Add
              </Button>
            </Grid>
          </>
        </Grid>
      </ModalWrapper>

      <ModalWrapper maxWidth={1000} open={studentOpen} setOpen={setStudentOpen}>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          columnSpacing={{ xs: 2, md: 4 }}
          rowSpacing={2}
        >
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="acYearId"
              label="Ac Year"
              value={values.acYearId}
              options={acYearOptions}
              handleChangeAdvance={handleChangeAdvance}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="schoolId"
              label="School"
              value={values.schoolId}
              options={SchoolNameOptions}
              handleChangeAdvance={handleChangeAdvance}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="programSpeIdOne"
              label="Specialization"
              value={values.programSpeIdOne}
              options={programSpeOptionsOne}
              handleChangeAdvance={handleChangeAdvance}
              required
            />
          </Grid>
          <Grid item xs={12} md={12} textAlign="right">
            <Button
              variant="contained"
              sx={{
                borderRadius: 2,
              }}
              startIcon={<AddIcon />}
              onClick={handleCreateStudent}
            >
              Add
            </Button>
          </Grid>
          <Grid item xs={12} md={12}>
            <GridIndex rows={batchStudentDetails} columns={columnsStudent} />
          </Grid>
        </Grid>
      </ModalWrapper>
      <Box sx={{ position: "relative" }}>
        {status === "school" ? (
          <Button
            onClick={() =>
              navigate("/FacultyBatchAssignmentSchool", { state: "school" })
            }
            variant="contained"
            disableElevation
            sx={{ position: "absolute", right: 0, top: -57, borderRadius: 2 }}
            startIcon={<AddIcon />}
          >
            Create
          </Button>
        ) : status === "user" ? (
          <Button
            onClick={() =>
              navigate("/FacultyBatchAssignmentUser", { state: "user" })
            }
            variant="contained"
            disableElevation
            sx={{ position: "absolute", right: 0, top: -57, borderRadius: 2 }}
            startIcon={<AddIcon />}
          >
            Create
          </Button>
        ) : (
          ""
        )}
        <GridIndex rows={rows} columns={columns} />
      </Box>
    </>
  );
}
export default BatchAssignmentIndex;
