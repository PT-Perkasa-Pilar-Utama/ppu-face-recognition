import type { DebuggingOptions } from "ppu-yolo-onnx-inference";
import type {
    DetectionOptions,
    FaceServiceOptions,
    SessionOptions,
    VerificationOptions,
} from "./interface";

export const DEFAULT_INFERENCE = {
  INPUT_SHAPE: [1, 160, 160, 3],
  OUTPUT_SHAPE: [1, 512],
  YOLO_CLASSNAMES: ["face"],
};

export const DEFAULT_DEBUGGING_OPTIONS: DebuggingOptions = {
  verbose: false,
  debug: false,
  debugFolder: "out",
};

export const DEFAULT_DETECTION_OPTIONS: DetectionOptions = {
  threshold: 0.5,
  paddingPercentage: 0,
};

export const DEFAULT_VERIFICATION_OPTIONS: VerificationOptions = {
  distanceMetric: "cosine",
  cosine: 0.3,
  euclidean: 23.56,
  euclideanL2: 1.04,
  angular: 0.35,
};

export const DEFAULT_SESSION_OPTIONS: SessionOptions = {
  executionProviders: ["cpu"],
  graphOptimizationLevel: "all",
  enableCpuMemArena: true,
  enableMemPattern: true,
  executionMode: "sequential",
  interOpNumThreads: 0,
  intraOpNumThreads: 0,
};

export const DEFAULT_FACE_SERVICE_OPTIONS: FaceServiceOptions = {
  detection: DEFAULT_DETECTION_OPTIONS,
  verification: DEFAULT_VERIFICATION_OPTIONS,
  debugging: DEFAULT_DEBUGGING_OPTIONS,
  session: DEFAULT_SESSION_OPTIONS,
};
