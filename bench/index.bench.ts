import { bench, group, run } from 'mitata';
import { DEFAULT_DEBUGGING_OPTIONS } from '../src/constants';
import { FaceService } from '../src/face.service';
import { Verifier } from '../src/verifier.service';

// Setup
console.log("Initializing FaceService for benchmarks...");
const service = new FaceService({
  debugging: { verbose: false },
  detection: { threshold: 0.5 },
  verification: { cosine: 0.3 }
});
await service.initialize();

const imgBuf = await Bun.file("../assets/image-kevin1.png").arrayBuffer();

// Pre-warm the model
console.log("Warming up models...");
await service.verify(imgBuf, imgBuf);

// Mock embeddings for Verifier bench
const emb1 = new Float32Array(512).fill(0.1);
const emb2 = new Float32Array(512).fill(0.1);
const verifier = new Verifier({ distanceMetric: "cosine", cosine: 0.3 }, DEFAULT_DEBUGGING_OPTIONS);

group('Face Verification Pipeline', () => {
  bench('Full Verify (Same Image)', async () => {
    await service.verify(imgBuf, imgBuf);
  });
});

group('Micro Benchmarks', () => {
  bench('Cosine Distance Calculation', async () => {
     verifier.run(emb1, emb2);
  });
  
  bench('Euclidean Distance Calculation', async () => {
    verifier.updateOptions({ distanceMetric: "euclidean" });
     verifier.run(emb1, emb2);
  });

    bench('Euclidean L2 Distance Calculation', async () => {
    verifier.updateOptions({ distanceMetric: "euclideanL2" });
     verifier.run(emb1, emb2);
  });

    bench('Angular Distance Calculation', async () => {
    verifier.updateOptions({ distanceMetric: "angular" });
     verifier.run(emb1, emb2);
  });
});

await run();

// Cleanup
await service.destroy();
