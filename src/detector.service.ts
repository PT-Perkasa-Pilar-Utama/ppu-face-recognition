import * as ort from "onnxruntime-node";
import { CanvasToolkit, createCanvas, loadImage, type Canvas } from "ppu-ocv";
import type {
  DetectedObject,
  YoloDetectionInference,
} from "ppu-yolo-onnx-inference";
import {
  DEFAULT_DEBUGGING_OPTIONS,
  DEFAULT_DETECTION_OPTIONS,
  DEFAULT_INFERENCE,
} from "./constants";
import type { Box, DebuggingOptions, DetectionOptions } from "./interface";

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
   * FaceNet512 expects: (pixel - 127.5) / 128.0 which maps [0, 255] to approximately [-1, 1]
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

        // FaceNet normalization: (pixel - mean) / std
        // mean = 127.5, std = 128.0
        tensor[pixelIndex] = (imageData[rgbaIndex]! - 127.5) / 128.0;
        tensor[height * width + pixelIndex] =
          (imageData[rgbaIndex + 1]! - 127.5) / 128.0;
        tensor[2 * height * width + pixelIndex] =
          (imageData[rgbaIndex + 2]! - 127.5) / 128.0;
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

  /**
   * Crop the face from the image and resize to model input shape
   */
  private cropAndResize(image: Canvas | any, box: Box): Canvas {
    this.log(
      `Cropping and resizing face with box: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`,
    );

    const targetWidth = DEFAULT_INFERENCE.INPUT_SHAPE[1]!;
    const targetHeight = DEFAULT_INFERENCE.INPUT_SHAPE[2]!;

    const canvas = createCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext("2d");

    // Draw the cropped face onto the new canvas, resizing it
    ctx.drawImage(
      image,
      box.x,
      box.y,
      box.width,
      box.height,
      0,
      0,
      targetWidth,
      targetHeight,
    );

    return canvas;
  }

  /**
   * Extends the face bounding box by a percentage.
   * Matches DeepFace's logic:
   * expanded_w = w + int(w * expand_percentage / 100)
   * expanded_h = h + int(h * expand_percentage / 100)
   * x = max(0, x - int((expanded_w - w) / 2))
   * y = max(0, y - int((expanded_h - h) / 2))
   */
  private extendFaceArea(
    box: Box,
    imageWidth: number,
    imageHeight: number,
  ): Box {
    const { paddingPercentage } = this.options;
    if (!paddingPercentage || paddingPercentage <= 0) {
      return box;
    }

    this.log(
      `Extending face area with padding percentage: ${paddingPercentage}`,
    );

    const w = box.width;
    const h = box.height;

    // Calculate expanded dimensions
    const expandedW = w + Math.floor((w * paddingPercentage) / 100);
    const expandedH = h + Math.floor((h * paddingPercentage) / 100);

    // Calculate new top-left coordinates to center the expansion
    let x = Math.max(0, box.x - Math.floor((expandedW - w) / 2));
    let y = Math.max(0, box.y - Math.floor((expandedH - h) / 2));

    // Ensure we don't go out of bounds
    const finalW = Math.min(imageWidth - x, expandedW);
    const finalH = Math.min(imageHeight - y, expandedH);

    return {
      x,
      y,
      width: finalW,
      height: finalH,
    };
  }

  /**
   * Extract embeddings from a processed face image
   */
  private async extractEmbeddings(faceCanvas: Canvas): Promise<Float32Array> {
    this.log(`Extracting embeddings from face canvas...`);
    const tensor = this.preprocessImageEmbeddings(faceCanvas);

    const feeds: Record<string, ort.Tensor> = {};
    const inputName = this.embedder.inputNames[0]!;

    feeds[inputName] = new ort.Tensor(
      "float32",
      tensor,
      DEFAULT_INFERENCE.INPUT_SHAPE,
    );

    const output = await this.embedder.run(feeds);
    const outputName = this.embedder.outputNames[0]!;
    const outputTensor = output[outputName]!;

    return this.postprocessImageEmbeddings(outputTensor.data as Float32Array);
  }

  private preprocessImageEmbeddings(canvas: Canvas): Float32Array {
    const tensor = this.canvasToTensor(
      canvas,
      DEFAULT_INFERENCE.INPUT_SHAPE[1]!,
      DEFAULT_INFERENCE.INPUT_SHAPE[2]!,
    );

    this.log(
      `Tensor shape: [${DEFAULT_INFERENCE.INPUT_SHAPE.join(", ")}], length: ${tensor.length}`,
    );

    this.log(
      `Tensor sample values (first 5): [${Array.from(tensor.slice(0, 5))
        .map((v) => v.toFixed(4))
        .join(", ")}]`,
    );
    return tensor;
  }

  private postprocessImageEmbeddings(data: Float32Array): Float32Array {
    // Return raw embeddings (no normalization)
    // This allows "euclidean" to match Python DeepFace's raw euclidean distance.
    // "euclideanL2", "cosine", and "angular" will handle normalization internally in Verifier.
    this.log(`Post-processing embeddings (Raw)...`);
    return data;
  }

  /**
   * Run the detection and embedding extraction pipeline
   */
  async run(
    img1: ArrayBuffer,
    img2: ArrayBuffer,
  ): Promise<{
    embedding1?: Float32Array;
    embedding2?: Float32Array;
    face1?: Box;
    face2?: Box;
  }> {
    this.log(
      `Starting face detection and embedding extraction for two images...`,
    );

    const [result1, result2] = await Promise.all([
      this.processImage(img1),
      this.processImage(img2),
    ]);

    return {
      embedding1: result1?.embedding,
      embedding2: result2?.embedding,
      face1: result1?.box,
      face2: result2?.box,
    };
  }

  private async processImage(
    imgBuffer: ArrayBuffer,
  ): Promise<{ embedding: Float32Array; box: Box } | undefined> {
    const detections = await this.detector.detect(imgBuffer);
    this.log(`Detected ${detections.length} face(s)`);
    if (!detections.length) {
      this.log(`No faces detected in image`);
      return undefined;
    }

    const filteredDetections = detections.filter(
      (d) => d.confidence >= (this.options.threshold || 0.5),
    );

    if (filteredDetections.length === 0) {
      this.log(`No faces above confidence threshold ${this.options.threshold}`);
      return undefined;
    }

    let bestFace = filteredDetections[0]!;
    this.log(`Found ${filteredDetections.length} face(s) above threshold`);
    if (filteredDetections.length > 1) {
      this.log(
        "[WARN] More than one face detected, picking highest confidence.",
      );
      bestFace = this.getMostConfident(filteredDetections);
    }

    this.log(`Best face confidence: ${bestFace.confidence.toFixed(4)}`);

    const image = await loadImage(imgBuffer);
    this.log(`Image loaded: ${image.width}x${image.height}`);

    const box: Box = {
      x: bestFace.box.x,
      y: bestFace.box.y,
      width: bestFace.box.width,
      height: bestFace.box.height,
    };

    const extendedBox = this.extendFaceArea(box, image.width, image.height);
    const faceCanvas = this.cropAndResize(image, extendedBox);

    if (this.debugging.debug) {
      this.log(`Saving debug image of processed face...`);
      const toolkit = CanvasToolkit.getInstance();
      const timestamp = Date.now();

      toolkit.saveImage({
        canvas: faceCanvas,
        filename: `processed_face_${timestamp}`,
        path: this.debugging.debugFolder || "out",
      });
    }

    const embedding = await this.extractEmbeddings(faceCanvas);

    return { embedding, box: extendedBox };
  }

  private getMostConfident(objs: DetectedObject[]): DetectedObject {
    let maxObj = objs[0]!;

    for (let i = 1; i < objs.length; i++) {
      if (objs[i]!.confidence > maxObj.confidence) {
        maxObj = objs[i]!;
      }
    }

    return maxObj;
  }
}
