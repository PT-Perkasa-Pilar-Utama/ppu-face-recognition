import * as ort from "onnxruntime-node";
import {
  DEFAULT_DEBUGGING_OPTIONS,
  DEFAULT_DETECTION_OPTIONS,
} from "./constants";
import type { DebuggingOptions, DetectionOptions } from "./interface";

export class Detector {
  private options: DetectionOptions;

  private readonly debugging: DebuggingOptions;
  private readonly detector: ort.InferenceSession;
  private readonly embedder: ort.InferenceSession;

  /**
   * Creates an instance of FaceService.
   * @param options - Configuration options for the service.
   */
  public constructor(
    detector: ort.InferenceSession,
    embedder: ort.InferenceSession,
    options: Partial<DetectionOptions> = {},
    debugging: Partial<DebuggingOptions> = {},
  ) {
    this.detector = detector;
    this.embedder = embedder;

    this.options = {
      ...DEFAULT_DETECTION_OPTIONS,
      ...options,
    };

    this.debugging = {
      ...DEFAULT_DEBUGGING_OPTIONS,
      ...debugging,
    };
  }

  /**
   * Logs a message if verbose debugging is enabled
   */
  private log(message: string): void {
    if (this.debugging.verbose) {
      console.log(`[DetectionService] ${message}`);
    }
  }

  private extractFace() {}

  private extractEmbeddings() {}

  async run() {}
}
