import * as ort from "onnxruntime-node";

import { DEFAULT_FACE_SERVICE_OPTIONS, DEFAULT_INFERENCE } from "./constants";
import type { FaceServiceOptions } from "./interface";

import merge from "lodash.merge";
import { YoloDetectionInference } from "ppu-yolo-onnx-inference";
import { Detector } from "./detector.service";
import { Utils } from "./utils.service";
import { Verifier } from "./verifier.service";

const GITHUB_BASE_URL =
  "https://raw.githubusercontent.com/PT-Perkasa-Pilar-Utama/ppu-face-recognition/main/models/";

export class FaceService {
  private options: FaceServiceOptions = DEFAULT_FACE_SERVICE_OPTIONS;

  private detectorSession: YoloDetectionInference | null = null;
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
      this.detectorSession = new YoloDetectionInference({
        model: {
          onnx: detectorBuffer,
          classNames: DEFAULT_INFERENCE.YOLO_CLASSNAMES,
        },
      });

      await this.detectorSession.init();
      this.utils.log(`Face Detector Inference loaded successfully`);

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
    if (!this.isInitialized()) {
      throw new Error("FaceService is not initialized. Call initialize() first.");
    }

    try {
      const detector = new Detector(
        this.detectorSession!,
        this.embedderSession!,
        this.options.detection,
        this.options.debugging,
      );
      
      const { embedding1, embedding2, face1, face2 } = await detector.run(img1, img2);

      if (!embedding1 || !embedding2) {
        return {
          match: false,
          distance: -1,
          threshold: -1,
          face1,
          face2,
          error: "Face not detected in one or both images",
        };
      }

      const verifier = new Verifier(
        this.options.verification,
        this.options.debugging,
      );
      
      const result = verifier.run(embedding1, embedding2);

      return {
        match: result.match,
        distance: Number(result.distance.toFixed(6)),
        threshold: result.threshold,
        face1,
        face2,
      };
    } catch (error) {
      this.utils.log(`Verification failed: ${error}`);
      throw error;
    }
  }

  /**
   * Update the service options on the fly.
   * This allows changing detection, verification, or debugging parameters
   * without re-initializing the heavy ONNX sessions.
   */
  public updateOptions(options: Partial<FaceServiceOptions>): void {
    this.options = this.utils.mergeOptions(this.options, options);
    this.utils.log("FaceService options updated");
  }

  /**
   * Releases the onnx runtime session for both
   * detection and embedding model.
   */
  public async destroy(): Promise<void> {
    this.utils.log("Releasing ONNX sessions...");
    await this.detectorSession?.destroy();
    await this.embedderSession?.release();

    this.detectorSession = null;
    this.embedderSession = null;
  }
}
