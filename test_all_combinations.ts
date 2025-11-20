import { file } from "bun";
import { FaceService } from "./src/face.service";

async function testIndividually() {
  const faceService = new FaceService({
    debugging: { verbose: false },
  });

  await faceService.initialize();

  console.log("Testing each image individually...\n");
  
  const img1 = await file("assets/image.png").arrayBuffer();
  const img2 = await file("assets/image2.png").arrayBuffer();
  const img3 = await file("assets/image3.png").arrayBuffer();

  console.log("=== Test: img1 vs img2 (should be SAME person) ===");
  const result12 = await faceService.verify(img1, img2);
  console.log(JSON.stringify(result12, null, 2));

  console.log("\n=== Test: img1 vs img3 (should be DIFFERENT person) ===");
  const result13 = await faceService.verify(img1, img3);
  console.log(JSON.stringify(result13, null, 2));

  console.log("\n=== Test: img2 vs img3 (should be DIFFERENT person) ===");
  const result23 = await faceService.verify(img2, img3);
  console.log(JSON.stringify(result23, null, 2));

  await faceService.destroy();
  
  console.log("\n=== SUMMARY ===");
  console.log(`img1 vs img2 (same):      distance = ${result12.distance}`);
  console.log(`img1 vs img3 (different): distance = ${result13.distance}`);
  console.log(`img2 vs img3 (different): distance = ${result23.distance}`);
  console.log("\nExpected: same person should have LOWER distance than different person");
  console.log(`Is img1-img2 < img1-img3? ${result12.distance < result13.distance} (should be true)`);
  console.log(`Is img1-img2 < img2-img3? ${result12.distance < result23.distance} (should be true)`);
}

testIndividually().catch(console.error);
