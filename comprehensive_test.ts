import { file } from "bun";
import { FaceService } from "./src/face.service";

async function comprehensiveTest() {
  console.log("=".repeat(80));
  console.log("COMPREHENSIVE FACE VERIFICATION TEST");
  console.log("=".repeat(80));

  const thresholds = [0.25, 0.3, 0.35, 0.4];
  
  for (const threshold of thresholds) {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`TESTING WITH THRESHOLD: ${threshold}`);
    console.log("=".repeat(80));

    const faceService = new FaceService({
      debugging: { verbose: false, debug: false },
      verification: { distanceMetric: "cosine", cosine: threshold }
    });

    await faceService.initialize();

    const haaland1 = await file("assets/image-haaland1.jpeg").arrayBuffer();
    const haaland2 = await file("assets/image-haaland2.png").arrayBuffer();
    const haaland3 = await file("assets/image-haaland3.png").arrayBuffer();
    const kevin1 = await file("assets/image-kevin1.png").arrayBuffer();
    const kevin2 = await file("assets/image-kevin2.jpg").arrayBuffer();

    const tests = [
      { name: "Haaland1 vs Haaland2", img1: haaland1, img2: haaland2, expected: true },
      { name: "Haaland1 vs Haaland3", img1: haaland1, img2: haaland3, expected: true },
      { name: "Haaland2 vs Haaland3", img1: haaland2, img2: haaland3, expected: true },
      { name: "Kevin1 vs Kevin2", img1: kevin1, img2: kevin2, expected: true },
      { name: "Haaland1 vs Kevin1", img1: haaland1, img2: kevin1, expected: false },
      { name: "Haaland2 vs Kevin2", img1: haaland2, img2: kevin2, expected: false },
      { name: "Haaland3 vs Kevin1", img1: haaland3, img2: kevin1, expected: false },
    ];

    let correct = 0;
    let total = tests.length;

    console.log("\nTest Results:");
    console.log("-".repeat(80));

    for (const test of tests) {
      const result = await faceService.verify(test.img1, test.img2);
      const isCorrect = result.match === test.expected;
      correct += isCorrect ? 1 : 0;

      const status = isCorrect ? "✅" : "❌";
      const expectStr = test.expected ? "SAME" : "DIFF";
      const resultStr = result.match ? "MATCH" : "NO MATCH";
      
      console.log(`${status} ${test.name.padEnd(25)} | Expected: ${expectStr} | Got: ${resultStr.padEnd(8)} | Distance: ${result.distance.toFixed(6)}`);
    }

    console.log("-".repeat(80));
    console.log(`Accuracy: ${correct}/${total} (${((correct/total)*100).toFixed(1)}%)`);

    await faceService.destroy();
  }

  console.log("\n" + "=".repeat(80));
  console.log("ANALYSIS COMPLETE");
  console.log("=".repeat(80));
}

comprehensiveTest().catch(console.error);
