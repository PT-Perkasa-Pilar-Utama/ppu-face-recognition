import * as ort from "onnxruntime-node";
import { CanvasToolkit, ImageProcessor, type Canvas } from "ppu-ocv";
import { YoloDetectionInference } from "ppu-yolo-onnx-inference";
import { DEFAULT_INFERENCE } from "./src/constants";
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

console.log(modelMetadata);

/**
 * Convert an image to a normalized tensor for model input
 */
function canvasToTensor(
  canvas: Canvas,
  width: number,
  height: number,
): Float32Array {
  const tensor = new Float32Array(INPUT_SHAPE[3]! * height * width);
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

const image = Bun.file("assets/image.png");
const image2 = Bun.file("assets/image2.png");
const image3 = Bun.file("assets/image3.png");

const arrayBuffer = await image.arrayBuffer();
const arrayBuffer2 = await image2.arrayBuffer();
const arrayBuffer3 = await image3.arrayBuffer();

const yoloModel = Bun.file("models/yolov11n-face.onnx");
const yoloModelBuffer = await yoloModel.arrayBuffer();

const faceModel = new YoloDetectionInference({
  model: {
    onnx: yoloModelBuffer,
    classNames: [...DEFAULT_INFERENCE.YOLO_CLASSNAMES],
  },
});

await faceModel.init();

const target = arrayBuffer3;
const faceDetection = await faceModel.detect(target);
console.log(faceDetection);

if (faceDetection.length) {
  const { x, y, width, height } = faceDetection[0]?.box!;

  const image1canvas = await ImageProcessor.prepareCanvas(target);
  const image1ctx = image1canvas.getContext("2d");

  const toolkit = CanvasToolkit.getInstance();

  toolkit.drawLine({
    ctx: image1ctx,
    x,
    y,
    width,
    height,
    lineWidth: 2,
    color: "red",
  });

  toolkit.saveImage({
    canvas: image1canvas,
    filename: "detection",
    path: "out",
  });
}

const no_facial_area = {
  x: null,
  y: null,
  w: null,
  h: null,
  left_eye: null,
  right_eye: null,
};
