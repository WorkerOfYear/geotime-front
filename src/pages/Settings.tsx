import React, { useEffect, useState } from "react";
import Item from "../components/Item";
import SettingList from "../components/SettingList";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { witsSlice } from "../store/reducers/WitsSlice";
import { setWits } from "../store/reducers/actions/ActionCreators";
import { IWits } from "../types/IWits";
import { reportApi, witsSocket } from "../services/ReportService";

const Settings = () => {
  const [witsSettings, setWitsSettings] = useState<IWits>({
    host: "",
    port: "",
    depth: "",
    lag_depth: "",
    well_diam: "",
  });

  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.witsReducer.data);

  useEffect(() => {
    setWitsSettings(data);
  }, [data]);

  const handleHostOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    setWitsSettings({ ...witsSettings, host: e.currentTarget.value });
  };

  const handlePortOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    setWitsSettings({ ...witsSettings, port: e.currentTarget.value });
  };

  const handleDepthOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    setWitsSettings({ ...witsSettings, depth: e.currentTarget.value });
  };

  const handleLagDepthOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    setWitsSettings({ ...witsSettings, lag_depth: e.currentTarget.value });
  };

  const handleWellDiamOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    setWitsSettings({ ...witsSettings, well_diam: e.currentTarget.value });
  };

  const handleSubmitBtn = () => {
    dispatch(setWits(witsSettings)).then((data) => {
      if (data) {
        dispatch(witsSlice.actions.setWits(witsSettings));
      }
    });
  };

  const [socketState, setSocketState] = useState(witsSocket ? witsSocket.readyState : WebSocket.CLOSED);

  useEffect(() => {
    const handleSocketStateChange = () => {
      setSocketState(witsSocket.readyState);
    };

    if (witsSocket) {
      witsSocket.addEventListener("open", handleSocketStateChange);
      witsSocket.addEventListener("close", handleSocketStateChange);
      witsSocket.addEventListener("error", handleSocketStateChange);
    }

    return () => {
      if (witsSocket) {
        witsSocket.removeEventListener("open", handleSocketStateChange);
        witsSocket.removeEventListener("close", handleSocketStateChange);
        witsSocket.removeEventListener("error", handleSocketStateChange);
      }
    };
  }, [witsSocket]);

  const handleCheckWits = () => {
    if (socketState === WebSocket.CLOSED) {
      console.log("Open wits ws");
      dispatch(reportApi.util.resetApiState());
      dispatch(witsSlice.actions.setStream(true));
    } else {
      console.log("Close wits ws");
      witsSocket.close();
    }
  };

  return (
    <div className={"settings"} style={{ width: 700 }}>
      <div className="settings__header" style={{ position: "relative" }}>
        <Item
          value={witsSettings.host}
          onChange={handleHostOnChange}
          label={"IP адрес источника WITS"}
          placeholder={"94.41.125.130"}
        />
        <Item
          value={witsSettings.port}
          onChange={handlePortOnChange}
          label={"Порт источника WITS"}
          placeholder={"12001"}
        />
        <button
          onClick={handleCheckWits}
          style={{ position: "absolute", left: 530 }}
          className="button button--accent"
        >
          {socketState === WebSocket.OPEN ? "Остановить проверку" : "Начать проверку"}
        </button>
      </div>
      <div className="settings__sub-header">
        <div className="setting__sub-item sub-item">
          <Item
            value={witsSettings.depth}
            onChange={handleDepthOnChange}
            className={"sub-item__input"}
            placeholder={"0108"}
          />
          <div className="sub-item__text">Номер параметра “Глубина,м”</div>
        </div>
        <div className="setting__sub-item sub-item">
          <Item
            value={witsSettings.lag_depth}
            onChange={handleLagDepthOnChange}
            className={"sub-item__input"}
            placeholder={"1108"}
          />
          <div className="sub-item__text">Номер параметра “Глуб.шлама,м”</div>
        </div>
        <div className="setting__sub-item sub-item">
          <Item
            value={witsSettings.well_diam}
            onChange={handleWellDiamOnChange}
            className={"sub-item__input"}
            placeholder={"0844"}
          />
          <div className="sub-item__text">Номер параметра “Диам.скв.,м”</div>
        </div>
      </div>
      <div className="settings__list">
        <Link className="settings__link button" to="/">
          На главную
        </Link>
        <SettingList onSubmit={handleSubmitBtn} />
      </div>
    </div>
  );
};

export default Settings;
