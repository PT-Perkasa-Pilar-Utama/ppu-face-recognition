import { FaceService } from "../src/face.service";

const faceService = new FaceService();

const kevin1 = await Bun.file("assets/image-kevin1.png").arrayBuffer();
const kevin2 = await Bun.file("assets/image-kevin2.jpg").arrayBuffer();

// Warmup
console.log("Warming up...");
await faceService.initialize();
await faceService.verify(kevin1, kevin2);

console.log("Benchmarking...");
let totalDuration = 0;
const iterations = 7;

for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    await faceService.verify(kevin1, kevin2);
    const duration = Date.now() - startTime;
    totalDuration += duration;
    console.log(`Iteration ${i + 1}: ${duration}ms`);
}

const averageDuration = totalDuration / iterations;
console.log(`Average duration over ${iterations} runs: ${averageDuration.toFixed(2)}ms`);
