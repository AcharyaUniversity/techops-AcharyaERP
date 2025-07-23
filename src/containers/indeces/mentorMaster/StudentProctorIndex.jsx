import { React, useState, useEffect } from "react";
import GridIndex from "../../../components/GridIndex";
import { useLocation, useNavigate } from "react-router-dom";
import useAlert from "../../../hooks/useAlert";
import HistoryIcon from "@mui/icons-material/History";
import { Button, Box, IconButton, Grid, Typography, CircularProgress } from "@mui/material";
import CustomModal from "../../../components/CustomModal";
import axios from "../../../services/Api";
import Axios from "axios";
import ModalWrapper from "../../../components/ModalWrapper";
import CustomAutocomplete from "../../../components/Inputs/CustomAutocomplete";
import StudentHistory from "../../../pages/forms/mentorMaster/StudentHistory";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import TelegramIcon from "@mui/icons-material/Telegram";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CallIcon from '@mui/icons-material/Call';
import CustomTextField from "../../../components/Inputs/CustomTextField";
import CustomDatePicker from "../../../components/Inputs/CustomDatePicker";
import moment from "moment/moment";
import ManIcon from '@mui/icons-material/Man'; // Icon for Father
import WomanIcon from '@mui/icons-material/Woman'; // Icon for Mother
import SchoolIcon from '@mui/icons-material/School'; // Icon for Student
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from "@mui/icons-material/Mail";
import CustomSelect from "../../../components/Inputs/CustomSelect";
import EmailIcon from "@mui/icons-material/Email";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ForumIcon from "@mui/icons-material/Forum";

const initialValues = {
  proctorId: null,
  meetingAgenda: "",
  description: "",
  meetingDate: null,
};

const userId = JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.userId;
const roleId = JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.roleId;

const requiredFields = ["meetingAgenda", "description", "meetingDate"];

