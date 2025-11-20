import * as ort from "onnxruntime-node";

import { DEFAULT_FACE_SERVICE_OPTIONS } from "./constants";
import type { FaceServiceOptions } from "./interface";

import merge from "lodash.merge";
import { Utils } from "./utils.service";

const GITHUB_BASE_URL =
  "https://raw.githubusercontent.com/PT-Perkasa-Pilar-Utama/ppu-face-recognition/main/models/";

export class FaceService {
  private options: FaceServiceOptions = DEFAULT_FACE_SERVICE_OPTIONS;

  private detectorSession: ort.InferenceSession | null = null;
  private verifierReSession: ort.InferenceSession | null = null;

  private utils: Utils;

  /**
   * Creates an instance of FaceService.
   * @param options - Configuration options for the service.
   */
  public constructor(options?: FaceServiceOptions) {
    this.options = merge({}, DEFAULT_FACE_SERVICE_OPTIONS, options);
    this.options.session =
      this.options.session || DEFAULT_FACE_SERVICE_OPTIONS.session;

    this.utils = new Utils(this.options.debugging);
  }

  /**
   * Initializes the OCR service by loading models and dictionary.
   * This method must be called before any OCR operations.
   */
  public async initialize(): Promise<void> {
    try {
      this.utils.log("Initializing FaceService...");

      const detectorBuffer = await this.utils.loadResource(
        undefined,
        `${GITHUB_BASE_URL}yolov11n-face.onnx`,
      );
      this.detectorSession = await ort.InferenceSession.create(
        new Uint8Array(detectorBuffer),
        this.options.session!,
      );

      this.utils.log(
        `Face Detector ONNX model loaded successfully\n\tinput: ${this.detectorSession.inputNames}\n\toutput: ${this.detectorSession.outputNames}`,
      );

      const verifierBuffer = await this.utils.loadResource(
        undefined,
        `${GITHUB_BASE_URL}facenet512.onnx`,
      );
      this.verifierReSession = await ort.InferenceSession.create(
        new Uint8Array(verifierBuffer),
        this.options.session!,
      );
      this.utils.log(
        `Face Verifier ONNX model loaded successfully\n\tinput: ${this.verifierReSession.inputNames}\n\toutput: ${this.verifierReSession.outputNames}`,
      );
    } catch (error) {
      console.error("Failed to initialize FaceService:", error);
      throw error;
    }
  }

  /**
   * Checks if the service has been initialized with models loaded.
   */
  public isInitialized(): boolean {
    return this.detectorSession !== null && this.verifierReSession !== null;
  }

  async verify(img1: ArrayBuffer, img2: ArrayBuffer) {}

  private getEmbeddings() {}

  private getDistance() {}

  private calculateResult() {
    // np.round(distance, 6)
  }
}
