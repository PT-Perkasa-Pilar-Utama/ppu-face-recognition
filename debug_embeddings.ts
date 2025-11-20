import { file } from "bun";
import { FaceService } from "./src/face.service";

async function debugEmbeddings() {
  console.log("Initializing FaceService...");
  const faceService = new FaceService({
    debugging: {
      verbose: false, // Turn off verbose to see embeddings clearly
      debug: false,
    },
    verification: {
        distanceMetric: "cosine",
    }
  });

  await faceService.initialize();

  const img1 = await file("assets/image.png").arrayBuffer();
  const img2 = await file("assets/image2.png").arrayBuffer();
  const img3 = await file("assets/image3.png").arrayBuffer();

  // Access the detector directly to get embeddings
  const { Detector } = await import("./src/detector.service");
  
  const detector = new Detector(
    (faceService as any).detectorSession,
    (faceService as any).embedderSession,
    { threshold: 0.5, paddingPercentage: 0, alignment: true },
    { verbose: false }
  );

  console.log("\n=== Getting embeddings ===");
  const result1 = await detector.run(img1, img1);
  const result12 = await detector.run(img1, img2);
  const result13 = await detector.run(img1, img3);

  console.log("\n=== Image 1 vs Image 1 (self) ===");
  if (result1.embedding1 && result1.embedding2) {
    console.log("Embedding 1 first 10 values:", Array.from(result1.embedding1.slice(0, 10)));
    console.log("Embedding 2 first 10 values:", Array.from(result1.embedding2.slice(0, 10)));
    
    // Calculate dot product manually
    let dot = 0;
    for (let i = 0; i < result1.embedding1.length; i++) {
      dot += result1.embedding1[i]! * result1.embedding2[i]!;
    }
    console.log("Dot product (should be ~1.0):", dot);
  }

  console.log("\n=== Image 1 vs Image 2 (same person) ===");
  if (result12.embedding1 && result12.embedding2) {
    console.log("Embedding 1 first 10 values:", Array.from(result12.embedding1.slice(0, 10)));
    console.log("Embedding 2 first 10 values:", Array.from(result12.embedding2.slice(0, 10)));
    
    let dot = 0;
    for (let i = 0; i < result12.embedding1.length; i++) {
      dot += result12.embedding1[i]! * result12.embedding2[i]!;
    }
    console.log("Dot product:", dot);
  }

  console.log("\n=== Image 1 vs Image 3 (different person) ===");
  if (result13.embedding1 && result13.embedding2) {
    console.log("Embedding 1 first 10 values:", Array.from(result13.embedding1.slice(0, 10)));
    console.log("Embedding 2 first 10 values:", Array.from(result13.embedding2.slice(0, 10)));
    
    let dot = 0;
    for (let i = 0; i < result13.embedding1.length; i++) {
      dot += result13.embedding1[i]! * result13.embedding2[i]!;
    }
    console.log("Dot product (should be lower than same person):", dot);
  }

  await faceService.destroy();
}

debugEmbeddings().catch(console.error);