function StudentProctorIndex() {
  const setCrumbs = useBreadcrumbs();
  const location = useLocation();
  const state = location.state;
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    buttons: [],
  });
  const [confirmModal, setConfirmModal] = useState(false);
  const { setAlertMessage, setAlertOpen } = useAlert();
  const [modalOpen, setModalOpen] = useState(false);
  const [proctorIds, setProctorIds] = useState([]);
  const [proctorData, setProctorData] = useState([]);
  const [proctId, setProctId] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyEmailOpen, setHistoryEmailOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyEmailData, setHistoryEmailData] = useState([]);
  const [proctorOptions, setProctorOptions] = useState([]);
  const [values, setValues] = useState(initialValues);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [studentDetails, setStudentDetails] = useState([]);
  const [modalTelegramOpen, setModalTelegramOpen] = useState(false);
  const [modalIVROpen, setModalIVROpen] = useState(false);
  const [modalMailOpen, setModalMailOpen] = useState(false);
  const [mailData, setMailData] = useState([]);
  const [modalWhatsAppOpen, setModalWhatsAppOpen] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState([]);
  const [studentIds, setStudentIds] = useState([]);
  const [data, setData] = useState({});
  const [studentDetailsOptions, setStudentDetailsOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [proctor, setProctor] = useState({});


  useEffect(() => {
    getData();
    getProctorDetails();
    if (state?.userId) {
      // setCrumbs([{ name: "Mentor Master", link: "/ProctorEmployeeMaster/Proctor" }, { name: "My Mentee" }]);
      setCrumbs([{}])
    }
  }, []);

  const checks = {
    meetingAgenda: [values.meetingAgenda !== ""],
    description: [values.description !== ""],
  };

  const errorMessages = {
    meetingAgenda: ["This field is required"],
    description: ["This field is required"],
  };

  const getData = async () => {
    try {
      let response;

      if (state?.userId) {
        response = await axios.get(
          `/api/proctor/getProctorStatusAssignedStudentsByUserId/${state.userId}`
        );
      } else {
        response = await axios.get(
          `/api/proctor/getProctorStatusAssignedStudentDetailsListByUserId/${userId}`
        );
      }

      const rowId = response.data.data.map((obj, index) => ({
        ...obj,
        id: index + 1,
      }));
      setRows(rowId);
    } catch (err) {
      console.error(err);
    }
  };


  const getProctorDetails = async () => {
    await axios
      .get(`/api/employee/GetEmployeeNames`)
      .then((res) => {
        setProctorOptions(
          res.data.data.map((obj) => ({
            value: obj.emp_id,
            label: obj.employee_name,
          }))
        );
      })
      .catch((err) => console.error(err));
  };

  const handleChangeAdvance = (name, newValue) => {
    proctorData.map((val) => {
      proctId.push({
        proctor_assign_id: val.id,
        emp_id: newValue,
        school_id: val.school_id,
        student_id: val.student_id,
        active: true,
        proctor_status: 1,
      });
    });
    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAssign = async () => {
    const temp = [];
    proctorData.map((obj) => {
      temp.push({
        proctor_assign_id: obj.id,
        proctor_status: obj.proctor_status,
        // active: true,
        from_date: obj.from_date,
        to_date: obj.to_date,
        school_id: obj.school_id,
        student_id: obj.student_id,
        student_name: obj.student_name,
        emp_id: obj.emp_id,
      });
    });

    await axios
      .post(`/api/proctor/ProctorHeadHistory`, temp)
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          axios
            .put(`/api/proctor/ProctorStudentAssignment/${proctorIds}`, proctId)
            .then((res) => {
              setReassignOpen(false);
              getData();
              // window.location.reload();
              setAlertMessage({
                severity: "success",
                message: "Students Assigned",
              });
              setAlertOpen(true);
            })
            .catch((err) => {
              setReassignOpen(false);
              setAlertMessage({ severity: "error", message: "Error" });
              console.error(err);
            });
          setAlertOpen(true);
        }
      })
      .catch((err) => {
        setAlertMessage({ severity: "error", message: "Error" });
        console.error(err);
      });
    setAlertOpen(true);
  };

  // const handleHistory = async (params) => {
  //   setHistoryOpen(true);
  //   await axios
  //     .get(`/api/proctor/getAllStudentDetailsList/${params.row.emp_id}`)
  //     .then((res) => {
  //       setStudentDetails(res.data.data);
  //     })
  //     .catch((err) => console.error(err));
  // };
  const handleHistoryEmail = async (params) => {
    setHistoryEmailOpen(true);
    try {
      const response = await axios.get(`/api/proctor/getAllMailHistoryBasedOnMentor/${params.row.emp_id}`);
      const sortedData = response.data.data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setHistoryEmailData(sortedData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleHistory = async (params) => {
    setHistoryOpen(true);
    try {
      const response = await axios.get(`/api/getIvrCreationData/${params.row.student_id}`);
      const sortedData = response.data.data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setHistoryData(sortedData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTelegram = (params) => {
    setConfirmModal(true);

    const handleToggle = async () => {
      await axios
        .post(
          `/api/feedback/sendingSmsWithTelegramVerificationLink?application_no_npf=${params.row.application_no_npf}`
        )
        .then((res) => {
          if (res.status === 200 || res.status === 201) {
            setAlertMessage({
              severity: "success",
              message: "Telegram Verification Sent To Student",
            });
          } else {
            setAlertMessage({ severity: "error", message: "Error Occured" });
          }
          setAlertOpen(true);
        })
        .catch((err) => {
          setAlertMessage({
            severity: "error",
            message: err.response.data.message,
          });
          setAlertOpen(true);
        });
    };

    setModalContent({
      title: "Telegram Verification",
      message: "Are you sure you want to send telegram verification?",
      buttons: [
        { name: "Yes", color: "primary", func: handleToggle },
        { name: "No", color: "primary", func: () => { } },
      ],
    });
  };
  const handleIVRCall = (params) => {
    setModalIVROpen(true)
    setData(params?.row)
  };
  const handleMailCall = (params) => {
    setModalMailOpen(true)
    setMailData(params?.row)
  };

  const handleWhatsAppMessage = (params) => {
    setModalWhatsAppOpen(true)
    setWhatsAppData(params?.row)
  };

  const handleIVR = async (type) => {
    // setAlertMessage({ severity: "error", message: "This service is temporarily disabled" });
    // setAlertOpen(true);
    let custNumber = null;

    // Determine the customer number based on the type
    if (type === 'father') {
      custNumber = data?.father_mobile;
      console.log('Calling Father...');
    } else if (type === 'mother') {
      custNumber = data?.mother_mobile;
      console.log('Calling Mother...');
    } else if (type === 'student') {
      custNumber = data?.studentMobile;
      console.log('Calling Student...');
    }

    if (!custNumber) {
      console.error('Customer number is not available.');
      alert(`Cannot make a call. ${type} number is missing.`);
      return;
    }

    try {
      const response = await axios.get('/api/getCallOutbound', {
        params: {
          // exenumber: '9535252150',
          custnumber: custNumber,
          userId: userId
        },
      });
      if (response.status === 200 || response.status === 201) {
        setAlertMessage({
          severity: "success",
          message: `${type.charAt(0)?.toUpperCase() + type.slice(1)} is being called.`,
        });
      } else {
        setAlertMessage({ severity: "error", message: "Error Occured" });
      }
      setAlertOpen(true);
      setModalIVROpen(false)
    } catch (error) {
      console.error('Error fetching IVR details:', error);
    }
  };

  const handleFeedback = async (params) => {
    setValues((prev) => ({
      ...prev,
      "minutesOfMeeting": "",
    }));
    if (params?.row?.proctor_id) {
      setFeedbackOpen(true);
      setProctor(params?.row)
    } else {

    }
  };

  const columns = [
    {
      field: "student_name",
      headerName: "Name",
      flex: 1,
      renderCell: (params) => (
        <Typography
          variant="subtitle2"
          onClick={() =>
            navigate(`/student-profile/${params.row.student_id}`, { state: true })
          }
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "primary.main",
            textTransform: "capitalize",
            cursor: "pointer",
          }}
        >
          {params.value.toLowerCase()}
        </Typography>
      ),
    },
    { field: "auid", headerName: "AUID", flex: 1, minWidth: 120 },
    { field: "usn", headerName: "USN", flex: 1 },
    {
      field: "Year/sem",
      headerName: "Year/sem",
      flex: 1,
      renderCell: (params) => (
        <>{`${params?.row?.current_year} / ${params?.row?.current_sem}`}</>
      ),
    },
    { field: "reporting_date", headerName: "Reporting Date", flex: 1 },
    { field: "created_username", headerName: "Assigned By", flex: 1, hide: true },
    {
      field: "created_date",
      headerName: "Assigned Date",
      hide: true,
      flex: 1,
     // type: "date",
       valueGetter: (value, row) =>
        moment(row.created_date).format("DD-MM-YYYY"),
    },

    // {
    //   field: "Profile",
    //   type: "actions",
    //   flex: 1,
    //   headerName: "Profile",
    //   getActions: (params) => [
    //     params.row.proctor_status === 1 &&
    //     params.row.proctor_assign_status === 1 ? (
    //       <IconButton
    //         label="Profile"
    //         onClick={() =>
    //           navigate(`/student-profile/${params.row.student_id}`)
    //         }
    //       >
    //         <AccountBoxIcon />
    //       </IconButton>
    //     ) : (
    //       <IconButton label="Profile">
    //         <AccountBoxIcon />
    //       </IconButton>
    //     ),
    //   ],
    // },
    // {
    //   field: "History",
    //   type: "actions",
    //   flex: 1,
    //   headerName: "History",
    //   getActions: (params) => [
    //     <IconButton label="History" onClick={() => handleHistory(params)}>
    //       <HistoryIcon sx={{ color: "black" }} />
    //     </IconButton>,
    //   ],
    // },
    {
      field: "callCount",
      type: "action",
      flex: 1,
      headerName: "IVR History",
      renderCell: (params) => (
        <Typography
          variant="subtitle2"
            onClick={() => handleHistory(params)}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "primary.main",
            textTransform: "capitalize",
            cursor: "pointer",
          }}
        >
          {params.value}
        </Typography>
      )
    },
    {
      field: "emailHistory",
      type: "actions",
      flex: 1,
      headerName: "Email/WhatsApp History",
      getActions: (params) => [
        <IconButton label="History" onClick={() => handleHistoryEmail(params)}>
          <HistoryIcon sx={{ color: "black" }} />
        </IconButton>,
      ],
    },
    {
      field: "Email",
      type: "actions",
      flex: 1,
      headerName: "Email",
      getActions: (params) => [
        <IconButton
          label="Send Email"
          onClick={() => handleMailCall(params)}
        >
          <MailIcon sx={{ color: "#5d6d7e" }} />
        </IconButton>
      ],
    },
    {
      field: "IVR",
      type: "actions",
      flex: 1,
      headerName: "IVR",
      getActions: (params) => [
        <IconButton
          label="IVR Call"
          onClick={() => handleIVRCall(params)}
        >
          <CallIcon sx={{ color: "#0000FF" }} />
        </IconButton>
      ],
    },
    {
      field: "WhatsApp",
      type: "actions",
      flex: 1,
      headerName: "WhatsApp",
      getActions: (params) => [
        <IconButton
          label="WhatsApp"
          onClick={() => handleWhatsAppMessage(params)}
        >
          <WhatsAppIcon sx={{ color: "green" }} />
        </IconButton>
      ],
    },

  ];


  const callHistoryColumns = [
    {
      field: "studentName",
      headerName: "Name",
      flex: 1,
      renderCell: (params) => (
        <Typography
          variant="subtitle2"
          onClick={() =>
            navigate(`/student-profile/${params.row.student_id}`, { state: true })
          }
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "primary.main",
            textTransform: "capitalize",
            cursor: "pointer",
          }}
        >
          {params?.row?.studentName?.toLowerCase()}
        </Typography>
      ),
    },
    { field: "auid", headerName: "AUID", flex: 1, minWidth: 120 },
    { field: "usn", headerName: "USN", flex: 1 },
    { field: "callFrom", headerName: "Call From", flex: 1 },
    { field: "relationship", headerName: "Call To", flex: 1 },
    { field: "status", headerName: "status", flex: 1 },
    {
      field: "created_date",
      headerName: "Call Time",
      flex: 1,
      valueFormatter: (value) =>
        moment(value).format("DD-MM-YYYY HH:mm:ss"),
      renderCell: (params) =>
        moment(params.row.created_date).format("DD-MM-YYYY HH:mm:ss"),
    },
    { field: "customer", headerName: "Customer", flex: 1 },
    {
      field: "give feedback",
      type: "actions",
      flex: 1,
      headerName: "Call Summarize",
      getActions: (params) => {
        return [
          params?.row?.summarize ? (
            <span>{params?.row?.summarize}</span>
          ) : (
            <IconButton label="" onClick={() => handleFeedback(params)}>
              <ForumIcon />
            </IconButton>
          ),
        ];
      },
    },
    // {
    //   field: "recording",
    //   headerName: "Recording",
    //   flex: 1,
    //   minWidth: 300,
    //   renderCell: (params) => (
    //     <audio controls style={{ backgroundColor: 'transparent', border: 'none', width: '100%' }}>
    //       <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mp3" />
    //       Your browser does not support the audio element.
    //     </audio>
    //   ),
    // },
    {
      field: "recording",
      headerName: "Recording",
      flex: 1,
      minWidth: 300,
      renderCell: (params) => {
        const recordingUrl = params.row.recording;
        if (!recordingUrl) {
          return <span>No recording available</span>;
        }
        return (
          <audio
            controls
            controlsList="nodownload"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              width: '100%',
              pointerEvents: roleId === 3 ? 'none' : 'auto'
            }}
          >
            <source src={recordingUrl} type="audio/mp3" />
            <source src={recordingUrl} type="audio/ogg" />
            <source src={recordingUrl} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        );
      },
    }
  ];
  const emailHistoryColumns = [
    {
      field: "studentName",
      headerName: "Name",
      flex: 1,
      renderCell: (params) => (
        <Typography
          variant="subtitle2"
          onClick={() =>
            navigate(`/student-profile/${params.row.student_id}`, { state: true })
          }
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "primary.main",
            textTransform: "capitalize",
            cursor: "pointer",
          }}
        >
          {params?.row?.student_name?.toLowerCase()}
        </Typography>
      ),
    },
    { field: "auid", headerName: "AUID", flex: 1, minWidth: 120 },
    { field: "usn", headerName: "USN", flex: 1 },
    { field: "mode_of_contact", headerName: "Mode of Contact", flex: 1 },
    { field: "meeting_agenda", headerName: "Meeting Agenda", flex: 1 },
    { field: "feedback", headerName: "Feedback", flex: 1 },
    {
      field: "created_date",
      headerName: "Created Date",
      flex: 1,
      valueFormatter: (value) =>
        moment(value).format("DD-MM-YYYY HH:mm:ss"),
      renderCell: (params) =>
        moment(params.row.created_date).format("DD-MM-YYYY HH:mm:ss"),
    },
  ];


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

  const handleChangeOne = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleCreate = async (obj) => {
    console.log(obj, "obj");
    console.log(values, "values");
    console.log(mailData, "mailData");


    if (!requiredFieldsValid()) {
      setAlertMessage({
        severity: "error",
        message: "Please fill all required fields",
      });
      setAlertOpen(true);
    } else {
      setLoading(true);

      await axios
        .post(
          `/api/proctor/sendEmailMessageForMeeting/${mailData.student_id
          }/${userId}/${values.meetingAgenda}/${values.description}/${moment(
            values.meetingDate
          ).format("DD-MM-YYYY")}`
        )
        .then(async (res) => {
          if (res.status === 200 || res.status === 201) {
            const temp = {};
            temp.active = true;
            temp.school_id = 1;
            temp.user_id = userId;
            temp.date_of_meeting = values.meetingDate
              ? values.meetingDate.substr(0, 19) + "Z"
              : "";
            temp.meeting_agenda = values.meetingAgenda;
            temp.student_ids = [mailData.student_id];
            temp.description = values.description;
            temp.meeting_type = "Mentor To Student";
            temp.mode_of_contact = obj;

            await axios
              .post(`/api/proctor/saveProctorStudentMeeting`, temp)
              .then((res) => {
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

            setLoading(false);
            setAlertMessage({
              severity: "success",
              message: "Mail sent successfully",
            });
            getData();
            setModalMailOpen(false)
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
    setValues(initialValues);
  };

  const handleWhatsAppCreate = async () => {
    console.log(values, "values");
    console.log(whatsAppData, "WhatsAppData");


    if (!requiredFieldsValid()) {
      setAlertMessage({
        severity: "error",
        message: "Please fill all required fields",
      });
      setAlertOpen(true);
    } else {
      setLoading(true);

      await axios
        .post(
          `/api/proctor/sendWhatsAppMessageForMeeting/${whatsAppData.student_id
          }/${userId}/${values.meetingAgenda}/${values.description}/${moment(
            values.meetingDate
          ).format("DD-MM-YYYY")}`
        )
        .then(async (res) => {
          if (res.status === 200 || res.status === 201) {
            const temp = {};
            temp.active = true;
            temp.school_id = 1;
            temp.user_id = userId;
            temp.date_of_meeting = values.meetingDate
              ? values.meetingDate.substr(0, 19) + "Z"
              : "";
            temp.meeting_agenda = values.meetingAgenda;
            temp.student_ids = [whatsAppData.student_id];
            temp.description = values.description;
            temp.meeting_type = "Mentor To Student";
            temp.mode_of_contact = "WhatsApp";

            await axios
              .post(`/api/proctor/saveProctorStudentMeeting`, temp)
              .then((res) => {
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

            setLoading(false);
            setAlertMessage({
              severity: "success",
              message: "WhatsApp message sent successfully",
            });
            getData();
            setModalWhatsAppOpen(false)
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
    setValues(initialValues);
  };

  const handleCreateCall = async () => {
    if (!values?.minutesOfMeeting) {
      setAlertMessage({
        severity: "error",
        message: "Please fill all required fields",
      });
      setAlertOpen(true);
      return
    }
    const temp = {};
    temp.ivr_creation_id = proctor?.ivr_creation_id;
    temp.summarize = values?.minutesOfMeeting;

    await axios
      .put(
        `/api/updateIvrCreation/${proctor?.ivr_creation_id}`,
        temp
      )
    await axios
      .get(`/api/getIvrCreationData/${proctor.student_id}`)
      .then((res) => {
        setHistoryData(res.data.data);
        if (res.status === 200 || res.status === 201) {
          setAlertMessage({ severity: "success", message: "Call summarize updated" });
          setAlertOpen(true);
          setFeedbackOpen(false);
        }
      })
      .catch((err) => {
        setAlertMessage({
          severity: "error",
          message: err.response
            ? err.response.data.message
            : "An error occured",
        });
        setAlertOpen(true);
      });
  };
  const handleSubmit = (params) => {
    setModalContent({
      title: "",
      message: `Are you sure you want to call to ${params}?`,
      buttons: [
        { name: "Yes", color: "primary", func: () => handleIVR(params) },
        { name: "No", color: "primary", func: () => { } },
      ],
    });

    setConfirmModal(true);
  };

  return (
    <>
      <Box sx={{ position: "relative", mt: 2 }}>
        <CustomModal
          open={confirmModal}
          setOpen={setConfirmModal}
          title={modalContent.title}
          message={modalContent.message}
          buttons={modalContent.buttons}
        />

        <ModalWrapper
          open={reassignOpen}
          setOpen={setReassignOpen}
          maxWidth={700}
          title="Re-Assign Mentor"
        >
          <Grid
            container
            alignItems="left"
            justifyContent="flex-start"
            rowSpacing={4}
            columnSpacing={{ xs: 2, md: 4 }}
          >
            <Grid item xs={12} md={6}>
              <CustomAutocomplete
                name="proctorId"
                value={values.proctorId}
                label="Mentor"
                options={proctorOptions}
                handleChangeAdvance={handleChangeAdvance}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                style={{ borderRadius: 7 }}
                variant="contained"
                color="primary"
                onClick={handleAssign}
              >
                Assign
              </Button>
            </Grid>
          </Grid>
        </ModalWrapper>

        <ModalWrapper open={historyOpen} setOpen={setHistoryOpen}
          title={`History`}
        >
          <GridIndex rows={historyData} columns={callHistoryColumns} getRowId={row => row?.ivr_creation_id} />
          {/* <StudentHistory studentDetails={studentDetails} /> */}
        </ModalWrapper>
        <ModalWrapper open={historyEmailOpen} setOpen={setHistoryEmailOpen}
          title={`Eamil History`}
        >
          <GridIndex rows={historyEmailData} columns={emailHistoryColumns} />
        </ModalWrapper>
        <ModalWrapper
          title="Telegram"
          maxWidth={800}
          open={modalTelegramOpen}
          setOpen={setModalTelegramOpen}
        >
          <Grid
            container
            justifyContent="flex-start"
            alignItems="center"
            rowSpacing={2}
            columnSpacing={2}
          >
            <Grid item xs={12} md={4}>
              <CustomTextField
                multiline
                name="meetingAgenda"
                label="Agenda of meeting"
                value={values.meetingAgenda}
                handleChange={handleChange}
                checks={checks.meetingAgenda}
                errors={errorMessages.meetingAgenda}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomTextField
                name="description"
                label="Description"
                value={values.description}
                handleChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4} mt={2}>
              <CustomDatePicker
                name="meetingDate"
                label="Date of Meeting"
                value={values.meetingDate}
                handleChangeAdvance={handleChangeAdvance}
              />
            </Grid>
            <Grid item xs={12} align="right">
              {/* <Button
                variant="contained"
                onClick={handleSendTelegram}
                sx={{ borderRadius: 2 }}
                startIcon={<TelegramIcon />}
              >
                Send
              </Button> */}
            </Grid>
          </Grid>
        </ModalWrapper>
        <ModalWrapper
          title={`IVR - ${data?.student_name || "Unknown Student"}`}
          maxWidth={800}
          open={modalIVROpen}
          setOpen={setModalIVROpen}
        >
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            rowSpacing={3}
            columnSpacing={4}
            sx={{
              padding: 3,
              background: "#f9f9f9",
              borderRadius: 4,
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Header for Instructions */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{
                  textAlign: "center",
                  color: "#444",
                  fontWeight: 600,
                  marginBottom: 2,
                  fontSize: "1.1rem",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                "Please select the person you wish to speak with by pressing the corresponding number."
              </Typography>
            </Grid>

            {/* Call Options */}
            <Grid item xs={12}>
              <Grid
                container
                justifyContent="space-between"
                alignItems="center"
                spacing={3}
              >
                {/* Student Section */}
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      textAlign: "center",
                      background: "#F3E5F5",
                      borderRadius: 4,
                      padding: 2,
                      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 36, color: "#6A1B9A" }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, marginY: 1 }}>
                      {data?.student_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      Mobile:{" "}
                      {data?.studentMobile?.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2")}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => handleSubmit("student")}
                      sx={{
                        background: "#6A1B9A",
                        color: "#fff",
                        marginTop: 1,
                        "&:hover": {
                          background: "#4A148C",
                        },
                      }}
                    >
                      Call Student
                    </Button>
                  </Box>
                </Grid>

                {/* Father Section */}
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      textAlign: "center",
                      background: "#E3F2FD",
                      borderRadius: 4,
                      padding: 2,
                      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <ManIcon sx={{ fontSize: 36, color: "#1976D2" }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, marginY: 1 }}>
                      {data?.fatherName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      Mobile:{" "}
                      {data?.father_mobile?.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2")}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => handleSubmit("father")}
                      sx={{
                        background: "#1976D2",
                        color: "#fff",
                        marginTop: 1,
                        "&:hover": {
                          background: "#0D47A1",
                        },
                      }}
                    >
                      Call Father
                    </Button>
                  </Box>
                </Grid>

                {/* Mother Section */}
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      textAlign: "center",
                      background: "#FFEBEE",
                      borderRadius: 4,
                      padding: 2,
                      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <WomanIcon sx={{ fontSize: 36, color: "#D32F2F" }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, marginY: 1 }}>
                      {data?.motherName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      Mobile:{" "}
                      {data?.mother_mobile?.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2")}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => handleSubmit("mother")}
                      sx={{
                        background: "#D32F2F",
                        color: "#fff",
                        marginTop: 1,
                        "&:hover": {
                          background: "#B71C1C",
                        },
                      }}
                    >
                      Call Mother
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </ModalWrapper>

        <ModalWrapper
          title={`Mail`}
          maxWidth={800}
          open={modalMailOpen}
          setOpen={setModalMailOpen}
        >
          <Grid
            container
            justifyContent="flex-start"
            alignItems="center"
            rowSpacing={2}
            columnSpacing={2}
          >
            <Grid item xs={12} md={4}>
              <CustomSelect
                multiline
                name="meetingAgenda"
                label="Agenda of meeting"
                value={values.meetingAgenda}
                handleChange={handleChangeOne}
                items={[
                  {
                    label: "IA marks review",
                    value: "IA marks review",
                  },
                  {
                    label: "Attendence review",
                    value: "Attendence review",
                  },
                  {
                    label: "Discipline matter",
                    value: "Discipline matter",
                  },
                  {
                    label: "Academic Issues",
                    value: "Academic Issues",
                  },
                  {
                    label: "Leave Issues",
                    value: "Leave Issues",
                  },
                  {
                    label: "Fee due",
                    value: "Fee due",
                  },
                  {
                    label: "Monthly meeting",
                    value: "Monthly meeting",
                  },
                  {
                    label: "Others",
                    value: "Others",
                  },
                ]}
                checks={checks.meetingAgenda}
                errors={errorMessages.meetingAgenda}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomTextField
                multiline
                rows={2}
                name="description"
                label="Description"
                value={values.description}
                handleChange={handleChangeOne}
                checks={checks.description}
                errors={errorMessages.description}
                required
              />
            </Grid>
            <Grid item xs={12} md={4} mt={2.4}>
              <CustomDatePicker
                name="meetingDate"
                label="Date of Meeting"
                value={values.meetingDate}
                handleChangeAdvance={handleChangeAdvance}
                disablePast
                required
              />
            </Grid>


            <Grid item xs={12} align="right">
              <Button
                variant="contained"
                onClick={() => handleCreate("Mail")}
                sx={{ borderRadius: 2 }}
                disabled={loading}
                endIcon={<EmailIcon />}
              >
                {loading ? (
                  <CircularProgress
                    size={25}
                    color="blue"
                    style={{ margin: "2px 13px" }}
                  />
                ) : (
                  <strong>{"Send"}</strong>
                )}
              </Button>
              {/* <Button
                variant="contained"
                onClick={handleSendTelegram}
                sx={{ borderRadius: 2, marginLeft: 2 }}
                disabled={loading}
                endIcon={<TelegramIcon />}
              >
                Send
                {loading ? (
                  <CircularProgress
                    size={25}
                    color="blue"
                    style={{ margin: "2px 13px" }}
                  />
                ) : (
                  <strong>{"Send"}</strong>
                )}
              </Button> */}
            </Grid>
          </Grid>
        </ModalWrapper>

         <ModalWrapper
          title={`WhatsApp`}
          maxWidth={800}
          open={modalWhatsAppOpen}
          setOpen={setModalWhatsAppOpen}
        >
          <Grid
            container
            justifyContent="flex-start"
            alignItems="center"
            rowSpacing={2}
            columnSpacing={2}
          >
            <Grid item xs={12} md={4}>
              <CustomSelect
                multiline
                name="meetingAgenda"
                label="Agenda of meeting"
                value={values.meetingAgenda}
                handleChange={handleChangeOne}
                items={[
                  {
                    label: "IA marks review",
                    value: "IA marks review",
                  },
                  {
                    label: "Attendence review",
                    value: "Attendence review",
                  },
                  {
                    label: "Discipline matter",
                    value: "Discipline matter",
                  },
                  {
                    label: "Academic Issues",
                    value: "Academic Issues",
                  },
                  {
                    label: "Leave Issues",
                    value: "Leave Issues",
                  },
                  {
                    label: "Fee due",
                    value: "Fee due",
                  },
                  {
                    label: "Monthly meeting",
                    value: "Monthly meeting",
                  },
                  {
                    label: "Others",
                    value: "Others",
                  },
                ]}
                checks={checks.meetingAgenda}
                errors={errorMessages.meetingAgenda}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomTextField
                multiline
                rows={2}
                name="description"
                label="Description"
                value={values.description}
                handleChange={handleChangeOne}
                checks={checks.description}
                errors={errorMessages.description}
                required
              />
            </Grid>
            <Grid item xs={12} md={4} mt={2.4}>
              <CustomDatePicker
                name="meetingDate"
                label="Date of Meeting"
                value={values.meetingDate}
                handleChangeAdvance={handleChangeAdvance}
                disablePast
                required
              />
            </Grid>


            <Grid item xs={12} align="right">
              <Button
                variant="contained"
                onClick={() => handleWhatsAppCreate()}
                sx={{ borderRadius: 2 }}
                disabled={loading}
                endIcon={<WhatsAppIcon />}
              >
                {loading ? (
                  <CircularProgress
                    size={25}
                    color="blue"
                    style={{ margin: "2px 13px" }}
                  />
                ) : (
                  <strong>{"Send"}</strong>
                )}
              </Button>
            </Grid>
          </Grid>
        </ModalWrapper>

        <ModalWrapper
          title="Call Summarize"
          maxWidth={800}
          open={feedbackOpen}
          setOpen={setFeedbackOpen}
        >
          <Grid
            container
            justifyContent="flex-start"
            alignItems="center"
            rowSpacing={2}
            columnSpacing={2}
            marginTop={2}
          >
            <Grid item xs={12} md={8}>
              <CustomTextField
                multiline
                rows={2}
                name="minutesOfMeeting"
                label="Minutes of meeting / Call output"
                value={values.minutesOfMeeting}
                handleChange={handleChange}
                checks={checks.minutesOfMeeting}
                errors={errorMessages.minutesOfMeeting}
              />
            </Grid>
            <Grid item xs={12} align="right">
              <Button
                variant="contained"
                onClick={handleCreateCall}
                sx={{ borderRadius: 2 }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </ModalWrapper>

        <GridIndex rows={rows} columns={columns} />
      </Box>
    </>
  );
}
export default StudentProctorIndex;
