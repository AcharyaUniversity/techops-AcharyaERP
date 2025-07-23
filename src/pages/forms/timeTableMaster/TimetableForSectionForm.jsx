import { useState, useEffect } from "react";
import { Box, Grid, Button, CircularProgress } from "@mui/material";
import FormWrapper from "../../../components/FormWrapper";
import useAlert from "../../../hooks/useAlert";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import axios from "../../../services/Api";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import CustomTextField from "../../../components/Inputs/CustomTextField";
import CustomAutocomplete from "../../../components/Inputs/CustomAutocomplete";
import CustomDatePicker from "../../../components/Inputs/CustomDatePicker";
import CustomMultipleAutocomplete from "../../../components/Inputs/CustomMultipleAutocomplete";
import CustomRadioButtons from "../../../components/Inputs/CustomRadioButtons";
import EmployeetimetableDetails from "../sectionMaster/EmployeetimetableDetails";
import moment from "moment";

const roleName = JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.roleName;

const initValues = {
  acYearId: null,
  schoolId: null,
  programSpeId: null,
  fromDate: null,
  toDate: null,
  timeSlotId: null,
  sectionId: null,
  courseId: null,
  employeeId: [],
  employeeIdOne: "",
  programIdForUpdate: null,
  yearsemId: null,
  weekdayIdOne: "",
  showAttendence: "no",
  intervalTypeId: "",
  onlineStatus: false,
  weekDay: "",
  selectedWeekDay: "",
  remarks: "",
  onlineTestStatus: null,
};

const requiredFields = [
  "acYearId",
  "programSpeId",
  "employeeId",
  "intervalTypeId",
  "courseId",
];

