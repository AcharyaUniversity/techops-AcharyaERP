import { useState, useEffect } from "react";
import { Grid, Button, CircularProgress, Box } from "@mui/material";
import CustomTextField from "../../../components/Inputs/CustomTextField";
import CustomDatePicker from "../../../components/Inputs/CustomDatePicker";
import axios from "../../../services/Api";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CustomAutocomplete from "../../../components/Inputs/CustomAutocomplete";
import CustomMultipleAutocomplete from "../../../components/Inputs/CustomMultipleAutocomplete";
import useAlert from "../../../hooks/useAlert";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import FormWrapper from "../../../components/FormWrapper";
import { convertTimeToString } from "../../../utils/DateTimeUtils";
import dayjs from "dayjs";

const roleName = JSON.parse(
  sessionStorage.getItem("AcharyaErpUser")
)?.roleShortName;

const initialValues = {
  acYearId: null,
  schoolId: null,
  programIdForUpdate: null,
  programSpeId: [],
  yearsemId: null,
  fromDate: null,
  toDate: null,
  commencementTypeId: null,
  remarks: "",
};

const requiredFields = [
  "acYearId",
  "schoolId",
  "fromDate",
  "programSpeId",
  "yearsemId",
  "commencementTypeId",
  "remarks",
];

function ClassCommencementForm() {
  const [isNew, setIsNew] = useState(true);
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [CommencementId, setCommencementId] = useState(null);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [programSpeOptions, setProgramSpeOptions] = useState([]);
  const [commencementOptions, setcommencementOptions] = useState([]);
  const [yearSemOptions, setYearSemOptions] = useState([]);
  const [programType, setProgramType] = useState("Sem");
  const [programAssigmentId, setProgramAssignmentId] = useState([]);
  const [singleDateTypes, setSingleDtaeTypes] = useState([]);
  const [programSpeData, setProgramSpeData] = useState([]);

  const { id } = useParams();
  const { pathname } = useLocation();
  const { setAlertMessage, setAlertOpen } = useAlert();
  const setCrumbs = useBreadcrumbs();
  const navigate = useNavigate();

  const checks = {
    programSpeId: isNew ? [values.programSpeId.length > 0] : [],
    fromDate: [values.fromDate !== null],
    toDate: [values.toDate !== null, values.toDate > values.fromDate],
    remarks: [values.remarks !== ""],
  };
  const errorMessages = {
    programSpeId: ["This field is required"],
    fromDate: ["This field is required"],
    toDate: [
      "This field is required",
      "To date must be greater than from date",
    ],
    remarks: ["This field is required"],
  };

  useEffect(() => {
    getAcademicyear();
    getSchool();
    if (pathname.toLowerCase() === "/calendaracademic/commencement/new") {
      setIsNew(true);
      setCrumbs([
        {
          name: "Calendar Academic",
          link: "/CalendarAcademic/ClassCommencement",
        },
        { name: "Class Commencement" },
        { name: "Create" },
      ]);
    } else {
      setIsNew(false);
      getClassCommencementData();
    }
  }, []);

  useEffect(() => {
    getProgramSpeData();
    getCommencementTypeData();
    getYearSemForUpdate();
  }, [
    values.acYearId,
    values.schoolId,
    values.programSpeId,
    values.yearsemId,

    programType,
  ]);

  const getAcademicyear = async () => {
    await axios
      .get(`/api/academic/academic_year`)
      .then((res) => {
        setAcademicYearOptions(
          res.data.data.map((obj) => ({
            value: obj.ac_year_id,
            label: obj.ac_year,
          }))
        );
      })
      .catch((error) => console.error(error));
  };

  const getSchool = async () => {
    await axios
      .get(`/api/institute/school`)
      .then((res) => {
        setSchoolOptions(
          res.data.data.map((obj) => ({
            value: obj.school_id,
            label: obj.school_name,
          }))
        );
      })
      .catch((error) => console.error(error));
  };

  const getProgramSpeData = async () => {
    if (values.schoolId)
      await axios
        .get(
          `/api/academic/fetchAllProgramsWithSpecialization/${values.schoolId}`
        )
        .then((res) => {
          setProgramSpeData(res.data.data);
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
  const temp1 = [];
  const getCommencementTypeData = async () => {
    await axios
      .get(`/api/academic/commencementType`)
      .then((res) => {
        res.data.data
          .filter((val) => val.date_selection === "single")
          .map((fil) => temp1.push(fil.commencement_id));
        setcommencementOptions(
          res.data.data.map((obj) => ({
            value: obj.commencement_id,
            label: obj.commencement_type,
          }))
        );
      })
      .catch((err) => console.error(err));
    setSingleDtaeTypes(temp1);
  };

  const getYearSemForUpdate = async () => {
    if (!isNew)
      await axios
        .get(
          `/api/academic/fetchAllProgramsWithSpecialization/${values.schoolId}`
        )
        .then((res) => {
          const yearsem = [];
          res.data.data.filter((obj) => {
            if (obj.program_specialization_id === values.programSpeId) {
              yearsem.push(obj);
              setProgramAssignmentId(obj.program_assignment_id);
            }
          });

          const newYear = [];
          yearsem.map((obj) => {
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

  const getClassCommencementData = async () => {
    await axios
      .get(`/api/academic/classCommencementDetails/${id}`)
      .then((res) => {
        setValues({
          acYearId: res.data.data.ac_year_id,
          schoolId: res.data.data.school_id,
          programSpeId: res.data.data.program_specialization_id,
          yearsemId: res.data.data.year_sem,
          commencementTypeId: res.data.data.commencement_id,
          remarks: res.data.data.remarks,
          programIdForUpdate: res.data.data.program_id,
          fromDate: res.data.data.from_date
            ? res.data.data.from_date + "T00:00:00+05:30"
            : null,
          toDate: res.data.data.to_date
            ? res.data.data.to_date + "T00:00:00+05:30"
            : null,
        });
        setCommencementId(res.data.data.class_commencement_details_id);
        setCrumbs([
          {
            name: "Calendar Academic",
            link: "/CalendarAcademic/ClassCommencement",
          },
          { name: "Commencement" },
          { name: "Update" },
        ]);
      })
      .catch((err) => console.error(err));
  };

  const getAllselectedSpecialization = (newValue, name) => {
    const selectedSpecialzations = [];
    programSpeOptions.forEach((obj) => {
      newValue.forEach((obj1) => {
        if (obj.value === obj1) selectedSpecialzations.push(obj);
      });
    });

    const firstSelectedProgram = programSpeOptions.find(
      (obj) => obj.value === newValue[0]
    );

    const selectedIds = [];
    const yearSem = [];
    const newObject = {};

    let programPatternDiffrence = false;

    selectedSpecialzations.forEach((obj) => {
      if (obj.program_type_name === firstSelectedProgram.program_type_name) {
        selectedIds.push(obj.value);
        newObject[obj.value] = obj.program_assignment_id;
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

    selectedSpecialzations.forEach((obj) => {
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

    setValues((prev) => ({
      ...prev,
      [name]: selectedIds,
      assignmentAndSpecialization: newObject,
    }));
  };

  const handleChangeAdvance = async (name, newValue) => {
    if (name === "programSpeId") {
      getAllselectedSpecialization(newValue, name);
    } else {
      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }
  };
  const handleChange = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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

  const handleCreate = async (e) => {
    if (!requiredFieldsValid()) {
      setAlertMessage({
        severity: "error",
        message: "please fill all fields",
      });
      setAlertOpen(true);
    } else {
      setLoading(true);
      const temp = {};
      temp.active = true;
      temp.ac_year_id = values.acYearId;
      temp.commencement_id = values.commencementTypeId;
      temp.from_date = values?.fromDate?.substr(0, 19) + "Z";
      temp.to_date = values.toDate ? values?.toDate?.substr(0, 19) + "Z" : "";
      temp.program_specialization_id = values.assignmentAndSpecialization;
      temp.remarks = values.remarks;
      temp.school_id = values.schoolId;
      temp.year_sem = values.yearsemId;
      temp.fromDate_for_fronted_use = convertTimeToString(
        dayjs(values.fromDate).$d
      );
      temp.toDate_for_fronted_use = convertTimeToString(
        dayjs(values.toDate).$d
      );

      await axios
        .post(`/api/academic/classCommencementDetails`, temp)
        .then((res) => {
          setLoading(false);
          if (res.status === 200 || res.status === 201) {
            navigate("/CalendarAcademic/ClassCommencement", {
              replace: true,
            });
            setAlertMessage({
              severity: "success",
              message: "Class Commencement Created",
            });
          } else {
            setAlertMessage({
              severity: "error",
              message: res.data ? res.data.message : "Error Occured",
            });
          }
          setAlertOpen(true);
        })
        .catch((error) => {
          setLoading(false);
          setAlertMessage({
            severity: "error",
            message: error.response ? error.response.data.message : "Error",
          });
          setAlertOpen(true);
        });
    }
  };

  const handleUpdate = async (e) => {
    if (!requiredFieldsValid()) {
      setAlertMessage({
        severity: "error",
        message: "Please fill required fields",
      });
      setAlertOpen(true);
    } else {
      setLoading(true);
      const temp = {};
      temp.active = true;
      temp.class_commencement_details_id = CommencementId;
      temp.ac_year_id = values.acYearId;
      temp.commencement_id = values.commencementTypeId;
      temp.from_date = values?.fromDate?.substr(0, 19) + "Z";
      temp.to_date = values.toDate ? values?.toDate?.substr(0, 19) + "Z" : null;
      temp.program_specialization_id = values.programSpeId;
      temp.program_assignment_id = programAssigmentId;
      temp.remarks = values.remarks;
      temp.school_id = values.schoolId;
      temp.year_sem = values.yearsemId;

      await axios
        .put(`/api/academic/classCommencementDetails/${id}`, temp)
        .then((res) => {
          setLoading(false);
          if (res.status === 200 || res.status === 201) {
            setAlertMessage({
              severity: "success",
              message: "Class Commencement Updated",
            });
            navigate("/CalendarAcademic/ClassCommencement", {
              replace: true,
            });
          } else {
            setAlertMessage({
              severity: "error",
              message: res.data ? res.data.message : "Error Occured",
            });
          }
          setAlertOpen(true);
        })
        .catch((error) => {
          setLoading(false);
          setAlertMessage({
            severity: "error",
            message: error.response.data.message,
          });
        });
    }
  };

  return (
    <Box component="form" overflow="hidden" p={1}>
      <FormWrapper>
        <Grid
          container
          alignItems="center"
          justifyContent="flex-start"
          rowSpacing={2}
          columnSpacing={{ xs: 2, md: 4 }}
        >
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="schoolId"
              label="School"
              value={values.schoolId}
              options={schoolOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            {isNew ? (
              <CustomMultipleAutocomplete
                name="programSpeId"
                label="Program Major"
                value={values.programSpeId}
                options={programSpeOptions}
                handleChangeAdvance={handleChangeAdvance}
                checks={checks.programSpeId}
                errors={errorMessages.programSpeId}
                required
              />
            ) : (
              <CustomAutocomplete
                name="programSpeId"
                label="Program Major"
                value={values.programSpeId}
                options={programSpeOptions}
                handleChangeAdvance={handleChangeAdvance}
                checks={checks.programSpeId}
                errors={errorMessages.programSpeId}
                disabled={!isNew}
                required
              />
            )}
          </Grid>

          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="commencementTypeId"
              label="Commencement Types"
              value={values.commencementTypeId}
              options={commencementOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              required
            />
          </Grid>
          {singleDateTypes.includes(values.commencementTypeId) ? (
            <Grid item xs={12} md={4} mt={2.5}>
              <CustomDatePicker
                name="fromDate"
                label="Date"
                value={values.fromDate}
                handleChangeAdvance={handleChangeAdvance}
                checks={checks.fromDate}
                errors={errorMessages.fromDate}
                required
                disablePast={roleName !== "SAA"}
              />
            </Grid>
          ) : (
            <>
              <Grid item xs={12} md={4} mt={2.5}>
                <CustomDatePicker
                  name="fromDate"
                  label="From Date"
                  value={values.fromDate}
                  handleChangeAdvance={handleChangeAdvance}
                  checks={checks.fromDate}
                  errors={errorMessages.fromDate}
                  required
                  disablePast={roleName !== "SAA"}
                />
              </Grid>
              <Grid item xs={12} md={4} mt={2.5}>
                <CustomDatePicker
                  name="toDate"
                  label="To Date"
                  value={values.toDate}
                  handleChangeAdvance={handleChangeAdvance}
                  checks={checks.toDate}
                  errors={errorMessages.toDate}
                  minDate={values.fromDate}
                  required
                />
              </Grid>
            </>
          )}

          <Grid item xs={12} md={4}>
            <CustomTextField
              name="remarks"
              label="Remarks"
              value={values.remarks}
              handleChange={handleChange}
              required
            />
          </Grid>
        </Grid>

        <Grid container justifyContent="flex-end" textAlign="right">
          <Grid item xs={12} md={2} mt={4}>
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

export default ClassCommencementForm;
