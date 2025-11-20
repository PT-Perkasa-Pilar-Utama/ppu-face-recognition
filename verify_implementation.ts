import { file } from "bun";
import { FaceService } from "./src/face.service";

async function main() {
  console.log("Initializing FaceService...");
  const faceService = new FaceService({
    debugging: {
      verbose: true,
      debug: true,
      debugFolder: "out_verify"
    },
    verification: {
        distanceMetric: "cosine",
        cosine: 0.4 // Adjusted threshold
    }
  });

  await faceService.initialize();
  console.log("FaceService initialized.\n");

  // Load all images
  const haaland1 = await file("assets/image-haaland1.jpeg").arrayBuffer();
  const haaland2 = await file("assets/image-haaland2.png").arrayBuffer();
  const haaland3 = await file("assets/image-haaland3.png").arrayBuffer();
  const kevin1 = await file("assets/image-kevin1.png").arrayBuffer();
  const kevin2 = await file("assets/image-kevin2.jpg").arrayBuffer();

  console.log("=".repeat(80));
  console.log("SAME PERSON TESTS (should match with low distance)");
  console.log("=".repeat(80));

  console.log("\n--- Test 1: Haaland1 vs Haaland2 (Same Person) ---");
  try {
    const result = await faceService.verify(haaland1, haaland2);
    console.log(`Result: ${result.match ? '✅ MATCH' : '❌ NO MATCH'} | Distance: ${result.distance} | Threshold: ${result.threshold}`);
  } catch (e) {
    console.error("Error:", e);
  }

  console.log("\n--- Test 2: Haaland1 vs Haaland3 (Same Person) ---");
  try {
    const result = await faceService.verify(haaland1, haaland3);
    console.log(`Result: ${result.match ? '✅ MATCH' : '❌ NO MATCH'} | Distance: ${result.distance} | Threshold: ${result.threshold}`);
  } catch (e) {
    console.error("Error:", e);
  }

  console.log("\n--- Test 3: Haaland2 vs Haaland3 (Same Person) ---");
  try {
    const result = await faceService.verify(haaland2, haaland3);
    console.log(`Result: ${result.match ? '✅ MATCH' : '❌ NO MATCH'} | Distance: ${result.distance} | Threshold: ${result.threshold}`);
  } catch (e) {
    console.error("Error:", e);
  }

  console.log("\n--- Test 4: Kevin1 vs Kevin2 (Same Person) ---");
  try {
    const result = await faceService.verify(kevin1, kevin2);
    console.log(`Result: ${result.match ? '✅ MATCH' : '❌ NO MATCH'} | Distance: ${result.distance} | Threshold: ${result.threshold}`);
  } catch (e) {
    console.error("Error:", e);
  }

  console.log("\n" + "=".repeat(80));
  console.log("DIFFERENT PERSON TESTS (should NOT match with high distance)");
  console.log("=".repeat(80));

  console.log("\n--- Test 5: Haaland1 vs Kevin1 (Different People) ---");
  try {
    const result = await faceService.verify(haaland1, kevin1);
    console.log(`Result: ${result.match ? '❌ FALSE MATCH' : '✅ CORRECT NO MATCH'} | Distance: ${result.distance} | Threshold: ${result.threshold}`);
  } catch (e) {
    console.error("Error:", e);
  }

  console.log("\n--- Test 6: Haaland2 vs Kevin2 (Different People) ---");
  try {
    const result = await faceService.verify(haaland2, kevin2);
    console.log(`Result: ${result.match ? '❌ FALSE MATCH' : '✅ CORRECT NO MATCH'} | Distance: ${result.distance} | Threshold: ${result.threshold}`);
  } catch (e) {
    console.error("Error:", e);
  }

  console.log("\n--- Test 7: Haaland3 vs Kevin1 (Different People) ---");
  try {
    const result = await faceService.verify(haaland3, kevin1);
    console.log(`Result: ${result.match ? '❌ FALSE MATCH' : '✅ CORRECT NO MATCH'} | Distance: ${result.distance} | Threshold: ${result.threshold}`);
  } catch (e) {
    console.error("Error:", e);
  }

  await faceService.destroy();
  console.log("\n" + "=".repeat(80));
  console.log("Tests completed!");
  console.log("=".repeat(80));
}

main().catch(console.error);
