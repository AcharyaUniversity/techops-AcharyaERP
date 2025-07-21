import { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Grid,
  Typography,
  Tooltip,
  tooltipClasses,
  Paper,
  styled,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
} from "@mui/material";
import GridIndex from "../../../components/GridIndex";
import { Check, HighlightOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import AddIcon from "@mui/icons-material/Add";
import SwapHorizontalCircleIcon from "@mui/icons-material/SwapHorizontalCircle";
import CustomModal from "../../../components/CustomModal";
import axios from "../../../services/Api";
import FormWrapper from "../../../components/FormWrapper";
import CustomAutocomplete from "../../../components/Inputs/CustomAutocomplete";
import ModalWrapper from "../../../components/ModalWrapper";
import useAlert from "../../../hooks/useAlert";
import moment from "moment";
import CustomDatePicker from "../../../components/Inputs/CustomDatePicker";

const initialValues = {
  acYearId: null,
  courseId: null,
  employeeId: null,
  roomId: null,
  school_Id: null,
  programId: null,
  classDate: null,
  yearSem: null,
};

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "white",
    color: "rgba(0, 0, 0, 0.6)",
    maxWidth: 300,
    fontSize: 12,
    // border: "1px solid rgba(224, 224, 224, 1)",
    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px;",
    padding: "10px",
  },
}));

const useStyles = makeStyles((theme) => ({
  table: {
    "& .MuiTableCell-root": {},
  },
  bg: {
    backgroundColor: theme.palette.primary.main,
    textAlign: "center",
  },
  red: {
    background: "#ff9999 !important",
  },
}));

