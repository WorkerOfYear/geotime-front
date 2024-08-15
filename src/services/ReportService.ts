import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { IReport } from "../types/IReport";
import { jobSlice } from "../store/reducers/JobSlice";
import { witsSlice } from "../store/reducers/WitsSlice";

export let camera1Socket: WebSocket;

function getCameraSocket(cameras_status: { camera_1: boolean; camera_2: boolean; camera_3: boolean }) {
  camera1Socket = new WebSocket(
    String(import.meta.env.VITE_BASE_WS_URL) +
      String(import.meta.env.VITE_WS_CAMERA_DATA) +
      `?camera1=${cameras_status.camera_1}&camera2=${cameras_status.camera_2}&camera3=${cameras_status.camera_3}`
  );
  return camera1Socket;
}

export let resSocket: WebSocket;
function getResSocket() {
  resSocket = new WebSocket(
    String(import.meta.env.VITE_BASE_WS_URL) + String(import.meta.env.VITE_WS_RES_DATA)
  );
  return resSocket;
}

export function closeSockets() {
  if (camera1Socket && camera1Socket.readyState === camera1Socket.OPEN) camera1Socket.close();
  if (resSocket && resSocket.readyState === resSocket.OPEN) resSocket.close();
}

export let witsSocket: WebSocket;
function getWitsSocket() {
  witsSocket = new WebSocket(
    String(import.meta.env.VITE_BASE_WS_URL) + String(import.meta.env.VITE_WS_WITS_DATA)
  );
  return witsSocket;
}

export const reportApi = createApi({
  reducerPath: "reportApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  endpoints: (builder) => ({
    getReportMessages: builder.query<IReport[], { camera_1: boolean; camera_2: boolean; camera_3: boolean }>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        cameras_status,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        const ws = getCameraSocket(cameras_status);
        if (!ws) return;

        let listener: any;
        try {
          await cacheDataLoaded;
          ws.onopen = (message: Event) => console.log("Ws open");
          ws.onerror = (err: Event) => console.error(err);
          ws.onclose = (message: CloseEvent) => {
            console.log("Ws closed");
            dispatch(jobSlice.actions.setJobState(false));
          };
          listener = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log(data);
            updateCachedData((draft) => {
              draft.unshift(data);
              dispatch(jobSlice.actions.addCameraReports({ id: 1, report: data }));
              dispatch(jobSlice.actions.addResReport(data));
            });
          };
          ws.addEventListener("message", listener);
        } catch {}
        await cacheEntryRemoved;
        ws.removeEventListener("message", listener);
      },
    }),

    getResReportMessages: builder.query<IReport[], any>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }) {
        const ws = getResSocket();
        let listener: any;
        try {
          await cacheDataLoaded;
          ws.onopen = (message: Event) => console.log("Ws open");
          ws.onerror = (err: Event) => console.error(err);
          ws.onclose = (message: CloseEvent) => {
            console.log("Ws closed");
            dispatch(jobSlice.actions.setJobState(false));
          };

          listener = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log(data);
            updateCachedData((draft) => {
              draft.unshift(data);
            });
          };
          ws.addEventListener("message", listener);
        } catch {}
        await cacheEntryRemoved;
        ws.removeEventListener("message", listener);
      },
    }),

    getWitsMessages: builder.query<Array<string>, any>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }) {
        const ws = getWitsSocket();
        let listener: any = () => {};
        try {
          await cacheDataLoaded;
          ws.onopen = (message: Event) => {
            console.log("Ws open");
          };
          ws.onclose = (message: CloseEvent) => {
            console.log("Ws closed");
            dispatch(witsSlice.actions.setStream(false));
          };
          ws.onerror = (err: Event) => {
            console.error(err);
          };
          listener = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log(data);
            updateCachedData((draft) => {
              draft.unshift(JSON.stringify(data));
            });
          };
          ws.addEventListener("message", listener);
        } catch {}
        await cacheEntryRemoved;
        ws.removeEventListener("message", listener);
      },
    }),
  }),
});
