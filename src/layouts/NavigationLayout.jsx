import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import BreadcrumbsProvider from "../contexts/BreadcrumbsContextProvider";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import axios from "../services/Api";

let jwtTokenFuncIntervalId;

function NavigationLayout() {
  const [modules, setModules] = useState({});
  const [activeModule, setActiveModule] = useState("");
  const [menuOpen, setMenuOpen] = useState("");
  const [staffDetail, setStaffDetail] = useState("");
  const [activeSubMenu, setActiveSubMenu] = useState("");
  const [accesiblePaths, setAccesiblePaths] = useState([]);
  const [isAuthUser, setIsAuthUser] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  // const [userId, setUserId] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  let userId = JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.userId;

  // if there is no userId in local storage, navigate the user to login page
  useEffect(() => {
    if (!JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.token)
      navigate("/Login");
  }, [userId]);

  // call all GET functions and construct the modules object consisting of all navigation data
  useEffect(() => {
    Promise.all([
      getSubMenuFromUser(),
      getRoleIds().then((roleIds) => getSubMenuFromRoles(roleIds)),
    ])
      .then((values) => {
        const subMenuIds = `${values[0]},`.concat(values[1]);
        getStaffDetailsData();
        getAllDetails(subMenuIds).then((allDetails) => {
          const paths = [];
          allDetails?.forEach((obj) => {
            if (!obj.mask) {
              paths.push(obj.submenu_url.toLowerCase());
              const modName = obj.module_name.toLowerCase();

              setActiveModule((prev) => (prev ? prev : modName));

              setModules((prev) => ({
                ...prev,
                [modName]: {
                  ...prev[modName],
                  [obj.menu_name]: prev[modName]
                    ? {
                        ...prev[modName][obj.menu_name],
                        iconName: obj.menu_icon_name,
                        [obj.submenu_name]: obj.submenu_url,
                      }
                    : {
                        iconName: obj.menu_icon_name,
                        [obj.submenu_name]: obj.submenu_url,
                      },
                },
              }));
            }
          });
          setAccesiblePaths(paths);
          setIsAuthUser(true);
          setIsLoading(false);
        });
      })
      .catch((err) => {
        setIsLoading(false);
        if (
          err.response &&
          err.response.data &&
          err.response.data.message === "JWT Token has expired" &&
          err.response.data.status === 500
        ) {
          sessionStorage.setItem("AcharyaErpUser", JSON.stringify(null));
          navigate("/Login");
        }
      });

    // Every 5 minute the interval will run
    jwtTokenFuncIntervalId = setInterval(() => {
      const isTokenExpired = checkJwtTokenExpiry();

      if (isTokenExpired) {
        sessionStorage.setItem("AcharyaErpUser", JSON.stringify(null));
        navigate("/Login");
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(jwtTokenFuncIntervalId);
  }, []);

  // Function To check jwt token is expired or not
  const checkJwtTokenExpiry = () => {
    try {
      const userToken = sessionStorage.getItem("AcharyaErpUser");
      if (userToken === undefined || userToken === null) return true;

      const token = JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.token;
      if (token === null || token === undefined) return true;

      // Check expiry timestamp is greater than current time
      const jwtPayload = JSON.parse(window.atob(token.split(".")[1]));

      const timeNow = new Date().getTime();
      if (jwtPayload.exp * 1000 < timeNow) return true;

      return false;
    } catch (error) {
      return true;
    }
  };

  // set active module and submenu using location pathname and open appropriate menu
  useEffect(() => {
    const isTokenExpired = checkJwtTokenExpiry();
    if (isTokenExpired) {
      sessionStorage.setItem("AcharyaErpUser", JSON.stringify(null));
      navigate("/Login");
      return;
    }

    if (accesiblePaths.length <= 0) return;

    const allowedPaths = [
      "/dashboard",
      "/facultydetails",
      "/schedulermaster",
      "/employeedetailsview",
    ];
    let path = location.pathname.slice(1);
    // const masterRoute = `/${path.split("/")[0].toLocaleLowerCase()}`;
    // if (
    //   !allowedPaths.includes(masterRoute) &&
    //   !accesiblePaths.find((str) => str.includes(masterRoute))
    // ) {
    //   sessionStorage.setItem("AcharyaErpUser", JSON.stringify(null));
    //   navigate("/Login");
    //   return;
    // }

    if (path.indexOf("/") !== -1) path = `/${path.slice(0, path.indexOf("/"))}`;
    else path = `/${path}`;

    if (modules)
      Object.keys(modules).forEach((mod) => {
        Object.keys(modules[mod]).forEach((menu) => {
          Object.keys(modules[mod][menu]).forEach((subMenu) => {
            if (path === modules[mod][menu][subMenu]) {
              setActiveModule(mod);
              setActiveSubMenu(subMenu);
              setMenuOpen(menu);
            }
          });
        });
      });
  }, [location, modules, accesiblePaths]);

  useEffect(() => {
    const allowedPaths = ["/Dashboard", "/", "/Login"];
    // If the current path is in allowedPaths, skip the referrer check
    if (allowedPaths.includes(location.pathname)) {
      return;
    }
    const referrer = document.referrer;
    if (!referrer) {
      sessionStorage.setItem("AcharyaErpUser", null);
      sessionStorage.setItem("empId", null);
      sessionStorage.setItem("usertype", null);
      navigate("/Login");
    }
  }, [navigate, location.pathname]);

  const getSubMenuFromUser = () => {
    return new Promise(async (resolve, reject) => {
      axios(`/api/getSubMenuDetails/${userId}`)
        .then((res) => {
          const subMenusFromUser = res.data.data.SubMenuList.map(
            (obj) => obj.submenu_id
          );
          resolve(subMenusFromUser ? subMenusFromUser.toString() : "");
        })
        .catch((err) => {
           const statusCode = err.response?.status;
            if (statusCode === 401) {
                sessionStorage.setItem("AcharyaErpUser", null);
                sessionStorage.setItem("empId", null);
                sessionStorage.setItem("usertype", null);
                navigate("/Login");
            }
              reject(err);
        });
    });
  };
  const getRoleIds = async () => {
    return new Promise(async (resolve, reject) => {
      await axios(`/api/findRoles/${userId}`)
        .then((res) => {
          const roleIds = res.data.data.map((obj) => obj.role_id);
          resolve(roleIds.length > 0 ? roleIds.toString() : 0);
        })
        .catch((err) => {
          const statusCode = err.response?.status;
            if (statusCode === 401) {
                sessionStorage.setItem("AcharyaErpUser", null);
                sessionStorage.setItem("empId", null);
                sessionStorage.setItem("usertype", null);
                navigate("/Login");
            }
          
          reject(err);
        });
    });
  };

  const getSubMenuFromRoles = async (roleIds) => {
    let subMenusFromRoles = "";

    await axios(`/api/fetchSubMenuDetailsOnRoleId/${roleIds}`)
      .then((res) => {
        subMenusFromRoles = subMenusFromRoles.concat(
          res.data.data?.map((obj) => obj.submenu_ids)
        );
      })
      .catch((err) => console.error(err));

    return subMenusFromRoles !== "undefined" ? subMenusFromRoles : "";
  };
  const getAllDetails = async (subMenuIds) => {
    let allDetails;

    await axios(`/api/allDetails/${subMenuIds}`)
      .then((res) => (allDetails = res.data.data))
      .catch((err) => console.error(err));

    return allDetails;
  };
  const [photo, setPhoto] = useState();

  const getStaffDetailsData = async () => {
    try {
      const { data: response } = await axios(
        `/api/getUserDetailsById/${userId}`
      );
      const responseData = response.data;
      const { empOrStdId, usertype, photoAttachmentPath } = responseData;

      sessionStorage.setItem("empId", empOrStdId);
      sessionStorage.setItem("usertype", usertype);
      sessionStorage.setItem("photo", photoAttachmentPath);
      setStaffDetail(responseData);
      if (responseData) {
        let url = `/api/employee/employeeDetailsFileDownload?fileName=${photoAttachmentPath}`;
        if (usertype === "Student") {
          url = `/api/student/studentImageDownload?student_image_attachment_path=${photoAttachmentPath}`;
        }
        const photoResponse = await axios.get(url, {
          responseType: "blob",
        });
        setPhoto(photoResponse.data);
      }
    } catch (err) {}
  };

  return (
    <>
      {
        <Header
          moduleList={Object.keys(modules)}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          staffDetail={staffDetail}
          photo={photo}
        />
      }
      <div style={{ display: "flex" }}>
        <div style={{ width: 73 }}>
          <Sidebar
            menus={modules[activeModule.trim()]}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            activeSubMenu={activeSubMenu}
          />
        </div>

        <div style={{ width: "100%", padding: "73px 31px 0 0" }}>
          {/* {isLoading ? <h3>Loading...</h3>
          :<>
          {isAuthUser ?  */}
          <BreadcrumbsProvider>
            <Outlet />
          </BreadcrumbsProvider>
          {/* : <PermissionDenied />}</>
          }  */}
        </div>
      </div>
    </>
  );
}

export default NavigationLayout;

const PermissionDenied = () => {
  return <h1>Permission Denied</h1>;
};
