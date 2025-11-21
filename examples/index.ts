import { FaceService } from "../src/face.service";

const faceService = new FaceService({
  debugging: { verbose: true, debug: true },
});

await faceService.initialize();

const haaland1 = await Bun.file("assets/image-haaland1.jpeg").arrayBuffer();
const haaland2 = await Bun.file("assets/image-haaland2.png").arrayBuffer();
const haaland3 = await Bun.file("assets/image-haaland3.png").arrayBuffer();
const kevin1 = await Bun.file("assets/image-kevin1.png").arrayBuffer();
const kevin2 = await Bun.file("assets/image-kevin2.jpg").arrayBuffer();

const result = await faceService.verify(haaland1, haaland2);

console.log(result);
