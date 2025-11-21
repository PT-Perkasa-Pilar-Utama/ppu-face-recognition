import { FaceService } from "../src/face.service";
const GROUND_TRUTH = {
  "k1-k2": true,
  "k1-h1": false,
  "k1-h2": false,
  "k2-h1": false,
  "k2-h2": false,
  "h1-h2": true,
};

const faceService = new FaceService();
await faceService.initialize();

const images = [
  { name: "image-kevin1.png", path: "assets/image-kevin1.png" },
  { name: "image-kevin2.jpg", path: "assets/image-kevin2.jpg" },
  { name: "image-haaland1.jpeg", path: "assets/image-haaland1.jpeg" },
  { name: "image-haaland2.png", path: "assets/image-haaland2.png" },
];

const metrics = ["cosine", "euclidean", "euclideanL2", "angular"];

console.log("Metric, Image 1, Image 2, Distance, Verified");

// Load all images first
const loadedImages = await Promise.all(
  images.map(async (img) => ({
    name: img.name,
    buffer: await Bun.file(img.path).arrayBuffer(),
  })),
);

for (const metric of metrics) {
  // Update options to use the current metric
  faceService.updateOptions({
    verification: {
      distanceMetric: metric as any,
    },
  });

  for (let i = 0; i < loadedImages.length; i++) {
    for (let j = i + 1; j < loadedImages.length; j++) {
      const img1 = loadedImages[i];
      const img2 = loadedImages[j];

      try {
        const result = await faceService.verify(img1.buffer, img2.buffer);
        console.log(
          `${metric}, ${img1.name}, ${img2.name}, ${result.distance}, ${result.match}`,
        );
      } catch (error) {
        console.log(`${metric}, ${img1.name}, ${img2.name}, ERROR, ${error}`);
      }
    }
  }
}
