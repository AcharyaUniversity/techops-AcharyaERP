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

const initValues = {
  acYearId: null,
  schoolId: null,
  fromDate: null,
  toDate: null,
  timeSlotId: null,
  batchId: null,
  courseId: null,
  employeeId: [],
  employeeIdOne: null,
  programIdForUpdate: null,
  yearsemId: null,
  weekdayIdOne: "",
  weekDay: "",
  selectedWeekDay: "",
  showAttendence: "no",
  intervalTypeId: "",
  onlineStatus: false,
  onlineTestStatus: null,
  remarks: "",
};

const requiredFields = [
  "acYearId",
  // "batchId",
  "fromDate",
  "toDate",
  "timeSlotId",
  "intervalTypeId",
  "courseId",
  "roomId",
];

const roleName = JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.roleName;

const userID = JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.userId;

function FacultyTimetableBatchDept() {
  const [isNew, setIsNew] = useState(true);
  const [values, setValues] = useState(initValues);
  const [intervalTypeId, setintervalTypeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [SchoolNameOptions, setSchoolNameOptions] = useState([]);
  const [EmployeeOptions, setEmployeeOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [programId, setProgramId] = useState("");
  const [intervalTypeOptions, setIntervalTypeOptions] = useState([]);
  const [timeSlotsOptions, setTimeSlotOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [weekdayId, setWeekdayId] = useState("");
  const [intervalTypeData, setIntervalTypeData] = useState([]);
  const [employeeData, setEmployeeData] = useState();
  const [commencementDate, setCommencementDate] = useState();
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
    if (pathname.toLowerCase() === "/facultytimetable-batch-dept") {
      setIsNew(true);
      setCrumbs([
        {
          name: "Faculty Master Dept",
          link: "/FacultyMaster/Dept",
        },
        { name: "Batch" },
        { name: "TimeTable" },
        { name: "Create" },
      ]);
    } else {
      setIsNew(false);
      getTimeItervalData();
    }
  }, [pathname]);

  const checks = {
    employeeId: [values.employeeId.length < 2],
    fromDate: [values.fromDate !== null],
    toDate: [values.toDate !== null],
  };

  const errorMessages = {
    employeeId: ["Select only one employee"],
    fromDate: ["This field is required"],
    toDate: ["This field is required"],
  };

  const getTimeItervalData = async () => {
    await axios
      .get(`/api/academic/TimeTable/${id}`)
      .then((res) => {
        setValues({
          acYearId: res.data.data.ac_year_id,
          schoolId: res.data.data.school_id,
          yearsemId: res.data.data.current_year,
          fromDate: res.data.data.from_date,
          toDate: res.data.data.to_date,
          weekdayIdOne: res.data.data.week_day,
          timeSlotId: res.data.data.time_slots_id,
          programIdForUpdate: res.data.data.program_id,
          intervalTypeId: res.data.data.interval_type_id,
          employeeId: res.data.data.emp_id,
          courseId: res.data.data.subject_assignment_id,
          batchId: res.data.data.batch_assignment_id,
          roomId: res.data.data.room_id,
          remarks: res.data.data.remarks,
          onlineStatus: res.data.data.is_status,
        });
        setintervalTypeId(res.data.data.intervalTypeId);
        setCrumbs(
          {
            name: "TimetableMaster",
            link: "/TimetableMaster/Timetable",
          },
          { name: "Batch" },
          { name: "TimeTable" },
          { name: "Create" }
        );
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    getSchoolNameOptions();
    getAcademicYearOptions();
    getIntervalTypeOptions();
    getTimeSlotsOptions();

    getCourseData();
    getBatchData();
  }, [
    values.acYearId,
    values.schoolId,
    values.yearsemId,
    values.intervalTypeId,
    values.employeeId,
  ]);

  useEffect(() => {
    getEmployeeOptions();
    getRoomData();
  }, [
    values.fromDate,
    values.toDate,
    values.weekdayIdOne,
    values.timeSlotId,
    values.batchId,
    weekdayId,
  ]);

  useEffect(() => {
    getEmployeeDetails();
  }, []);

  useEffect(() => {
    getFromDate();
    getLastDatetoPayFee();
  }, [values.schoolId, values.acYearId, values.programSpeId, values.yearsemId]);

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
          if (res.data.data && new Date() < new Date(res.data.data.from_date)) {
            setAlertMessage({
              severity: "error",
              message: `You can create timetable from ${moment(
                res.data.data.from_date
              ).format("DD-MM-YYYY")}`,
            });
            setAlertOpen(true);
            setButtonDisable(true);
          } else if (!res.data.data) {
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
          // if (res.data.data && new Date() < new Date(res.data.data.from_date)) {
          //   setAlertMessage({
          //     severity: "error",
          //     message: `You can create timetable from ${moment(
          //       res.data.data.from_date
          //     ).format("DD-MM-YYYY")}`,
          //   });
          //   setAlertOpen(true);
          //   setButtonDisable(true);
          // } else

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
          setCommencementDate(res.data.data);
        })
        .catch((error) => console.error(error));
  };

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

  const getEmployeeOptions = async () => {
    if (
      values.fromDate &&
      values.toDate &&
      values.timeSlotId &&
      values.batchId &&
      (values.weekDay || values.selectedWeekDay)
    )
      await axios
        .get(`/api/academic/getEmployeesForBatchTimeTable/${values.batchId}`)
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

  const getAcademicYearOptions = async () => {
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

  const getIntervalTypeOptions = async () => {
    await axios
      .get(`/api/academic/TimeIntervalTypes`)
      .then((res) => {
        const a = res.data.data.filter(
          (obj) => obj.showBatch.toLowerCase() === "yes"
        );
        setIntervalTypeOptions(
          a.map((obj) => ({
            label: obj.intervalTypeName,
            value: obj.intervalTypeId,
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
          setTimeSlotOptions(
            res.data.data.map((obj) => ({
              value: obj.time_slots_id,
              label: obj.timeSlots,
            }))
          );
        })
        .catch((error) => console.error(error));
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
          ).format("DD-MM-YYYY")}/${moment(values.toDate).format("DD-MM-YYYY")}`
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

  const getCourseData = async () => {
    if (values.employeeId.length > 0)
      await axios
        .get(
          `/api/academic/fetchAllCourseDetailsForBatchTimeTable/${values.employeeId}/${values.batchId}`
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

  const getBatchData = async () => {
    const yearSemSplit = values?.yearsemId?.split("/");
    if (values.intervalTypeId && yearSemSplit[1] === "0") {
      await axios
        .get(
          `/api/academic/getAllBatchesForTimeTable?school_id=${values.schoolId}&ac_year_id=${values.acYearId}&current_year=${yearSemSplit[0]}&interval_type_id=${values.intervalTypeId}`
        )
        .then((res) => {
          setBatchOptions(
            res.data.data.map((obj) => ({
              value: obj.batch_assignment_id,
              label: obj.batch_name,
            }))
          );
        })
        .catch((err) => console.error(err));
    } else if (values.intervalTypeId && yearSemSplit[1] !== "0") {
      await axios
        .get(
          `/api/academic/getAllBatchesForTimeTable?school_id=${values.schoolId}&ac_year_id=${values.acYearId}&current_sem=${yearSemSplit[1]}&interval_type_id=${values.intervalTypeId}`
        )
        .then((res) => {
          setBatchOptions(
            res.data.data.map((obj) => ({
              value: obj.batch_assignment_id,
              label: obj.batch_name,
            }))
          );
        })
        .catch((err) => console.error(err));
    }
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
          res.data.data.filter((val) => {
            if (val.intervalTypeId === newValue) {
              setIntervalTypeData(val);
            }
          });
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
      const yearSemSplit = values?.yearsemId?.split("/");
      const temp = {};
      temp.active = true;
      temp.ac_year_id = values.acYearId;
      temp.school_id = values.schoolId;
      temp.program_id = programId.toString();
      yearSemSplit[1] === "0"
        ? (temp.current_year = Number(yearSemSplit[0]))
        : (temp.current_sem = Number(yearSemSplit[1]));
      temp.from_date = moment(values.fromDate).format("YYYY-MM-DD");
      temp.to_date = moment(values.toDate).format("YYYY-MM-DD");
      temp.week_day = values.weekDay ? values.weekDay : values.selectedWeekDay;
      temp.time_slots_id = values.timeSlotId;
      temp.interval_type_id = values.intervalTypeId;
      temp.emp_id = values.employeeId;
      temp.subject_assignment_id = values.courseId;
      temp.batch_assignment_id = values.batchId;
      temp.room_id = values.roomId;
      temp.remarks = values.remarks;
      temp.is_online = values.onlineStatus;

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

            navigate(`/FacultyMaster/Dept`);
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

            navigate(`/FacultyMaster/Dept`);
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

  const handleUpdate = async () => {
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
      temp.intervalTypeId = intervalTypeId;
      temp.intervalTypeName = values.intervalType;
      temp.intervalTypeShort = values.shortName;
      temp.remarks = values.remarks;
      temp.showBatch = values.showBatch;
      temp.outside = values.outsideCampus;
      temp.showSubject = values.showSubject;
      temp.showAttendance = values.showAttendence;

      await axios
        .put(`/api/academic/TimeIntervalTypes/${id}`, temp)
        .then((res) => {
          if (res.status === 200 || res.status === 201) {
            setAlertMessage({
              severity: "success",
              message: "Form Updated Successfully",
            });
            navigate("/FacultyMaster/Dept", { replace: true });
          } else {
            setLoading(false);
            setAlertMessage({
              severity: "error",
              message: res.data.message,
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
              disabled={employeeData}
              required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <CustomAutocomplete
              name="yearsemId"
              label="Year/Sem"
              value={values.yearsemId}
              options={[
                { label: "1/0", value: "1/0" },
                { label: "2/0", value: "2/0" },
                { label: "3/0", value: "3/0" },
                { label: "4/0", value: "4/0" },
                { label: "1/1", value: "1/1" },
                { label: "1/2", value: "1/2" },
                { label: "2/3", value: "2/3" },
                { label: "2/4", value: "2/4" },
                { label: "3/5", value: "3/5" },
                { label: "3/6", value: "3/6" },
                { label: "4/7", value: "4/7" },
                { label: "4/8", value: "4/8" },
              ]}
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
                roleName === "HOD"
                  ? new Date(commencementDate?.from_date)
                  : new Date(new Date().setDate(new Date().getDate()))
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
          <Grid item xs={12} md={3}>
            <CustomAutocomplete
              name="batchId"
              label="Batch"
              value={values.batchId}
              options={batchOptions}
              handleChangeAdvance={handleChangeAdvance}
              required
            />
          </Grid>

          {intervalTypeData.allowMultipleStaff === "No" ? (
            <Grid item xs={12} md={3}>
              <CustomMultipleAutocomplete
                name="employeeId"
                label="Employee"
                value={values.employeeId}
                options={EmployeeOptions}
                handleChangeAdvance={handleChangeAdvance}
                checks={checks.employeeId}
                errors={errorMessages.employeeId}
                required
              />
            </Grid>
          ) : (
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
          )}

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
          <Grid item xs={12} md={1}>
            <Button
              style={{ borderRadius: 7 }}
              variant="contained"
              color="primary"
              disabled={loading || buttonDisable || lastButton}
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
        {isNew ? (
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
      </FormWrapper>
    </Box>
  );
}

export default FacultyTimetableBatchDept;
