export { Detector } from "./detector.service";
export { FaceService, type FaceServiceResult } from "./face.service";
export { Utils } from "./utils.service";
export { Verifier } from "./verifier.service";

export type {
  Box,
  DebuggingOptions,
  DetectionOptions,
  FaceServiceOptions,
  TensorValueMetadata,
  ValueMetadataBase,
  VerificationOptions,
} from "./interface";

export {
  DEFAULT_DEBUGGING_OPTIONS,
  DEFAULT_DETECTION_OPTIONS,
  DEFAULT_FACE_SERVICE_OPTIONS,
  DEFAULT_INFERENCE,
  DEFAULT_VERIFICATION_OPTIONS,
} from "./constants";
