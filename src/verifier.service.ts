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

  async run() {}

  private getDistanceCosine() {}

  private normalizeDistanceCosine() {
    // 1 - dotProduct / (norm1 * norm2)
  }

  private getDistanceEuclidean() {}

  private normalizeDistanceEuclidean() {
    // linalg.norm(embedding1 - embedding2)
  }

  private getDistanceEuclideanL2() {}

  private normalizeDistanceEuclideanL2() {
    // Euclidean on L2 - normalized embeddings
  }

  private getDistanceAngular() {}

  private normalizeDistanceAngular() {
    // arccos(similarity) / pi
  }

  private getThreshold() {}
}
