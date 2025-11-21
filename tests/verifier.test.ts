import { describe, expect, test } from "bun:test";
import { DEFAULT_DEBUGGING_OPTIONS } from "../src/constants";
import { Verifier } from "../src/verifier.service";

describe("VerifierService", () => {
  const emb1 = new Float32Array([1, 0, 0]);
  const emb2 = new Float32Array([1, 0, 0]); // Identical
  const emb3 = new Float32Array([0, 1, 0]); // Orthogonal

  test("should calculate Cosine distance correctly", async () => {
    const verifier = new Verifier(
      { distanceMetric: "cosine", cosine: 0.3 },
      DEFAULT_DEBUGGING_OPTIONS
    );

    const res1 = await verifier.run(emb1, emb2);
    expect(res1.distance).toBeCloseTo(0); // 1 - dot(1) = 0

    const res2 = await verifier.run(emb1, emb3);
    expect(res2.distance).toBeCloseTo(1); // 1 - dot(0) = 1
  });

  test("should calculate Euclidean distance correctly", async () => {
    const verifier = new Verifier(
      { distanceMetric: "euclidean", euclidean: 1.0 },
      DEFAULT_DEBUGGING_OPTIONS
    );

    const res1 = await verifier.run(emb1, emb2);
    expect(res1.distance).toBe(0);

    const res2 = await verifier.run(emb1, emb3);
    // sqrt((1-0)^2 + (0-1)^2 + 0) = sqrt(2) ≈ 1.414
    expect(res2.distance).toBeCloseTo(Math.sqrt(2));
  });

  test("should calculate EuclideanL2 distance correctly", async () => {
    const verifier = new Verifier(
      { distanceMetric: "euclideanL2", euclideanL2: 1.0 },
      DEFAULT_DEBUGGING_OPTIONS
    );

    const res1 = await verifier.run(emb1, emb2);
    expect(res1.distance).toBe(0);

    const res2 = await verifier.run(emb1, emb3);
    expect(res2.distance).toBeCloseTo(Math.sqrt(2));
  });

  test("should calculate Angular distance correctly", async () => {
    const verifier = new Verifier(
      { distanceMetric: "angular", angular: 0.5 },
      DEFAULT_DEBUGGING_OPTIONS
    );

    // Angular = arccos(cosine_sim) / pi
    // Cosine sim for emb1, emb3 is 0. arccos(0) = pi/2. dist = (pi/2)/pi = 0.5
    const res = await verifier.run(emb1, emb3);
    expect(res.distance).toBeCloseTo(0.5);
  });
  test("should match DeepFace reference values (manual verification vectors)", async () => {
    // Vectors used in manual verification
    const vecA = new Float32Array([1, 0]);
    const vecB = new Float32Array([0, 2]);

    const verifier = new Verifier({}, DEFAULT_DEBUGGING_OPTIONS);

    // 1. Cosine
    verifier.updateOptions({ distanceMetric: "cosine" });
    const resCosine = verifier.run(vecA, vecB);
    expect(resCosine.distance).toBeCloseTo(1.0, 5);

    // 2. Euclidean
    verifier.updateOptions({ distanceMetric: "euclidean" });
    const resEuclidean = verifier.run(vecA, vecB);
    expect(resEuclidean.distance).toBeCloseTo(2.236068, 5);

    // 3. Euclidean L2
    verifier.updateOptions({ distanceMetric: "euclideanL2" });
    const resEuclideanL2 = verifier.run(vecA, vecB);
    expect(resEuclideanL2.distance).toBeCloseTo(1.414214, 5);

    // 4. Angular
    verifier.updateOptions({ distanceMetric: "angular" });
    const resAngular = verifier.run(vecA, vecB);
    expect(resAngular.distance).toBeCloseTo(0.5, 5);
  });
});
