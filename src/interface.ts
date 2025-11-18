import type { Tensor } from "onnxruntime-node";

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
