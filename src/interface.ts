import type { Tensor } from "onnxruntime-node";

/**
 * Controls verbose output and image dumps for debugging.
 */
export interface DebuggingOptions {
  /**
   * Enable detailed logging of each processing step.
   * @default false
   */
  verbose?: boolean;

  /**
   * Save intermediate image data to disk for inspection.
   * @default false
   */
  debug?: boolean;

  /**
   * Directory where debug images will be written.
   * Relative to the current working directory.
   * @default "out"
   */
  debugFolder?: string;
}

/**
 * Parameters for the text detection preprocessing and filtering stage.
 */
export interface DetectionOptions {
  /**
   * Face detection threshold 0-1, face detected below the threshold will be treated as no face
   * @default 0.5
   */
  threshold?: number;

  /**
   * Add x percentage face detection result padding/expansion
   * @default 0
   */
  paddingPercentage?: number;
}

/**
 * Parameters for the face verification preprocessing stage.
 */
export interface VerificationOptions {
  /**
   * Algorithm for finding the distance of the embeddings
   * @default "cosine"
   */
  distanceMetric?: "cosine" | "euclidean" | "euclideanL2" | "angular";

  /**
   * Cosine algorithm threshold value
   * @default 0.30
   */
  cosine?: number;

  /**
   * Euclidean algorithm threshold value
   * @default 23.56
   */
  euclidean?: number;

  /**
   * EuclideanL2 algorithm threshold value
   * @default 1.04
   */
  euclideanL2?: number;

  /**
   * Angular algorithm threshold value
   * @default 0.35
   */
  angular?: number;
}


/**
 * Full configuration for the Face service.
 */
export interface FaceServiceOptions {
  /**
   * Controls parameters for face detection.
   */
  detection?: DetectionOptions;

  /**
   * Controls parameters for face verification.
   */
  verification?: VerificationOptions;

  /**
   * Controls logging and image dump behavior for debugging.
   */
  debugging?: DebuggingOptions;

}

/**
 * Simple rectangle representation.
 */
export interface Box {
  /** X-coordinate of the top-left corner. */
  x: number;
  /** Y-coordinate of the top-left corner. */
  y: number;
  /** Width of the box in pixels. */
  width: number;
  /** Height of the box in pixels. */
  height: number;
}

/**
 * The common part of the value metadata type for both tensor and non-tensor values.
 */
export interface ValueMetadataBase {
  /**
   * The name of the specified input or output.
   */
  readonly name: string;
}

/**
 * Represents the metadata of a tensor value.
 */
export interface TensorValueMetadata extends ValueMetadataBase {
  /**
   * Get a value indicating whether the value is a tensor.
   */
  readonly isTensor: true;
  /**
   * Get the data type of the tensor.
   */
  readonly type: Tensor.Type;
  /**
   * Get the shape of the tensor.
   *
   * If the shape is not defined, the value will an empty array. Otherwise, it will be an array representing the shape
   * of the tensor. Each element in the array can be a number or a string. If the element is a number, it represents
   * the corresponding dimension size. If the element is a string, it represents a symbolic dimension.
   */
  readonly shape: ReadonlyArray<number | string>;
}
