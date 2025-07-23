import { useState, useEffect } from "react";
import { Grid, Button, Checkbox, CircularProgress, Box } from "@mui/material";
import FormWrapper from "../../../components/FormWrapper";
import CustomTextField from "../../../components/Inputs/CustomTextField";
import CustomAutocomplete from "../../../components/Inputs/CustomAutocomplete";
import useAlert from "../../../hooks/useAlert";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import axios from "../../../services/Api";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import CustomMultipleAutocomplete from "../../../components/Inputs/CustomMultipleAutocomplete";
import GridIndex from "../../../components/GridIndex";
import moment from "moment";

const initialValues = {
  acYearId: null,
  schoolId: null,
  programSpeId: [],
  yearsemId: null,
  batchId: "",
  remarks: "",
  intervalTypeId: "",
  programIdForUpdate: null,
  studentId: "",
};
const requiredFields = ["acYearId", "yearsemId", "batchId", "intervalTypeId"];

const ELIGIBLE_REPORTED_STATUS = {
  1: "No status",
  2: "Not Eligible",
  3: "Eligible",
  4: "Not Reported",
  5: "Pass Out",
  6: "Promoted",
};

const userID = JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.userId;

function FacultyBatchAssignmentForm() {
  const [isNew, setIsNew] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [SchoolNameOptions, setSchoolNameOptions] = useState([]);
  const [programSpeOptions, setProgramSpeOptions] = useState([]);
  const [yearSemOptions, setYearSemOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [intervalTypeOptions, setIntervalTypeOptions] = useState([]);
  const [programType, setProgramType] = useState("");
  const [studentDetailsOptions, setStudentDetailsOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [programIds, setProgramIds] = useState([]);
  const [programAssignmentIds, setProgramAssignmentIds] = useState([]);
  const [batchAssignmentId, setBatchAssignmentId] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [employeeData, setEmployeeData] = useState();

  const { pathname } = useLocation();
  const setCrumbs = useBreadcrumbs();
  const { setAlertMessage, setAlertOpen } = useAlert();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const state = location?.state;

  useEffect(() => {
    getAcademicYearOptions();
    getSchoolNameOptions();
    getBatchData();
    getIntervalTypeOptions();
    if (
      state === "school"
        ? pathname.toLowerCase() === "/facultybatchassignmentschool"
        : state === "user"
        ? pathname.toLowerCase() === "/facultybatchassignmentuser"
        : ""
    ) {
      setIsNew(true);
      state === "school"
        ? setCrumbs([
            { name: "Faculty Master", link: "/FacultyMaster/School/Batch" },
            { name: "Batch Assignment" },
            { name: "Create" },
          ])
        : state === "user"
        ? setCrumbs([
            { name: "Faculty Master", link: "/FacultyMaster/User/Batch" },
            { name: "Batch Assignment" },
            { name: "Create" },
          ])
        : setCrumbs([
            { name: "Faculty Master", link: "/FacultyMaster/User/Batch" },
            { name: "Batch Assignment" },
            { name: "Create" },
          ]);
    } else {
      setIsNew(false);
      getBatchAssignmentData();

      state === "schoolupdate"
        ? setCrumbs([
            { name: "Faculty Master", link: "/FacultyMaster/School/Batch" },
            { name: "Batch Assignment" },
            { name: "Update" },
          ])
        : state === "userupdate"
        ? setCrumbs([
            { name: "Faculty Master", link: "/FacultyMaster/User/Batch" },
            { name: "Batch Assignment" },
            { name: "Update" },
          ])
        : setCrumbs([
            { name: "Faculty Master", link: "/FacultyMaster/User/Batch" },
            { name: "Batch Assignment" },
            { name: "Update" },
          ]);
    }
  }, []);

  useEffect(() => {
    getProgramSpecialization();
  }, [values.schoolId]);

  useEffect(() => {
    getStudentsData();
    getYearSemData();
  }, [
    isNew,
    values.acYearId,
    values.schoolId,
    values.yearsemId,
    programType,
    values.batchId,
    values.programSpeId,
  ]);

  useEffect(() => {
    setSelectAll(studentDetailsOptions.every((obj) => obj.checked));
  }, [studentDetailsOptions]);

  useEffect(() => {
    getEmployeeDetails();
  }, []);

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

  const checks = {
    programSpeId: [isNew ? values.programSpeId.length > 0 : ""],
    remarks: [values.remarks !== "", values.remarks.length <= 10],
  };

  const errorMessages = {
    programSpeId: ["This field required"],
    remarks: ["This field required", "Characters length should not exceed 10"],
  };

  const columns = [
    {
      field: "isSelected",
      headerName: "Checkbox Selection",
      flex: 1,
      sortable: false,
      renderHeader: () => (
        <FormGroup>
          {" "}
          <FormControlLabel control={headerCheckbox} />
        </FormGroup>
      ),
      renderCell: (params) => (
        <Checkbox
          sx={{ padding: 0 }}
          checked={params.row.checked}
          onChange={handleCheckboxChange(params.row.id)}
        />
      ),
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
    },
    {
      field: "student_name",
      headerName: "Student Name",
      flex: 1,
    },
    {
      field: "reporting_date",
      headerName: "Reported Date",
      flex: 1,
      valueGetter: (value, row) =>
        row.reporting_date
          ? moment(row.reporting_date).format("DD-MM-YYYY")
          : "",
    },
    {
      field: "current",
      headerName: "Year/Sem",
      flex: 1,
      valueGetter: (value, row) => row.current_year + "/" + row.current_sem,
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

  const headerCheckbox = (
    <Checkbox
      checked={selectAll}
      onClick={(e) => handleHeaderCheckboxChange(e)}
    />
  );

  const getBatchAssignmentData = async () => {
    await axios
      .get(
        `/api/academic/assignedProgramSpecilizationByBatchAssignmentId/${id}`
      )
      .then((res) => {
        setValues((prev) => ({ ...prev, programSpeId: res.data.data }));
      })
      .catch((err) => console.error(err));

    await axios
      .get(`/api/academic/BatchAssignment/${id}`)
      .then(async (res) => {
        setValues((prev) => ({
          ...prev,
          acYearId: res.data.data.ac_year_id,
          schoolId: res.data.data.school_id,
          yearsemId: res.data.data.current_sem
            ? res.data.data.current_sem
            : res.data.data.current_year,
          batchId: res.data.data.batch_id,
          remarks: res.data.data.remarks,
          intervalTypeId: res.data.data.interval_type_id,
          studentId: res.data.data.student_ids,
        }));
        await axios
          .get(
            `/api/academic/fetchStudentDetailsForUpdate?student_ids=${res.data.data.student_ids}`
          )
          .then((res) => {
            setStudentDetailsOptions(
              res.data.data.map((obj, index) => {
                return obj.student_id
                  ? { ...obj, checked: true, id: index + 1 }
                  : obj;
              })
            );
          })
          .catch((error) => console.error(error));
        setBatchAssignmentId(res.data.data.batch_assignment_id);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getYearSemData = async () => {
    if (!isNew && values.schoolId)
      await axios
        .get(
          `/api/academic/fetchAllProgramsWithSpecialization/${values.schoolId}`
        )
        .then((res) => {
          const yearsem = [];
          res.data.data.forEach((obj) => {
            values.programSpeId.forEach((obj1) => {
              if (obj.program_specialization_id === obj1) {
                yearsem.push(obj);
              }
            });
          });

          const newYear = [];
          yearsem.forEach((obj) => {
            if (obj.program_type_name.toLowerCase() === "yearly") {
              setProgramType("Year");
              for (let i = 1; i <= obj.number_of_years; i++) {
                newYear.push({ value: i, label: "Year" + "-" + i });
              }
            }
            if (obj.program_type_name.toLowerCase() === "semester") {
              setProgramType("Sem");
              for (let i = 1; i <= obj.number_of_semester; i++) {
                newYear.push({ value: i, label: "Sem" + "-" + i });
              }
            }
          });

          setYearSemOptions(
            newYear.map((obj) => ({
              value: obj.value,
              label: obj.label,
            }))
          );
        })
        .catch((err) => console.error(err));
  };

  const getAcademicYearOptions = async () => {
    try {
      const response = await axios.get("/api/academic/academic_year");
      const newResponse = response.data.data.filter(
        (obj) => obj.current_year >= 2024
      );

      const optionData = [];
      const ids = [];
      newResponse.forEach((obj) => {
        optionData.push({ value: obj.ac_year_id, label: obj.ac_year });
        ids.push(obj.current_year);
      });

      setAcademicYearOptions(optionData);
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message: "Failed to fetch the academic years !!",
      });
      setAlertOpen(true);
    }
  };

  const getSchoolNameOptions = async () => {
    await axios
      .get(`/api/institute/school`)
      .then((res) => {
        setSchoolNameOptions(
          res.data.data.map((obj) => ({
            value: obj.school_id,
            label: obj.school_name,
          }))
        );
      })
      .catch((err) => console.error(err));
  };

  const getProgramSpecialization = async () => {
    if (values.schoolId)
      await axios
        .get(
          `/api/academic/fetchAllProgramsWithSpecialization/${values.schoolId}`
        )
        .then((res) => {
          setProgramSpeOptions(
            res.data.data.map((obj) => ({
              value: obj.program_specialization_id,
              label: obj.specialization_with_program,
              program_type_name: obj.program_type_name,
              program_short_name: obj.program_short_name,
              program_name: obj.program_name,
              program_id: obj.program_id,
              number_of_years: obj.number_of_years,
              number_of_semester: obj.number_of_semester,
              program_assignment_id: obj.program_assignment_id,
            }))
          );
        })
        .catch((err) => console.error(err));
  };

  const getBatchData = async () => {
    await axios
      .get(`/api/academic/Batch`)
      .then((res) => {
        setBatchOptions(
          res.data.data.map((obj) => ({
            value: obj.batch_id,
            label: obj.batch_short_name,
          }))
        );
      })
      .catch((error) => console.error(error));
  };

  const getIntervalTypeOptions = async () => {
    await axios
      .get(`/api/academic/TimeIntervalTypes`)
      .then((res) => {
        setIntervalTypeOptions(
          res.data.data.map((obj) => ({
            value: obj.intervalTypeId,
            label: obj.intervalTypeName,
          }))
        );
      })
      .catch((err) => console.error(err));
  };

  const getAllselectedSpecialization = (newValue, name) => {
    const specilizationSelected = [];
    programSpeOptions.forEach((obj) =>
      newValue.forEach((obj1) => {
        if (obj.value === obj1) specilizationSelected.push(obj);
      })
    );

    const firstSelectedProgram = programSpeOptions.find(
      (obj) => obj.value === newValue[0]
    );
    const selectedIds = [];
    const yearSem = [];

    let programPatternDiffrence = false;

    specilizationSelected.forEach((obj) => {
      if (obj.program_type_name === firstSelectedProgram.program_type_name) {
        selectedIds.push(obj.value);
        yearSem.push(obj);
      } else {
        setAlertMessage({
          severity: "error",
          message: "Program pattern cannot be different",
        });
        setAlertOpen(true);
        programPatternDiffrence = true;
      }
    });

    if (programPatternDiffrence) return;

    specilizationSelected.forEach((obj) => {
      if (obj.program_type_name.toLowerCase() === "yearly") {
        setProgramType("Year");
        const years = yearSem.map((obj) => obj.number_of_years);
        const newYear = [];
        for (let i = 1; i <= Math.max(...years); i++) {
          newYear.push({ value: i, label: "Year" + "-" + i });
        }

        setYearSemOptions(
          newYear.map((obj) => ({
            value: obj.value,
            label: obj.label,
          }))
        );
      } else if (obj.program_type_name.toLowerCase() === "semester") {
        setProgramType("Sem");
        const years = yearSem.map((obj) => obj.number_of_semester);
        const newYear = [];
        for (let i = 1; i <= Math.max(...years); i++) {
          newYear.push({ value: i, label: "Sem" + "-" + i });
        }
        setYearSemOptions(
          newYear.map((obj) => ({
            value: obj.value,
            label: obj.label,
          }))
        );
      }
    });

    setProgramAssignmentIds(
      specilizationSelected.map((obj) => obj.program_assignment_id)
    );

    setProgramIds(specilizationSelected.map((obj) => obj.program_id));

    setValues((prev) => ({
      ...prev,
      [name]: selectedIds,
    }));
  };

  const getStudentsData = async () => {
    try {
      if (
        isNew &&
        values.acYearId &&
        values.schoolId &&
        values.programSpeId &&
        values.yearsemId &&
        values.batchId &&
        programType === "Year"
      ) {
        const studentResponse = await axios.get(
          `/api/academic/fetchStudentDetailForBatchAssignment?school_id=${
            values.schoolId
          }&program_specialization_id=${values.programSpeId.toString()}&current_year=${
            values.yearsemId
          }`
        );
        const rowId = studentResponse.data.data.map((obj, index) => ({
          ...obj,
          id: index + 1,
          checked: false,
        }));
        setStudentDetailsOptions(rowId);
      } else if (
        isNew &&
        values.acYearId &&
        values.schoolId &&
        values.programSpeId &&
        values.yearsemId &&
        values.batchId &&
        programType === "Sem"
      ) {
        const studentResponse = await axios.get(
          `/api/academic/fetchStudentDetailForBatchAssignment?school_id=${
            values.schoolId
          }&program_specialization_id=${values.programSpeId.toString()}&current_sem=${
            values.yearsemId
          }`
        );

        const rowId = studentResponse.data.data.map((obj, index) => ({
          ...obj,
          id: index + 1,
          checked: false,
        }));

        setStudentDetailsOptions(rowId);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeAdvance = (name, newValue) => {
    if (name === "programSpeId") {
      getAllselectedSpecialization(newValue, name);
    } else {
      setValues((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckboxChange = (id) => (event) => {
    const studentUpdatedList = studentDetailsOptions.map((obj) =>
      obj.id === id ? { ...obj, checked: event.target.checked } : obj
    );
    setStudentDetailsOptions(studentUpdatedList);
  };

  const handleHeaderCheckboxChange = (e) => {
    const allStudentsSelected = studentDetailsOptions.map((obj) => ({
      ...obj,
      checked: e.target.checked,
    }));

    setStudentDetailsOptions(allStudentsSelected);
  };

  const requiredFieldsValid = () => {
    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if (Object.keys(checks).includes(field)) {
        const ch = checks[field];
        for (let j = 0; j < ch.length; j++) if (!ch[j]) return false;
      } else if (!values[field]) return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!requiredFieldsValid()) {
      setAlertMessage({
        severity: "error",
        message: "please fill all fields",
      });
      setAlertOpen(true);
    } else {
      const studentsIds = [];

      studentDetailsOptions.map((obj) => {
        if (obj.checked === true) {
          studentsIds.push(obj.student_id);
        }
      });

      setLoading(true);
      const payload = {
        active: true,
        ac_year_id: values.acYearId,
        batch_id: values.batchId,
        program_specialization_id: values.programSpeId,
        program_assignment_id: programAssignmentIds,
        program_id: programIds,
        remarks: values.remarks,
        school_id: values.schoolId,
        student_ids: studentsIds.toString(),
        interval_type_id: values.intervalTypeId,
      };

      programType === "Year"
        ? (payload.current_year = values.yearsemId)
        : (payload.current_sem = values.yearsemId);

      await axios
        .post(`/api/academic/BatchAssignment`, payload)
        .then((res) => {
          setLoading(false);
          if (res.status === 200 || res.status === 201) {
            if (state === "school") {
              navigate("/FacultyMaster/School/Batch", { replace: true });
            } else if (state === "user") {
              navigate("/FacultyMaster/User/Batch", { replace: true });
            }
            setAlertMessage({
              severity: "success",
              message: "Form Submitted Successfully",
            });
          } else {
            setAlertMessage({
              severity: "error",
              message: res.data ? res.data.message : "An error occured",
            });
          }
          setAlertOpen(true);
        })
        .catch((err) => {
          setLoading(false);
          setAlertMessage({
            severity: "error",
            message: err.response
              ? err.response.data.message
              : "An error occured",
          });
          setAlertOpen(true);
        });
    }
  };

  const handleUpdate = async () => {
    if (!requiredFieldsValid()) {
      setAlertMessage({
        severity: "error",
        message: "please fill all fields",
      });
      setAlertOpen(true);
    } else {
      setLoading(true);
      const studentsIds = [];

      studentDetailsOptions.map((obj) => {
        if (obj.checked === true) {
          studentsIds.push(obj.student_id);
        }
      });

      const payload = {
        active: true,
        batch_assignment_id: batchAssignmentId,
        ac_year_id: values.acYearId,
        // program_specialization_id: values.programSpeId,
        remarks: values.remarks,
        school_id: values.schoolId,
        student_ids: studentsIds.toString(),
        interval_type_id: values.intervalTypeId,
        batch_id: values.batchId,
      };

      programType === "Year"
        ? (payload.current_year = values.yearsemId)
        : (payload.current_sem = values.yearsemId);

      await axios
        .put(`/api/academic/BatchAssignment/${id}`, payload)
        .then((res) => {
          setLoading(false);
          if (res.status === 200 || res.status === 201) {
            if (state === "schoolupdate") {
              navigate("/FacultyMaster/School/Batch", { replace: true });
            } else if (state === "userupdate") {
              navigate("/FacultyMaster/User/Batch", { replace: true });
            }
            setAlertMessage({
              severity: "success",
              message: "Form Updated Successfully",
            });
          } else {
            setAlertMessage({
              severity: "error",
              message: res.data ? res.data.message : "An error occured",
            });
          }
          setAlertOpen(true);
        })
        .catch((err) => {
          setLoading(false);
          setAlertMessage({
            severity: "error",
            message: err.response
              ? err.response.data.message
              : "An error occured",
          });
          setAlertOpen(true);
        });
    }
  };

  return (
    <Box component="form" overflow="hidden">
      <FormWrapper>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          rowSpacing={4}
          columnSpacing={2}
        >
          <Grid item xs={12} md={3}>
            <CustomAutocomplete
              name="acYearId"
              label="Academic Year"
              value={values.acYearId}
              options={academicYearOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <CustomAutocomplete
              name="schoolId"
              label="School"
              value={values.schoolId}
              options={SchoolNameOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled
              required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <CustomMultipleAutocomplete
              name="programSpeId"
              label="Program Specialization"
              value={values.programSpeId}
              options={programSpeOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              checks={checks.programSpeId}
              errors={errorMessages.programSpeId}
              required
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <CustomAutocomplete
              name="yearsemId"
              label="Year/Sem"
              value={values.yearsemId}
              options={yearSemOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              required
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <CustomAutocomplete
              name="batchId"
              label="Batch Name"
              value={values.batchId}
              options={batchOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              required
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <CustomAutocomplete
              name="intervalTypeId"
              label="Interval Type"
              value={values.intervalTypeId}
              options={intervalTypeOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              required
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <CustomTextField
              name="remarks"
              label="Display name for TT"
              value={values.remarks}
              handleChange={handleChange}
              checks={checks.remarks}
              errors={errorMessages.remarks}
              disabled={!isNew}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            {values.yearsemId ? (
              <GridIndex rows={studentDetailsOptions} columns={columns} />
            ) : (
              <></>
            )}
          </Grid>
          <Grid item xs={12} align="right">
            <Button
              style={{ borderRadius: 7 }}
              variant="contained"
              color="primary"
              disabled={loading}
              onClick={isNew ? handleCreate : handleUpdate}
            >
              {loading ? (
                <CircularProgress
                  size={25}
                  color="blue"
                  style={{ margin: "2px 13px" }}
                />
              ) : (
                <strong>{isNew ? "Create" : "Update"}</strong>
              )}
            </Button>
          </Grid>
        </Grid>
      </FormWrapper>
    </Box>
  );
}

export default FacultyBatchAssignmentForm;
