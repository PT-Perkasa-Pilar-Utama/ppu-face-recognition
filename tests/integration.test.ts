import { file } from "bun";
import { afterAll, describe, expect, test } from "bun:test";
import { FaceService } from "../src/face.service";

describe("FaceService", () => {
  let service: FaceService;

  afterAll(async () => {
    if (service) {
      await service.destroy();
    }
  });

  test("should initialize successfully", async () => {
    service = new FaceService({
      debugging: { verbose: false },
      verification: { cosine: 0.3 }
    });
    await service.initialize();
    expect(service.isInitialized()).toBe(true);
  }, 30000);

  test("should verify same person (Kevin) with high confidence", async () => {
    const img1 = await file("assets/image-kevin1.png").arrayBuffer();
    const img2 = await file("assets/image-kevin2.jpg").arrayBuffer();

    const result = await service.verify(img1, img2);
    
    expect(result.match).toBe(true);
    expect(result.distance).toBeLessThan(0.2); // Should be very close (was ~0.096)
    expect(result.face1).toBeDefined();
    expect(result.face2).toBeDefined();
  });

  test("should distinguish different people (Haaland vs Kevin)", async () => {
    const img1 = await file("assets/image-haaland1.jpeg").arrayBuffer();
    const img2 = await file("assets/image-kevin1.png").arrayBuffer();

    const result = await service.verify(img1, img2);
    
    expect(result.match).toBe(false);
    expect(result.distance).toBeGreaterThan(0.3); // Should be > threshold
  });

  test("should update options on the fly", async () => {
    // Update threshold to be very strict
    service.updateOptions({
      verification: { cosine: 0.01 }
    });

    const img1 = await file("assets/image-kevin1.png").arrayBuffer();
    const img2 = await file("assets/image-kevin2.jpg").arrayBuffer();

    const result = await service.verify(img1, img2);
    
    // Even Kevin (0.096) should fail with 0.01 threshold
    expect(result.match).toBe(false);
    expect(result.threshold).toBe(0.01);
    
    // Restore threshold
    service.updateOptions({
      verification: { cosine: 0.3 }
    });
  });
});
