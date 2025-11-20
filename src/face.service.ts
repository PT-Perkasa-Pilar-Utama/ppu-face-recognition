import * as ort from "onnxruntime-node";

import { DEFAULT_FACE_SERVICE_OPTIONS } from "./constants";
import type { FaceServiceOptions } from "./interface";

import merge from "lodash.merge";
import { Detector } from "./detector.service";
import { Utils } from "./utils.service";
import { Verifier } from "./verifier.service";

const GITHUB_BASE_URL =
  "https://raw.githubusercontent.com/PT-Perkasa-Pilar-Utama/ppu-face-recognition/main/models/";

export class FaceService {
  private options: FaceServiceOptions = DEFAULT_FACE_SERVICE_OPTIONS;

  private detectorSession: ort.InferenceSession | null = null;
  private embedderSession: ort.InferenceSession | null = null;

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
      this.embedderSession = await ort.InferenceSession.create(
        new Uint8Array(verifierBuffer),
        this.options.session!,
      );
      this.utils.log(
        `Face Embedder ONNX model loaded successfully\n\tinput: ${this.embedderSession.inputNames}\n\toutput: ${this.embedderSession.outputNames}`,
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
    return this.detectorSession !== null && this.embedderSession !== null;
  }

  async verify(img1: ArrayBuffer, img2: ArrayBuffer) {
    try {
      const detector = new Detector(
        this.detectorSession!,
        this.embedderSession!,
        this.options.detection,
        this.options.debugging,
      );
      const embeddings = await detector.run(img1, img2);

      const verifier = new Verifier(
        this.options.verification,
        this.options.debugging,
      );
      const distance = verifier.run(embeddings);

      const result = {};
      // np.round(distance, 6)
    } catch (error) {
      return {};
    }
  }

  /**
   * Releases the onnx runtime session for both
   * detection and embedding model.
   */
  public async destroy(): Promise<void> {
    await this.detectorSession?.release();
    await this.embedderSession?.release();

    this.detectorSession = null;
    this.embedderSession = null;
  }
}
