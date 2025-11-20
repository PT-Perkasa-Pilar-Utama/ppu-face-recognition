import * as ort from "onnxruntime-node";
import { createCanvas, type Canvas } from "ppu-ocv";
import type { YoloDetectionInference } from "ppu-yolo-onnx-inference";
import {
  DEFAULT_DEBUGGING_OPTIONS,
  DEFAULT_DETECTION_OPTIONS,
  DEFAULT_INFERENCE,
} from "./constants";
import type { DebuggingOptions, DetectionOptions } from "./interface";

export class Detector {
  private options: DetectionOptions;

  private readonly debugging: DebuggingOptions;
  private readonly detector: YoloDetectionInference;
  private readonly embedder: ort.InferenceSession;

  /**
   * Creates an instance of FaceService.
   * @param options - Configuration options for the service.
   */
  public constructor(
    detector: YoloDetectionInference,
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

  /**
   * Convert a canvas image to a normalized tensor for model input
   */
  private canvasToTensor(
    canvas: Canvas,
    width: number,
    height: number,
  ): Float32Array {
    const tensor = new Float32Array(
      DEFAULT_INFERENCE.INPUT_SHAPE[3]! * height * width,
    );
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, width, height).data;

    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        const pixelIndex = h * width + w;
        const rgbaIndex = pixelIndex * 4;

        tensor[pixelIndex] = imageData[rgbaIndex]! / 255.0;
        tensor[height * width + pixelIndex] = imageData[rgbaIndex + 1]! / 255.0;
        tensor[2 * height * width + pixelIndex] =
          imageData[rgbaIndex + 2]! / 255.0;
      }
    }

    return tensor;
  }

  /**
   * Convert a tensor to a canvas for visualization and processing
   */
  private tensorToCanvas(
    tensor: Float32Array,
    width: number,
    height: number,
  ): Canvas {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const mapIndex = y * width + x;
        const probability = tensor[mapIndex] || 0;
        const grayValue = Math.round(probability * 255);

        const pixelIdx = (y * width + x) * 4;
        data[pixelIdx] = grayValue; // R
        data[pixelIdx + 1] = grayValue; // G
        data[pixelIdx + 2] = grayValue; // B
        data[pixelIdx + 3] = 255; // A
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  private extractFace(img1: ArrayBuffer, img2: ArrayBuffer) {
    // log warning if face is more than one face detected in one image, we will pick the highest confidence
  }

  private extractEmbeddings() {}

  async run() {}
}
