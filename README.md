# ppu-face-recognition

A type-safe TypeScript library for face detection and verification using ONNX Runtime.
Powered by **YOLOv11** for detection and **FaceNet512** for embedding generation.

## Features

- 🚀 **Fast & Lightweight**: Uses ONNX Runtime for efficient inference.
- 🔒 **Type-Safe**: Written in TypeScript with complete type definitions.
- 🛠 **Configurable**: Customizable thresholds, distance metrics, and padding.
- 🧪 **Tested**: High test coverage (>96%) ensuring reliability.

## Installation

```bash
bun add ppu-face-recognition
# or
npm install ppu-face-recognition
```

## Usage

### Basic Verification

```typescript
import { FaceService } from "ppu-face-recognition";
import { file } from "bun";

// 1. Initialize the service
const service = new FaceService({
  detection: { threshold: 0.5 },
  verification: { cosine: 0.3 }, // Strict threshold for security
});

await service.initialize();

// 2. Load images (ArrayBuffer)
const img1 = await file("path/to/face1.jpg").arrayBuffer();
const img2 = await file("path/to/face2.jpg").arrayBuffer();

// 3. Verify
const result = await service.verify(img1, img2);

if (result.match) {
  console.log(`Match confirmed! Distance: ${result.distance}`);
} else {
  console.log(`No match. Distance: ${result.distance}`);
}

// 4. Cleanup
await service.destroy();
```

### Dynamic Configuration

You can update options on the fly without reloading models:

```typescript
service.updateOptions({
  detection: { paddingPercentage: 20 }, // Expand face box by 20%
  verification: { distanceMetric: "euclideanL2" },
});
```

## Configuration

### Detection Options

| Option              | Type     | Default | Description                                                                                                      |
| ------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| `threshold`         | `number` | `0.5`   | Confidence threshold for face detection.                                                                         |
| `paddingPercentage` | `number` | `0`     | Percentage to expand the detected face box (e.g., `10` for 10%). Useful for ensuring the whole face is captured. |

### Verification Options

| Option           | Type                             | Default    | Description                                      |
| ---------------- | -------------------------------- | ---------- | ------------------------------------------------ |
| `distanceMetric` | `"cosine" \| "euclidean" \| ...` | `"cosine"` | Metric to compare embeddings.                    |
| `cosine`         | `number`                         | `0.3`      | Threshold for Cosine distance (lower is better). |
| `euclideanL2`    | `number`                         | `1.04`     | Threshold for L2 Euclidean distance.             |

## Benchmark

```sh
> bun task bench
$ bun scripts/task.ts bench
Running benchmark: index.bench.ts
Initializing FaceService for benchmarks...
Warming up models...
clk: ~3.09 GHz
cpu: Apple M1
runtime: bun 1.3.0 (arm64-darwin)

benchmark                        avg (min … max) p75 / p99    (min … top 1%)
------------------------------------------------ -------------------------------
• Face Verification Pipeline
------------------------------------------------ -------------------------------
Full Verify (Same Image)          159.51 ms/iter 161.99 ms        █
                         (154.66 ms … 167.28 ms) 164.17 ms        █
                         ( 48.00 kb …  41.55 mb)  12.23 mb ██▁█▁▁▁██▁▁█▁▁▁█▁█▁▁█

• Micro Benchmarks
------------------------------------------------ -------------------------------
Cosine Distance Calculation         1.02 µs/iter   1.01 µs  █
                           (939.62 ns … 2.13 µs)   1.63 µs  ██
                         (  0.00  b … 932.00  b) 211.57  b ▆██▃▁▂▁▂▁▁▁▁▁▁▁▁▁▁▁▁▁

Euclidean Distance Calculation      1.03 µs/iter 998.69 ns  █
                           (825.30 ns … 3.78 µs)   2.08 µs  █
                         ( 60.00  b … 612.00  b) 431.49  b ▇██▅▃▃▁▂▃▁▁▂▁▂▁▂▁▁▁▁▁

Euclidean L2 Distance Calculation 998.93 ns/iter 917.00 ns  █
                           (750.00 ns … 1.54 ms)   2.88 µs  █▄
                         (  0.00  b … 144.00 kb) 106.60  b ▁██▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

Angular Distance Calculation      889.21 ns/iter 917.30 ns   █      ▂
                           (817.55 ns … 1.11 µs)   1.03 µs  ▆█▃██ ▇▆█▃
                         (  0.00  b … 736.00  b) 137.64  b ▇███████████▇▅▅▃▄▂▂▁▃
```

## Testing

Run the test suite:

```bash
bun test
```

Check code coverage:

```bash
bun test --coverage
```

## Known Limitations

- **Pose Sensitivity**: This library currently uses **FaceNet512** without landmark-based geometric alignment (rotation). It performs best on frontal faces.
- **Hard Cases**: Verification may fail (False Negative) for the same person in extreme poses or angles (e.g., profile view vs frontal).
- **Recommendation**: For security-critical applications, use the default strict threshold (`0.3`) to minimize False Positives, even if it means rejecting some valid matches with poor pose alignment.

## License

MIT

## Future Improvements & Roadmap

To further enhance accuracy and performance, the following improvements are planned:

1.  **Landmark-Based Alignment**:
    - Integrate a lightweight facial landmark detection model (e.g., MTCNN or a 5-point landmark ONNX model).
    - Implement geometric alignment (rotation) to align eyes horizontally. This is the critical fix for improving accuracy on non-frontal faces (e.g., "Haaland" test cases).

2.  **Model Optimization**:
    - Support quantized ONNX models (INT8) to reduce memory usage and increase inference speed on edge devices.

3.  **Hardware Acceleration**:
    - Add explicit configuration support for ONNX Runtime providers like **CoreML** (macOS), **CUDA** (NVIDIA), and **TensorRT** for GPU acceleration.

4.  **Batch Processing**:
    - Update `DetectorService` to accept batches of images for high-throughput scenarios.
