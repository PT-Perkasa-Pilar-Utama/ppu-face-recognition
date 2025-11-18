import * as ort from "onnxruntime-node";
import type { TensorValueMetadata } from "./src/interface";

const INPUT_SHAPE = [1, 160, 160, 3];
const OUTPUT_SHAPE = [1, 512];

const model = Bun.file("models/facenet512.onnx");
const buffer = await model.arrayBuffer();

const session = await ort.InferenceSession.create(new Uint8Array(buffer));

console.log({
  inputNames: session.inputNames,
  outputNames: session.outputNames,
  inputMetadata: JSON.stringify(session.inputMetadata),
  outputMetadata: JSON.stringify(session.outputMetadata),
});

// {
//   inputNames: [ "input" ],
//   outputNames: [ "Bottleneck_BatchNorm" ],
//   inputMetadata: "[{\"name\":\"input\",\"isTensor\":true,\"type\":\"float32\",\"shape\":[1,160,160,3]}]",
//   outputMetadata: "[{\"name\":\"Bottleneck_BatchNorm\",\"isTensor\":true,\"type\":\"float32\",\"shape\":[1,512]}]",
// }

const modelInputShape = (
  session.inputMetadata[0] as TensorValueMetadata
).shape.slice(2) as [number, number];

const modelMetadata = {
  inputTensorName: session.inputNames[0],
  outputTensorName: session.outputNames[0],
  inputShape: modelInputShape.length === 2 ? modelInputShape : INPUT_SHAPE,
};
