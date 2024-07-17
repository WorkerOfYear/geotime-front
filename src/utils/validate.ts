import { ICamera, ICoords, IData, IDetection } from "../types/ICamera";

export function checkCamera(obj: any): obj is ICamera {
  return (
    (typeof obj === "object" && obj.id === null) ||
    (typeof obj.id === "string" &&
      Array.isArray(obj.type) &&
      obj.type.length > 0 &&
      obj.type.every((t: any) => t === "calibration" || t === "streaming") &&
      validateData(obj.data) &&
      validateDetection(obj.detection))
  );
}

function validateData(data: any): data is IData {
  return (
    typeof data === "object" &&
    typeof data.url === "string" &&
    typeof data.volume === "string" &&
    typeof data.sensitivity === "string"
  );
}

function validateDetection(detection: any): detection is IDetection {
  return (
    typeof detection === "object" &&
    validateCoords(detection.A) &&
    validateCoords(detection.B) &&
    validateCoords(detection.C) &&
    validateCoords(detection.D)
  );
}

function validateCoords(coords: any): coords is ICoords {
  return typeof coords === "object" && typeof coords.x === "string" && typeof coords.y === "string";
}


const isValidCoords = (coords: unknown): coords is ICoords => {
  if (typeof coords !== 'object' || coords === null) {
    return false;
  }

  const coordinates = coords as ICoords;
  return typeof coordinates.x === 'string' && typeof coordinates.y === 'string';
};


export const isValidCamera = (obj: unknown): obj is ICamera => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const camera = obj as ICamera;

  return (
    (camera.id === null || typeof camera.id === 'string') &&
    Array.isArray(camera.type) &&
    camera.type.every((type) => type === 'calibration' || type === 'streaming') &&
    typeof camera.data === 'object' &&
    camera.data !== null &&
    typeof camera.data.url === 'string' &&
    typeof camera.data.volume === 'string' &&
    typeof camera.data.sensitivity === 'string' &&
    typeof camera.detection === 'object' &&
    camera.detection !== null &&
    isValidCoords(camera.detection.A) &&
    isValidCoords(camera.detection.B) &&
    isValidCoords(camera.detection.C) &&
    isValidCoords(camera.detection.D)
  );
};