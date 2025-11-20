import { file } from "bun";
import { describe, expect, mock, test } from "bun:test";
import { DEFAULT_DEBUGGING_OPTIONS, DEFAULT_DETECTION_OPTIONS } from "../src/constants";
import { Detector } from "../src/detector.service";

describe("Detector Unit Tests", () => {
  // Mock YOLO Detector
  const mockBox = { x: 20, y: 20, width: 50, height: 50 };
  const mockYolo = {
    detect: mock(async () => [{
      box: mockBox,
      className: "face",
      classId: 0,
      confidence: 0.99
    }])
  };

  // Mock ONNX Session
  const mockEmbedder = {
    run: mock(async () => ({
      "output": {
        data: new Float32Array(512).fill(0.1),
        dims: [1, 512],
        type: "float32"
      }
    })),
    inputNames: ["input"],
    outputNames: ["output"]
  };

  test("run should call detector and embedder", async () => {
    const detector = new Detector(
      mockYolo as any,
      mockEmbedder as any,
      DEFAULT_DETECTION_OPTIONS,
      DEFAULT_DEBUGGING_OPTIONS
    );

    // Use a real image file for the buffer
    const imgBuffer = await file("assets/image-kevin1.png").arrayBuffer();
    
    const result = await detector.run(imgBuffer, imgBuffer);
    
    expect(mockYolo.detect).toHaveBeenCalled();
    expect(mockEmbedder.run).toHaveBeenCalled();
    
    expect(result.face1).toEqual(mockBox);
    expect(result.embedding1).toBeDefined();
    expect(result.embedding1?.length).toBe(512);
  });

  test("should apply padding correctly", async () => {
    const padding = 20; // 20%
    const detector = new Detector(
      mockYolo as any,
      mockEmbedder as any,
      { ...DEFAULT_DETECTION_OPTIONS, paddingPercentage: padding },
      DEFAULT_DEBUGGING_OPTIONS
    );

    const imgBuffer = await file("assets/image-kevin1.png").arrayBuffer();
    const result = await detector.run(imgBuffer, imgBuffer);
    
    const face = result.face1!;
    
    // Original: 50. New should be 50 + 20% = 60.
    expect(face.width).toBe(60);
    expect(face.height).toBe(60);
    
    // Original X: 20. New X should be 20 - (60-50)/2 = 15.
    expect(face.x).toBe(15);
    expect(face.y).toBe(15);
  });

  test("should handle no faces detected", async () => {
    const mockYoloEmpty = {
      detect: mock(async () => [])
    };
    
    const detector = new Detector(
      mockYoloEmpty as any,
      mockEmbedder as any,
      DEFAULT_DETECTION_OPTIONS,
      DEFAULT_DEBUGGING_OPTIONS
    );

    const imgBuffer = await file("assets/image-kevin1.png").arrayBuffer();
    const result = await detector.run(imgBuffer, imgBuffer);
    
    expect(result.face1).toBeUndefined();
    expect(result.embedding1).toBeUndefined();
  });
});
