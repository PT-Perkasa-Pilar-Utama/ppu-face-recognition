import merge from "lodash.merge";
import {
  DEFAULT_DEBUGGING_OPTIONS,
  DEFAULT_VERIFICATION_OPTIONS,
} from "./constants";
import type { DebuggingOptions, VerificationOptions } from "./interface";

export class Verifier {
  private options: VerificationOptions;
  private readonly debugging: DebuggingOptions;

  /**
   * Creates an instance of FaceService.
   * @param options - Configuration options for the service.
   */
  public constructor(
    options: Partial<VerificationOptions> = {},
    debugging: Partial<DebuggingOptions> = {},
  ) {
    this.options = merge({}, DEFAULT_VERIFICATION_OPTIONS, options);

    this.options = {
      ...DEFAULT_VERIFICATION_OPTIONS,
      ...options,
    };

    this.debugging = {
      ...DEFAULT_DEBUGGING_OPTIONS,
      ...debugging,
    };
  }

  /**
   * Logs a message if verbose debugging is enabled
   */
  private log(message: string): void {
    if (this.debugging.verbose) {
      console.log(`[DetectionService] ${message}`);
    }
  }

  /**
   * Run verification between two embeddings
   */
  run(
    embedding1: Float32Array,
    embedding2: Float32Array,
  ): { distance: number; threshold: number; match: boolean } {
    this.log(`Running verification with metric: ${this.options.distanceMetric}`);
    const metric = this.options.distanceMetric || "cosine";
    let distance = 0;
    let threshold = 0;

    switch (metric) {
      case "cosine":
        distance = this.getDistanceCosine(embedding1, embedding2);
        threshold = this.options.cosine || DEFAULT_VERIFICATION_OPTIONS.cosine!;
        break;
      case "euclidean":
        distance = this.getDistanceEuclidean(embedding1, embedding2);
        threshold =
          this.options.euclidean || DEFAULT_VERIFICATION_OPTIONS.euclidean!;
        break;
      case "euclideanL2":
        distance = this.getDistanceEuclideanL2(embedding1, embedding2);
        threshold =
          this.options.euclideanL2 || DEFAULT_VERIFICATION_OPTIONS.euclideanL2!;
        break;
      case "angular":
        distance = this.getDistanceAngular(embedding1, embedding2);
        threshold = this.options.angular || DEFAULT_VERIFICATION_OPTIONS.angular!;
        break;
      default:
        throw new Error(`Unknown distance metric: ${metric}`);
    }

    this.log(`Distance calculated: ${distance.toFixed(6)}, Threshold: ${threshold}`);
    this.log(`Match result: ${distance <= threshold ? 'MATCH' : 'NO MATCH'}`);

    // For cosine and angular, lower distance means more similar?
    // Usually cosine similarity is 1 for identical.
    // But here we are implementing "distance".
    // Cosine distance = 1 - cosine similarity. So 0 is identical.
    // Euclidean distance: 0 is identical.
    // So for all metrics, distance <= threshold means match.

    return {
      distance,
      threshold,
      match: distance <= threshold,
    };
  }

  private getDistanceCosine(emb1: Float32Array, emb2: Float32Array): number {
    this.log(`Calculating cosine distance...`);
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < emb1.length; i++) {
      dotProduct += emb1[i]! * emb2[i]!;
      normA += emb1[i]! * emb1[i]!;
      normB += emb2[i]! * emb2[i]!;
    }

    if (normA === 0 || normB === 0) return 1; // Max distance

    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    const distance = 1 - similarity;
    this.log(`  Dot product: ${dotProduct.toFixed(6)}, NormA: ${Math.sqrt(normA).toFixed(6)}, NormB: ${Math.sqrt(normB).toFixed(6)}`);
    this.log(`  Cosine similarity: ${similarity.toFixed(6)}, Distance: ${distance.toFixed(6)}`);
    return distance;
  }

  private getDistanceEuclidean(emb1: Float32Array, emb2: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < emb1.length; i++) {
      const diff = emb1[i]! - emb2[i]!;
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  private getDistanceEuclideanL2(
    emb1: Float32Array,
    emb2: Float32Array,
  ): number {
    // Assuming embeddings are already L2 normalized by the detector
    // If so, Euclidean distance on normalized vectors is related to cosine distance.
    // But let's implement it as standard Euclidean.
    return this.getDistanceEuclidean(emb1, emb2);
  }

  private getDistanceAngular(emb1: Float32Array, emb2: Float32Array): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < emb1.length; i++) {
      dotProduct += emb1[i]! * emb2[i]!;
      normA += emb1[i]! * emb1[i]!;
      normB += emb2[i]! * emb2[i]!;
    }

    if (normA === 0 || normB === 0) return 1;

    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    // Clamp similarity to [-1, 1] to avoid NaN in acos
    const clamped = Math.max(-1, Math.min(1, similarity));
    return Math.acos(clamped) / Math.PI;
  }
}