function TimetableForSectionForm() {
  const [isNew, setIsNew] = useState(true);
  const [values, setValues] = useState(initValues);
  const [loading, setLoading] = useState(false);
  const [SchoolNameOptions, setSchoolNameOptions] = useState([]);
  const [EmployeeOptions, setEmployeeOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [programSpeOptions, setProgramSpeOptions] = useState([]);
  const [yearSemOptions, setYearSemOptions] = useState([]);
  const [programId, setProgramId] = useState("");
  const [intervalTypeOptions, setIntervalTypeOptions] = useState([]);
  const [timeSlotsOptions, setTimeSlotOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [programType, setProgramType] = useState("Year");
  const [programAssigmentId, setProgramAssignmentId] = useState(null);
  const [intervalTypeName, setIntervalTypeName] = useState("");
  const [intervalOutside, setIntervalOutside] = useState("");
  const [multipleStaff, setMultipleStaff] = useState("");
  const [commencementDate, setCommencementDate] = useState();
  const [lastDateToPay, setLastDateToPay] = useState();
  const [buttonDisable, setButtonDisable] = useState(false);
  const [lastButton, setLastButton] = useState(false);

  const { setAlertMessage, setAlertOpen } = useAlert();
  const setCrumbs = useBreadcrumbs();
  const { id } = useParams();

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const weekdayOptions = [
    { value: "Sunday", label: "Sunday" },
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
  ];

  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    if (pathname.toLowerCase() === "/timetablemaster/timetable/section/new") {
      setIsNew(true);
      setCrumbs([
        {
          name: "TimetableMaster",
          link: "/TimetableMaster/Timetable",
        },
        { name: "Section" },
        { name: "TimeTable" },
        { name: "Create" },
      ]);
    } else {
      setIsNew(false);
      getTimeItervalData();
    }
  }, [pathname]);

  const checks = {};

  const errorMessages = {};

  const getTimeItervalData = async () => {
    await axios
      .get(`/api/academic/TimeTable/${id}`)
      .then((res) => {
        setValues({
          acYearId: res.data.data.ac_year_id,
          schoolId: res.data.data.school_id,
          programSpeId: res.data.data.program_specialization_id,
          yearsemId: res.data.data.current_year,
          fromDate: res.data.data.from_date,
          toDate: res.data.data.to_date,
          weekdayIdOne: res.data.data.week_day,
          timeSlotId: res.data.data.time_slots_id,
          programIdForUpdate: res.data.data.program_id,
          intervalTypeId: res.data.data.interval_type_id,
          employeeId: res.data.data.emp_id,
          courseId: res.data.data.subject_assignment_id,
          sectionId: res.data.data.section_assignment_id,
          roomId: res.data.data.room_id,
          remarks: res.data.data.remarks,
          onlineStatus: res.data.data.is_status,
        });

        setCrumbs(
          {
            name: "TimetableMaster",
            link: "/TimetableMaster/Timetable",
          },
          { name: "Section" },
          { name: "TimeTable" },
          { name: "Create" }
        );
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    getSchoolNameOptions();
    getAcYearData();
    getProgramSpeData();
    getIntervalTypeOptions();
    getTimeSlotsOptions();
    getSectionData();
    getCourseData();

    getCourseDataOne();
  }, [
    values.acYearId,
    values.schoolId,
    values.programSpeId,
    values.yearsemId,
    values.intervalTypeId,
    values.employeeId,
    values.employeeIdOne,
  ]);

  useEffect(() => {
    getRoomData();
    getAllEmployees();
  }, [
    values.fromDate,
    values.toDate,
    values.weekDay,
    values.timeSlotId,
    values.selectedWeekDay,
  ]);

  useEffect(() => {
    getFromDate();
    getLastDatetoPayFee();
  }, [values.schoolId, values.acYearId, values.programSpeId, values.yearsemId]);

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

  const getAcYearData = async () => {
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

  const getProgramSpeData = async () => {
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
            }))
          );
        })
        .catch((err) => console.error(err));
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

  const getTimeSlotsOptions = async () => {
    if (values.schoolId)
      await axios
        .get(`/api/academic/getTimeSlotsForTimeTable/${values.schoolId}`)
        .then((res) => {
          const sorted = sortTimeSlots(res.data.data);

          setTimeSlotOptions(
            sorted.map((obj) => ({
              value: obj.time_slots_id,
              label: obj.timeSlots,
            }))
          );
        })
        .catch((error) => console.error(error));
  };

  const convertToDate = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return new Date(1970, 0, 1, hours, minutes);
  };

  // Sorting function to sort time slots by start time and then end time
  const sortTimeSlots = (slots) => {
    return slots.sort((a, b) => {
      const [startA, endA] = a.timeSlots.split(" - ").map(convertToDate);
      const [startB, endB] = b.timeSlots.split(" - ").map(convertToDate);

      // First, compare by start time
      if (startA < startB) return -1;
      if (startA > startB) return 1;

      // If start times are equal, compare by end time
      return endA - endB;
    });
  };

  const getSectionData = async () => {
    if (
      values.acYearId &&
      values.schoolId &&
      values.programSpeId &&
      values.yearsemId
    )
      await axios
        .get(
          `/api/academic/getAllSectionsForTimeTable/${values.schoolId}/${values.programSpeId}/${values.acYearId}/${values.yearsemId}`
        )
        .then((res) => {
          setSectionOptions(
            res.data.data.map((obj) => ({
              value: obj.section_assignment_id,
              label: obj.section_name,
            }))
          );
        })
        .catch((error) => console.error(error));
  };

  const getCourseData = async () => {
    if (values.employeeId.length > 0)
      await axios
        .get(
          `/api/academic/fetchAllCourseDetailsForTimeTable/${values.employeeId}`
        )
        .then((res) => {
          setCourseOptions(
            res.data.data.map((obj) => ({
              value: obj.subjet_assign_id,
              label: obj.course_name_with_code,
            }))
          );
        })
        .catch((err) => console.error(err));
  };

  const getCourseDataOne = async () => {
    if (values.employeeIdOne)
      await axios
        .get(
          `/api/academic/fetchAllCourseDetailsForSectionTimeTable/${values.employeeIdOne}/${values.programSpeId}/${values.yearsemId}`
        )
        .then((res) => {
          setCourseOptions(
            res.data.data.map((obj) => ({
              value: obj.subjet_assign_id,
              label: obj.course_name_with_code,
            }))
          );
        })
        .catch((err) => console.error(err));
  };

  const getRoomData = async () => {
    if (
      values.fromDate &&
      values.toDate &&
      (values.weekDay || values.selectedWeekDay) &&
      values.timeSlotId
    )
      await axios
        .get(
          `/api/getAllActiveRoomsForTimeTableBsn/${values.timeSlotId}/${moment(
            values.fromDate
          ).format("DD-MM-YYYY")}/${moment(values.toDate).format(
            "DD-MM-YYYY"
          )}/${values.weekDay ? values.weekDay : values.selectedWeekDay}`
        )
        .then((res) => {
          setRoomOptions(
            res.data.data.map((obj) => ({
              value: obj.room_id,
              label: obj.concate_room_name,
            }))
          );
        })
        .catch((err) => console.error(err));
  };

  const getAllEmployees = async () => {
    if (
      values.fromDate &&
      values.toDate &&
      (values.weekDay || values.selectedWeekDay) &&
      values.timeSlotId
    )
      await axios
        .get(
          `/api/academic/getEmployeesForSectionTimeTable/${values.programSpeId}/${values.yearsemId}`
        )
        .then((res) => {
          setEmployeeOptions(
            res.data.data.map((obj) => ({
              value: obj.emp_id,
              label: obj.employeeName,
            }))
          );
        })
        .catch((err) => console.error(err));
  };

  const getFromDate = async () => {
    if (
      values.acYearId &&
      values.schoolId &&
      values.yearsemId &&
      values.programSpeId
    )
      await axios
        .get(
          `/api/academic/getClassCommencementDetailsForValidatingTimeTable/${
            values.acYearId
          }/${values.schoolId}/${values.yearsemId}/${2}/${values.programSpeId}`
        )
        .then((res) => {
          if (!res.data.data) {
            setAlertMessage({
              severity: "error",
              message: `Commencement of classes is not created`,
            });
            setAlertOpen(true);
            setButtonDisable(true);
          } else {
            setButtonDisable(false);
          }
          setCommencementDate(res.data.data);
        })
        .catch((error) => console.error(error));
  };

  const getLastDatetoPayFee = async () => {
    if (
      values.acYearId &&
      values.schoolId &&
      values.yearsemId &&
      values.programSpeId
    )
      await axios
        .get(
          `/api/academic/getClassCommencementDetailsForValidatingTimeTable/${
            values.acYearId
          }/${values.schoolId}/${values.yearsemId}/${1}/${values.programSpeId}`
        )
        .then((res) => {
          if (!res.data.data) {
            setAlertMessage({
              severity: "error",
              message: `Last date to pay fee is not created`,
            });
            setAlertOpen(true);
            setLastButton(true);
          } else {
            setLastButton(false);
          }
          // setLastDateToPay(res.data.data)
        })
        .catch((error) => console.error(error));
  };

  const handleChange = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleChangeAdvance = async (name, newValue) => {
    if (name === "toDate") {
      const date = new Date(newValue).getDay();
      const newDate = weekday[date];
      setValues((prev) => ({ ...prev, ["selectedWeekDay"]: newDate }));
    }

    if (name === "intervalTypeId") {
      await axios
        .get(`/api/academic/TimeIntervalTypes`)
        .then((res) => {
          res.data.data.filter((obj) => {
            if (obj.intervalTypeId === newValue) {
              setMultipleStaff(obj.allowMultipleStaff);
              setIntervalOutside(obj.outside);
            }
          });
        })
        .catch((err) => console.error(err));

      await axios
        .get(`/api/academic/TimeIntervalTypesInSectionDropdownOfTimetable`)
        .then((res) => {
          res.data.data.filter((obj) => {
            if (obj.intervalTypeId === newValue) {
              setIntervalTypeName(obj.intervalTypeName);
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
          `/api/academic/fetchAllProgramsWithSpecialization/${values.schoolId}`
        )
        .then((res) => {
          const yearsem = [];

          res.data.data.filter((val) => {
            if (val.program_specialization_id === newValue) {
              setProgramId(val.program_id);
              setProgramAssignmentId(val.program_assignment_id);
              yearsem.push(val);
            }
          });
          const newyearsem = [];
          yearsem.forEach((obj) => {
            if (obj.program_type_name.toLowerCase() === "yearly") {
              setProgramType("Year");
              for (let i = 1; i <= obj.number_of_years; i++) {
                newyearsem.push({ label: "Year" + "-" + i, value: i });
              }
            }
            if (obj.program_type_name.toLowerCase() === "semester") {
              setProgramType("Sem");
              for (let i = 1; i <= obj.number_of_semester; i++) {
                newyearsem.push({ label: "Sem" + "-" + i, value: i });
              }
            }
          });

          setYearSemOptions(
            newyearsem.map((obj) => ({
              value: obj.value,
              label: obj.label,
            }))
          );
        })
        .catch((err) => console.error(err));
      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    } else {
      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }
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
      setLoading(true);
      const temp = {};
      temp.active = true;
      temp.ac_year_id = values.acYearId;
      temp.school_id = values.schoolId;
      temp.program_specialization_id = values.programSpeId;
      temp.program_id = programId;
      temp.program_assignment_id = programAssigmentId;
      programType === "Year"
        ? (temp.current_year = values.yearsemId)
        : (temp.current_sem = values.yearsemId);
      temp.from_date = values.fromDate.substr(0, 19) + "Z";
      temp.to_date = values.toDate.substr(0, 19) + "Z";
      temp.week_day = values.weekDay ? values.weekDay : values.selectedWeekDay;
      temp.time_slots_id = values.timeSlotId;
      temp.interval_type_id = values.intervalTypeId;
      temp.subject_assignment_id = values.courseId;
      temp.section_assignment_id = values.sectionId;
      temp.room_id = values.roomId;
      temp.remarks = values.remarks;
      temp.is_online = values.onlineStatus === "true" ? true : false;
      temp.emp_id = values.employeeIdOne
        ? values.employeeIdOne.toString().split(",")
        : values.employeeId;
      temp.test_status = values.onlineTestStatus;

      if (values.fromDate.toLocaleString() === values.toDate.toLocaleString()) {
        await axios
          .post(`/api/academic/TimeTable`, temp)
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

            navigate(`/TimetableMaster/Timetable`);
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
            console.error(err);
          });
      } else {
        await axios
          .post(`/api/academic/createMultipleTimeTable`, temp)
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

            navigate(`/TimetableMaster/Timetable`);
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
            console.error(err);
          });
      }
    }
  };

  return (
    <Box component="form" overflow="hidden" p={1}>
      <FormWrapper>
        <Grid
          container
          alignItems="center"
          justifyContent="flex-start"
          rowSpacing={4}
          columnSpacing={{ xs: 2, md: 4 }}
        >
          <Grid item xs={12} md={3}>
            <CustomAutocomplete
              name="acYearId"
              label="Academic Year"
              value={values.acYearId}
              options={academicYearOptions}
              handleChangeAdvance={handleChangeAdvance}
              required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <CustomAutocomplete
              name="schoolId"
              label="Institute"
              value={values.schoolId}
              options={SchoolNameOptions}
              handleChangeAdvance={handleChangeAdvance}
              required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <CustomAutocomplete
              name="programSpeId"
              label="Program Major"
              value={values.programSpeId}
              options={programSpeOptions}
              handleChangeAdvance={handleChangeAdvance}
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
              required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <CustomAutocomplete
              name="sectionId"
              label="Section"
              value={values.sectionId}
              options={sectionOptions}
              handleChangeAdvance={handleChangeAdvance}
              required
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <CustomDatePicker
              name="fromDate"
              label="From Date"
              value={values.fromDate}
              handleChangeAdvance={handleChangeAdvance}
              checks={checks.fromDate}
              errors={errorMessages.fromDate}
              minDate={
                roleName === "Super Admin" ||
                roleName === "Admin" ||
                roleName === "Principal" ||
                roleName === "HOD" ||
                roleName === "Accounts Role"
                  ? new Date(commencementDate?.from_date)
                  : new Date(new Date().setDate(new Date().getDate() + 3))
              }
              required
              helperText=""
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <CustomDatePicker
              name="toDate"
              label="To Date"
              value={values.toDate}
              handleChangeAdvance={handleChangeAdvance}
              checks={checks.toDate}
              errors={errorMessages.toDate}
              required
              minDate={values.fromDate}
              helperText=""
            />
          </Grid>
          {new Date(values.fromDate).getDay() ===
          new Date(values.toDate).getDay() ? (
            <Grid item xs={12} md={3}>
              <CustomAutocomplete
                name="selectedWeekDay"
                label="Weekday"
                value={values.selectedWeekDay}
                options={weekdayOptions}
                handleChangeAdvance={handleChangeAdvance}
                disabled
                required
              />
            </Grid>
          ) : (
            <Grid item xs={12} md={3}>
              <CustomAutocomplete
                name="weekDay"
                label="Weekday"
                value={values.weekDay}
                options={weekdayOptions}
                handleChangeAdvance={handleChangeAdvance}
                required
              />
            </Grid>
          )}

          <Grid item xs={12} md={3}>
            <CustomAutocomplete
              name="timeSlotId"
              label="Time Slots"
              value={values.timeSlotId}
              options={timeSlotsOptions}
              handleChangeAdvance={handleChangeAdvance}
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
              required
            />
          </Grid>

          {intervalTypeName.toLowerCase() !== "tea break" &&
          intervalTypeName.toLowerCase() !== "lunch break" &&
          multipleStaff.toLowerCase() === "yes" ? (
            <Grid item xs={12} md={3}>
              <CustomMultipleAutocomplete
                name="employeeId"
                label="Employee"
                value={values.employeeId}
                options={EmployeeOptions}
                handleChangeAdvance={handleChangeAdvance}
                required
              />
            </Grid>
          ) : intervalTypeName.toLowerCase() !== "tea break" &&
            intervalTypeName.toLowerCase() !== "lunch break" &&
            multipleStaff.toLowerCase() === "no" ? (
            <Grid item xs={12} md={3}>
              <CustomAutocomplete
                name="employeeIdOne"
                label="Employee"
                value={values.employeeIdOne}
                options={EmployeeOptions}
                handleChangeAdvance={handleChangeAdvance}
                required
              />
            </Grid>
          ) : (
            <></>
          )}

          {intervalTypeName.toLowerCase() !== "tea break" &&
          intervalTypeName.toLowerCase() !== "lunch break" ? (
            <>
              <Grid item xs={12} md={3}>
                <CustomAutocomplete
                  name="courseId"
                  label="Course"
                  value={values.courseId}
                  options={courseOptions}
                  handleChangeAdvance={handleChangeAdvance}
                  required
                />
              </Grid>
              {intervalOutside === "No" && (
                <Grid item xs={12} md={3}>
                  <CustomAutocomplete
                    name="roomId"
                    label="Room"
                    value={values.roomId}
                    options={roomOptions}
                    handleChangeAdvance={handleChangeAdvance}
                    required
                  />
                </Grid>
              )}

              <Grid item xs={12} md={3}>
                <CustomTextField
                  name="remarks"
                  label="Remarks"
                  value={values.remarks}
                  handleChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <CustomRadioButtons
                  name="onlineStatus"
                  label="Online Status"
                  value={values.onlineStatus}
                  items={[
                    { value: true, label: "Yes" },
                    { value: false, label: "No" },
                  ]}
                  handleChange={handleChange}
                />
              </Grid>

              {/* <Grid item xs={12} md={3}>
                <CustomRadioButtons
                  name="onlineTestStatus"
                  label="Daily Test"
                  value={values.onlineTestStatus}
                  items={[
                    { value: true, label: "Yes" },
                    { value: false, label: "No" },
                  ]}
                  handleChange={handleChange}
                />
              </Grid> */}
            </>
          ) : (
            <></>
          )}

          <Grid item xs={12} textAlign="right">
            <Button
              style={{ borderRadius: 7 }}
              variant="contained"
              color="primary"
              disabled={loading || buttonDisable || lastButton}
              onClick={handleCreate}
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
        {isNew && values.employeeId.length > 0 ? (
          <Grid container justifyContent="center">
            {values.employeeId.length > 0 ? (
              <Grid item xs={12} md={10} mt={4}>
                <EmployeetimetableDetails
                  data={values.employeeId}
                  date={
                    values.fromDate
                      ? moment(values.fromDate).format("YYYY-MM-DD")
                      : ""
                  }
                  toDate={
                    values.toDate
                      ? moment(values.toDate).format("YYYY-MM-DD")
                      : ""
                  }
                  weekDay={values.weekDay}
                  selectedDay={values.selectedWeekDay}
                />
              </Grid>
            ) : (
              <></>
            )}
          </Grid>
        ) : (
          <></>
        )}

        {isNew && values.employeeIdOne ? (
          <Grid container justifyContent="center">
            {values.employeeIdOne ? (
              <Grid item xs={12} md={10} mt={4}>
                <EmployeetimetableDetails
                  data={values.employeeIdOne}
                  date={
                    values.fromDate
                      ? moment(values.fromDate).format("YYYY-MM-DD")
                      : ""
                  }
                  toDate={
                    values.toDate
                      ? moment(values.toDate).format("YYYY-MM-DD")
                      : ""
                  }
                  weekDay={values.weekDay}
                  selectedDay={values.selectedWeekDay}
                />
              </Grid>
            ) : (
              <></>
            )}
          </Grid>
        ) : (
          <></>
        )}
      </FormWrapper>
    </Box>
  );
}

export default TimetableForSectionForm;
