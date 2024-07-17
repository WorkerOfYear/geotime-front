import React, { ReactNode, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { getWitsData } from "../store/reducers/actions/ActionCreators";
import { witsSlice } from "../store/reducers/WitsSlice";
import { closeSockets, witsSocket } from "../services/ReportService";
import { isValidCamera } from "../utils/validate";
import { cameraSlice } from "../store/reducers/CameraSlice";
import { jobSlice } from "../store/reducers/JobSlice";

type Props = {
  children?: ReactNode;
};

const MainLayout = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const jobReducer = useAppSelector((state) => state.jobReducer);
  const witsReducer = useAppSelector((state) => state.witsReducer);
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnload = () => {
      console.log("unload");
      if (!jobReducer.jobState) {
        console.log("closing socket");
        closeSockets();
      }
      if (
        !witsReducer.stream &&
        witsSocket &&
        (witsSocket.readyState === witsSocket.CONNECTING || witsSocket.readyState === witsSocket.OPEN)
      ) {
        console.log("closing socket");
        witsSocket.close();
      }
    };
    window.addEventListener("unload", handleUnload);
    return () => {
      window.removeEventListener("unload", handleUnload);
    };
  }, []);

  useEffect(() => {
    if (!jobReducer.jobState) {
      console.log("closing socket");
      closeSockets();
    }
    if (
      !witsReducer.stream &&
      witsSocket &&
      (witsSocket.readyState === witsSocket.CONNECTING || witsSocket.readyState === witsSocket.OPEN)
    ) {
      console.log("closing socket");
      witsSocket.close();
    }
  }, [navigate]);

  useEffect(() => {
    if (!witsReducer.initialised) {
      dispatch(getWitsData()).then((data) => {
        if (data?.data) {
          dispatch(witsSlice.actions.setWits(data.data));
          dispatch(witsSlice.actions.setInitialised(true));
          console.log("Wits initialised");
        }
      });
    }
  }, []);

  useEffect(() => {
    const keys = ["camera1", "camera2", "camera3"];

    keys.forEach((key) => {
      const item = localStorage.getItem(key);

      if (item) {
        try {
          const parsedItem: unknown = JSON.parse(item);

          if (isValidCamera(parsedItem)) {
            console.log(`Key ${key} is valid.`);
            console.log(parsedItem);
            if (key === "camera1") {
              dispatch(cameraSlice.actions.setCamera1(parsedItem));
              dispatch(jobSlice.actions.setCamera1Id(parsedItem.id))
            } else if (key === "camera2") {
              dispatch(cameraSlice.actions.setCamera2(parsedItem));
              dispatch(jobSlice.actions.setCamera2Id(parsedItem.id))
            } else if (key === "camera3") {
              dispatch(cameraSlice.actions.setCamera3(parsedItem));
              dispatch(jobSlice.actions.setCamera3Id(parsedItem.id))
            }
          } else {
            console.log(`Key ${key} is invalid, removing from localStorage.`);
            localStorage.removeItem(key);
          }
        } catch (error) {
          console.log(`Error parsing ${key}, removing from localStorage.`);
          localStorage.removeItem(key);
        }
      }
    });
  }, []);

  return (
    <div className={"main"}>
      <Outlet />
      {children}
    </div>
  );
};

export default MainLayout;