function TimetableForSectionIndex() {
  const [rows, setRows] = useState([]);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    buttons: [],
  });
  const [modalSelectContent, setModalSelectContent] = useState({
    title: "",
    message: "",
    buttons: [],
  });
  const [paginationData, setPaginationData] = useState({
    rows: [],
    loading: false,
    page: 0,
    pageSize: 100,
    total: 0,
  });
  const [filterString, setFilterString] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSelectOpen, setModalSelectOpen] = useState(false);
  const [ids, setIds] = useState([]);
  const [timetableIds, setTimeTableIds] = useState([]);

  const [values, setValues] = useState(initialValues);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [yearSemOptions, setYearSemOptions] = useState([]);

  const [employeeDetailsOpen, setEmployeeDetailsOpen] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [previousEmployeeId, setPreviousEmployeeId] = useState(null);
  const [timeTableId, setTimeTableId] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [studentListOpen, setStudentListOpen] = useState(false);
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [roomSwapOpen, setRoomSwapOpen] = useState(false);
  const [roomOptions, setRoomOptions] = useState([]);

  const navigate = useNavigate();
  const { setAlertMessage, setAlertOpen } = useAlert();
  const classes = useStyles();
  const [isActive, setIsActive] = useState(true);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    ac_year: false,
    school_name_short: false,
    from_date: false,
    to_date: false,
    interval_type_short: false,
    week_day: false,
    employee_name: false,
    created_username: false,
    created_date: false,
  });

  const columns = [
    {
      field: "ac_year",
      headerName: "AC Year",
      flex: 1,
      hide: true,
    },
    {
      field: "school_name_short",
      headerName: "School",
      flex: 1,
      hide: true,
    },
    {
      field: "program_specialization_short_name",
      headerName: "Specialization",
      flex: 1,
    },
    {
      field: "",
      headerName: "Year/Sem",
      flex: 1,
      valueGetter: (value, row) =>
        row.current_year ? row.current_year : row.current_sem,
    },
    { field: "from_date", headerName: "From Date", flex: 1, hide: true },
    { field: "to_date", headerName: "To Date", flex: 1, hide: true },

    { field: "timeSlots", headerName: "Time Slots", flex: 1 },
    {
      field: "interval_type_short",
      headerName: "Interval Type",
      flex: 1,
      hide: true,
    },
    {
      field: "week_day",
      headerName: "Week Day",
      flex: 1,
      valueGetter: (value, row) =>
        row.week_day ? row.week_day.substr(0, 3) : "",
      hide: true,
    },
    {
      field: "selected_date",
      headerName: "Class date",
      flex: 1,
      valueGetter: (value, row) =>
        moment(row.selected_date).format("DD-MM-YYYY"),
    },

    {
      field: "course_code",
      headerName: "Course",
      renderCell: (params) => {
        return (
          <HtmlTooltip title={params.row.course_name}>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              sx={{ cursor: "pointer" }}
            >
              {params.row.course_code}
            </Typography>
          </HtmlTooltip>
        );
      },
    },
    {
      field: "empcode",
      headerName: "Emp Code",
      flex: 1,
      renderCell: (params) => {
        return (
          <HtmlTooltip
            title={`Employee : ${params.row.employee_name} & Dept : ${params.row.dept_name}`}
          >
            <Typography
              variant="subtitle2"
              color="textSecondary"
              sx={{ cursor: "pointer" }}
            >
              {params.row.empcode}
            </Typography>
          </HtmlTooltip>
        );
      },
    },
    {
      field: "employee_name",
      headerName: "Faculty",
      flex: 1,
      hide: true,
    },
    { field: "roomcode", headerName: "Room Code", flex: 1 },
    {
      field: "section_name",
      headerName: "Section",
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography
            variant="subtitle2"
            sx={{ cursor: "pointer", fontSize: 14, marginLeft: 2 }}
            onClick={() => handleStudentList(params)}
            color="primary"
          >
            {params.row.section_name ? params.row.section_name : "NA"}
          </Typography>
        );
      },
    },

    {
      field: "batch_name",
      headerName: "Batch",
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography
            variant="subtitle2"
            sx={{ cursor: "pointer", fontSize: 14, marginLeft: 2 }}
            onClick={() => handleStudentListForBatch(params)}
            color="primary"
          >
            {params.row.batch_name ? params.row.concat_batch_name : "NA"}
          </Typography>
        );
      },
    },
    {
      field: "swap",
      headerName: "Swap",
      flex: 1,
      type: "actions",
      getActions: (params) => [
        <IconButton
          onClick={() => handleDetails(params)}
          color="primary"
          disabled={!params.row.active} // Disable if active is false
        >
          <SwapHorizontalCircleIcon />
        </IconButton>,
      ],
    },
    {
      field: "room_swap",
      headerName: "Room Swap",
      flex: 1,
      type: "actions",
      getActions: (params) => [
        <IconButton
          onClick={() => handleRoomSwap(params)}
          color="primary"
          disabled={!params.row.active} // Disable if active is false
        >
          <SwapHorizontalCircleIcon />
        </IconButton>,
      ],
    },

    {
      field: "created_username",
      headerName: "Created By",
      flex: 1,
      hide: true,
    },
    {
      field: "created_date",
      headerName: "Created Date",
      flex: 1,
      hide: true,
      valueGetter: (value, row) =>
        row.created_date ? moment(row.created_date).format("DD-MM-YYYY") : "",
    },
    {
      field: "active",
      headerName: "Active",
      flex: 1,
      type: "actions",
      sortable: true,
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
    getSchoolData();
  }, [
    values.acYearId,
    paginationData.page,
    paginationData.pageSize,
    filterString,
  ]);

  useEffect(() => {
    getAcYearData();
  }, []);

  useEffect(() => {
    getCourseData();
  }, [values.employeeId]);

  useEffect(() => {
    getProgram();
    getData();
  }, [values.school_Id]);

  useEffect(() => {
    getData();
  }, [values.programId, values.classDate, values.yearSem, isActive]);

  const getProgram = async () => {
    const { school_Id } = values;
    if (!school_Id) return null;

    try {
      const { data: response } = await axios.get(
        `/api/academic/fetchAllProgramsWithSpecialization/${school_Id}`
      );
      const optionData = [];
      const responseData = response.data;
      response.data.forEach((obj) => {
        optionData.push({
          value: obj.program_specialization_id,
          label: `${obj.program_short_name} - ${obj.program_specialization_name}`,
          program_id: obj.program_id,
        });
      });
      const programObject = responseData.reduce((acc, next) => {
        acc[next.program_specialization_id] = next;
        return acc;
      }, {});
      setProgramOptions(optionData);
      // setProgramData(programObject);
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message:
          err.response?.data?.message || "Failed to load the programs data",
      });
      setAlertOpen(true);
    }
  };
  const getSchoolData = async () => {
    await axios
      .get(`/api/institute/school`)
      .then((res) => {
        setSchoolOptions(
          res.data.data.map((obj) => ({
            value: obj.school_id,
            label: obj.school_name_short,
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
      const latestYear = Math.max(...ids);
      const latestYearId = response.data.data.filter(
        (obj) => obj.current_year === 2024
      );
      setAcademicYearOptions(optionData);
      setValues((prev) => ({
        ...prev,
        acYearId: latestYearId[0].ac_year_id,
      }));
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message: "Failed to fetch the academic years !!",
      });
      setAlertOpen(true);
    }
  };

  const getData = async () => {
    const { page, pageSize } = paginationData;

    // setLoading(true);
    if (values.acYearId) {
      const programInfo = programOptions?.find(
        (obj) => obj?.value == values.programId
      );
      try {
        setPaginationData((prev) => ({
          ...prev,
          loading: true,
        }));
        const temp = {
          ac_year_id: values.acYearId,
          ...(values.programId && { program_id: programInfo?.program_id }),
          ...(values.programId && {
            program_specialization_id: values.programId,
          }),
          ...(values.school_Id && { school_id: values.school_Id }),
          // userId: userID,
          page: page,
          page_size: pageSize,
          sort: "created_date",
          active: isActive,
          ...(values.classDate && {
            selected_date: moment(values.classDate).format("YYYY-MM-DD"),
          }),
          ...(values.yearSem && { current_sem: values.yearSem }),
          ...(filterString && { keyword: filterString }),
        };

        const queryParams = Object.keys(temp)
          .filter((key) => temp[key] !== undefined && temp[key] !== null)
          .map((key) => `${key}=${encodeURIComponent(temp[key])}`)
          .join("&");

        const url = `/api/academic/fetchTimeTableDetailsForIndex?${queryParams}`;
        const response = await axios.get(url);
        const { content, totalElements } = response.data.data.Paginated_data;
        // const dataArray = response?.data?.data?.Paginated_data?.content || [];
        const mainData = content?.map((obj) =>
          obj.id === null ? { ...obj, id: obj.time_table_id } : obj
        );
        const uniqueData = Array.from(
          new Map(mainData?.map((item) => [item.id, item])).values()
        );
        setPaginationData((prev) => ({
          ...prev,
          rows: uniqueData,
          total: totalElements,
          loading: false,
        }));
        // setRows(mainData);
        // setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        // setLoading(false);
        setPaginationData((prev) => ({
          ...prev,
          loading: false,
        }));
      }
    }
  };

  const handleStudentList = async (params) => {
    setStudentList([]);
    setStudentListOpen(true);
    const data = params.row;
    await axios
      .get(
        `/api/academic/assignedStudentBySectionAssignmentId/${data.section_assignment_id}`
      )
      .then((res) => {
        setStudentList(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  const handleStudentListForBatch = async (params) => {
    setStudentList([]);
    setStudentListOpen(true);
    await axios
      .get(
        `/api/academic/studentDetailsWithBatchName/${params.row.batch_assignment_id}`
      )
      .then((res) => {
        setStudentList(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  const onSelectionModelChange = (ids) => {
    const selectedRowsData = ids?.map((id) =>
      paginationData?.rows?.find((row) => row?.id === id)
    );
    setIds(selectedRowsData?.map((val) => val?.time_table_employee_id));
    setTimeTableIds(selectedRowsData?.map((val) => val?.id));
  };

  const handleChangeAdvance = async (name, newValue) => {
    if (name === "employeeId") {
      await axios
        .get(
          `/api/employee/getEmployeesUnderDepartment/${data.row.emp_id}/${data.row.selected_date}/${data.row.time_slots_id}`
        )
        .then((res) => {
          res.data.data.filter((obj) => {
            if (obj.emp_id === newValue) {
              setUserId(obj.userDetail_id);
            }
          });
        })
        .catch((err) => console.error(err));
    }
    // else if (name === "programId") {
    //   axios
    //     .get(`/api/academic/fetchAllProgramsWithSpecialization/${values.school_Id}`)
    //     .then((res) => {
    //       const yearsem = [];

    //       res.data.data.filter((val) => {
    //         if (val.program_specialization_id == newValue) {
    //           yearsem.push(val);
    //         }
    //       });
    //       const newYear = [];
    //       yearsem.map((obj) => {
    //         if (obj.program_type_name.toLowerCase() == "yearly") {
    //           for (let i = 1; i <= obj.number_of_years; i++) {
    //             newYear.push({ value: i, label: "Year" + "-" + i });
    //           }
    //         }
    //         if (obj.program_type_name.toLowerCase() == "semester") {
    //           for (let i = 1; i <= obj.number_of_semester; i++) {
    //             newYear.push({ value: i, label: "Sem" + "-" + i });
    //           }
    //         }
    //       });

    //       setYearSemOptions(
    //         newYear.map((obj) => ({
    //           value: obj.value,
    //           label: obj.label,
    //         }))
    //       );
    //       console.log(newYear, "newYear");

    //       setYearSemOptions(
    //         newYear.map((obj) => ({
    //           value: obj.value,
    //           label: obj.label,
    //         }))
    //       );
    //     })
    //     .catch((err) => console.error(err));
    //   setValues((prev) => ({
    //     ...prev,
    //     [name]: newValue,
    //     ...(name === "programId" && { yearSem: "" }),
    //   }));
    // }
    // else {
    setValues((prev) => ({
      ...prev,
      [name]: newValue,
      ...(name === "school_Id" && { yearSem: "", programId: "" }),
    }));
    // }
  };

  const handleActive = async (params) => {
    const id = params.row.id;

    const response = await axios
      .get(`/api/student/checkTimeTableStatus/${timetableIds.toString()}`)
      .then((res) => {
        return res.data.data;
      });

    const filterRes = response.every((obj) => !obj.presentStatus);

    console.log(filterRes);

    const handleToggle = async () => {
      if (params.row.active === true) {
        await axios
          .delete(`/api/academic/deactivateTimeTableEmployee/${ids.toString()}`)
          .then((res) => {
            if (res.status === 200) {
              getData();
            }
          })
          .catch((err) => console.error(err));
      } else {
        await axios
          .delete(`/api/academic/activateTimeTableEmployee/${ids.toString()}`)
          .then((res) => {
            if (res.status === 200) {
              getData();
            }
          })
          .catch((err) => console.error(err));
      }
    };
    params.row.active === true && ids.length > 0
      ? setModalContent({
          title: "",
          message: "Do you want to make it Inactive ?",
          buttons: [
            { name: "Yes", color: "primary", func: handleToggle },
            { name: "No", color: "primary", func: () => {} },
          ],
        })
      : params.row.active === false && ids.length > 0
      ? setModalContent({
          title: "",
          message: "Do you want to make it Active ?",
          buttons: [
            { name: "Yes", color: "primary", func: handleToggle },
            { name: "No", color: "primary", func: () => {} },
          ],
        })
      : setModalContent({
          title: "",
          message: "Please select the checkbox !!!",
        });

    if (filterRes) {
      setModalOpen(true);
    } else {
      const attendanceTaken = response.find((obj) => obj.presentStatus);
      setAlertMessage({
        severity: "error",
        message: `Attendance is taken for time_table_id ${attendanceTaken.time_table_id}`,
      });
      setAlertOpen(true);
    }
  };

  const handleSelectOpen = () => {
    const handleSectionCreation = () => {
      navigate("/TimetableMaster/Timetable/Section/New");
    };
    const handleBatchCreation = () => {
      navigate("/TimetableMaster/Timetable/Batch/New");
    };
    setModalSelectOpen(true);
    setModalSelectContent({
      title: "Create Timetable For",
      message: "",
      buttons: [
        { name: "Section", color: "primary", func: handleSectionCreation },
        { name: "Batch", color: "primary", func: handleBatchCreation },
      ],
    });
  };

  const handleDetails = async (params) => {
    setPreviousEmployeeId(params.row.emp_id);
    setTimeTableId(params.row.id);
    setData(params);
    setValues((prev) => ({
      ...prev,
      courseId: null,
      employeeId: null,
      roomId: null,
    }));
    await axios
      .get(
        `/api/employee/getEmployeesUnderDepartment/${params.row.emp_id}/${params.row.selected_date}/${params.row.time_slots_id}`
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
    setEmployeeDetailsOpen(true);
  };

  const handleRoomSwap = async (params) => {
    setPreviousEmployeeId(params.row.emp_id);
    setTimeTableId(params.row.id);
    setData(params);
    setValues((prev) => ({
      ...prev,
      ["courseId"]: null,
      ["employeeId"]: null,
      ["roomId"]: null,
    }));
    await axios
      .get(
        `/api/roomsForTimeTableRoomSwapping/${params.row.time_slots_id}/${params.row.selected_date}`
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
    setRoomSwapOpen(true);
  };

  const getCourseData = async () => {
    if (userId)
      await axios
        .get(`/api/academic/getAssignedCourses/${userId}`)
        .then((res) => {
          setCourseOptions(
            res.data.data.map((obj) => ({
              value: obj.subjet_assign_id,
              label: obj.course_name_with_code,
            }))
          );
        })
        .catch((error) => console.error(error));
  };

  const handleSubmit = async () => {
    await axios
      .put(
        `/api/academic/updateEmployeeIdForSwapping/${timeTableId}/${previousEmployeeId}/${values.employeeId}/${values.courseId}`
      )
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          setAlertMessage({ severity: "success", message: "Swapped" });
          setAlertOpen(true);
          setRoomSwapOpen(false);
          setEmployeeDetailsOpen(false);
          getData();
        } else {
          setAlertMessage({ severity: "error", message: "Error" });
          setAlertOpen(true);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleAssignRoom = async () => {
    await axios
      .put(
        `/api/academic/updateRoomForSwapping/${timeTableId}/${values.roomId}`
      )
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          setAlertMessage({ severity: "success", message: "Swapped" });
          setAlertOpen(true);
          setRoomSwapOpen(false);
          getData();
        } else {
          setAlertMessage({ severity: "error", message: "Error" });
          setAlertOpen(true);
        }
      })
      .catch((err) => console.error(err));
  };
  const handleOnPageChange = (newPage) => {
    setPaginationData((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleOnPageSizeChange = (newPageSize) => {
    setPaginationData((prev) => ({
      ...prev,
      pageSize: newPageSize,
    }));
  };

  const handleOnFilterChange = (value) => {
    setFilterString(
      value.items.length > 0
        ? value.items[0].value === undefined
          ? ""
          : value.items[0].value
        : value.quickFilterValues.join(" ")
    );
    setPaginationData({
      rows: [],
      loading: false,
      page: 0,
      pageSize: 100,
      total: 0,
    });
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
      <CustomModal
        open={modalSelectOpen}
        setOpen={setModalSelectOpen}
        title={modalSelectContent.title}
        message={modalSelectContent.message}
        buttons={modalSelectContent.buttons}
      />
      <ModalWrapper
        title="Student List"
        maxWidth={850}
        open={studentListOpen}
        setOpen={setStudentListOpen}
      >
        <Grid container>
          <Grid item xs={12} md={12} mt={2}>
            <TableContainer component={Paper}>
              <Table size="small" className={classes.table}>
                <TableHead>
                  <TableRow className={classes.bg}>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "left",
                      }}
                    >
                      Student Name
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      AUID
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      USN
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      Reporting Date
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      Year/Sem
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      Section
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentList.length > 0 ? (
                    studentList.map((val, i) => (
                      <TableRow key={i} style={{ height: 10 }}>
                        <TableCell sx={{ textAlign: "left" }}>
                          {val.student_name}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.auid}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.usn}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.reporting_date
                            ? moment(val.reporting_date).format("DD-MM-YYYY")
                            : ""}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {`${val.current_year}/${val.current_sem}` ?? ""}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.section_name}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <></>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </ModalWrapper>

      <ModalWrapper
        title="Student List"
        maxWidth={900}
        open={studentListOpen}
        setOpen={setStudentListOpen}
      >
        <Grid container>
          <Grid item xs={12} md={12} mt={2}>
            <TableContainer component={Paper}>
              <Table size="small" className={classes.table}>
                <TableHead>
                  <TableRow className={classes.bg}>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "left",
                      }}
                    >
                      Student Name
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      AUID
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      USN
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      Reporting Date
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      Year/Sem
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      Batch
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      Section
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentList.length > 0 ? (
                    studentList.map((val, i) => (
                      <TableRow key={i} style={{ height: 10 }}>
                        <TableCell sx={{ textAlign: "left" }}>
                          {val.student_name}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.auid}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.usn}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.reporting_date
                            ? moment(val.reporting_date).format("DD-MM-YYYY")
                            : "NA"}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {`${val.current_year}/${val.current_sem}`}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.concat_batch_name ?? "NA"}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.section_name ?? "NA"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <></>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </ModalWrapper>

      <Box>
        <FormWrapper>
          <Grid
            container
            justifyContent="flex-start"
            rowSpacing={2}
            columnSpacing={4}
          >
            <Grid item xs={12} md={2}>
              <CustomAutocomplete
                name="acYearId"
                value={values.acYearId}
                label="Academic Year"
                options={academicYearOptions}
                handleChangeAdvance={handleChangeAdvance}
                required
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <CustomAutocomplete
                name="school_Id"
                label="School"
                value={values.school_Id}
                options={schoolOptions}
                handleChangeAdvance={handleChangeAdvance}
                disabled={!values.acYearId}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <CustomAutocomplete
                name="programId"
                label="Program"
                options={programOptions}
                handleChangeAdvance={handleChangeAdvance}
                value={values.programId}
                disabled={!values.school_Id}
              />
            </Grid>
            {/* <Grid item xs={12} md={2}>
              <CustomAutocomplete
                name="yearSem"
                label="Year/Sem"
                value={values.yearSem}
                options={yearSemOptions}
                handleChangeAdvance={handleChangeAdvance}
                disabled={!values.programId}
              />
            </Grid> */}
            {/* Active/Inactive Toggle */}
            <Grid item xs={12} md={2} display="flex" alignItems="center">
              <CustomDatePicker
                name="classDate"
                label="Class Date"
                value={values.classDate}
                handleChangeAdvance={handleChangeAdvance}
                clearIcon={true}
              />
            </Grid>
            <Grid item xs={12} md={2} display="flex" justifyContent="center">
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  padding: "4px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  background: isActive ? "#d1e7dd" : "#f8d7da",
                  color: isActive ? "#0f5132" : "#842029",
                  minWidth: "100px",
                  height: "40px",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ marginRight: "8px", fontWeight: 500 }}
                >
                  {isActive ? "Active" : "Inactive"}
                </Typography>
                <Switch
                  checked={isActive}
                  onChange={() => setIsActive((prev) => !prev)}
                  inputProps={{ "aria-label": "Active/Inactive Toggle" }}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#198754",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#198754",
                    },
                    transform: "scale(0.9)",
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={2} textAlign="right">
              <Button
                onClick={handleSelectOpen}
                variant="contained"
                disableElevation
                sx={{
                  borderRadius: 2,
                }}
                startIcon={<AddIcon />}
              >
                Create
              </Button>
            </Grid>
            <Grid item xs={12} md={12}>
              {/* <GridIndex
                rows={rows}
                columns={columns}
                checkboxSelection
                onSelectionModelChange={(ids) => onSelectionModelChange(ids)}
              /> */}
              <GridIndex
                rows={paginationData.rows}
                columns={columns}
                checkboxSelection
                onRowSelectionModelChange={(ids) => onSelectionModelChange(ids)}
                rowCount={paginationData.total}
                page={paginationData.page}
                pageSize={paginationData.pageSize}
                handleOnPageChange={handleOnPageChange}
                handleOnPageSizeChange={handleOnPageSizeChange}
                loading={paginationData.loading}
                handleOnFilterChange={handleOnFilterChange}
                columnVisibilityModel={columnVisibilityModel}
                setColumnVisibilityModel={setColumnVisibilityModel}
              />
            </Grid>
          </Grid>
        </FormWrapper>
        <ModalWrapper
          maxWidth={800}
          open={employeeDetailsOpen}
          setOpen={setEmployeeDetailsOpen}
        >
          <Grid container rowSpacing={2} columnSpacing={2}>
            <Grid item xs={12} md={4}>
              <CustomAutocomplete
                name="employeeId"
                label="Employee"
                value={values.employeeId}
                options={employeeOptions}
                handleChangeAdvance={handleChangeAdvance}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomAutocomplete
                name="courseId"
                label="Course"
                value={values.courseId}
                options={courseOptions}
                handleChangeAdvance={handleChangeAdvance}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                sx={{ borderRadius: 2 }}
                onClick={handleSubmit}
              >
                SWAP
              </Button>
            </Grid>
          </Grid>
        </ModalWrapper>

        <ModalWrapper
          open={roomSwapOpen}
          setOpen={setRoomSwapOpen}
          maxWidth={800}
          title="Swap Room"
        >
          <Grid
            container
            justifyContent="flex-start"
            alignItems="center"
            rowSpacing={4}
            columnSpacing={2}
          >
            <Grid item xs={12} md={6}>
              <CustomAutocomplete
                name="roomId"
                label="Rooms"
                handleChangeAdvance={handleChangeAdvance}
                options={roomOptions}
                value={values.roomId}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                sx={{ borderRadius: 2 }}
                onClick={handleAssignRoom}
              >
                Assign
              </Button>
            </Grid>
          </Grid>
        </ModalWrapper>
      </Box>
    </>
  );
}
export default TimetableForSectionIndex;
