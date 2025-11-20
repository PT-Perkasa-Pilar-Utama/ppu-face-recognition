import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

import { DEFAULT_DEBUGGING_OPTIONS, DEFAULT_INFERENCE } from "./constants";

import merge from "lodash.merge";
import * as os from "os";
import * as path from "path";
import type { Canvas } from "ppu-ocv";
import type { DebuggingOptions } from "ppu-yolo-onnx-inference";

const CACHE_DIR = path.join(os.homedir(), ".cache", "ppu-face-recognition");

export class Utils {
  private options: DebuggingOptions = DEFAULT_DEBUGGING_OPTIONS;

  /**
   * Creates an instance of FaceService.
   * @param options - Configuration options for the service.
   */
  public constructor(options?: DebuggingOptions) {
    this.options = merge({}, DEFAULT_DEBUGGING_OPTIONS, options);
  }

  /**
   * Logs a message if verbose debugging is enabled.
   */
  log(message: string): void {
    if (this.options?.verbose) {
      console.log(`[FaceService] ${message}`);
    }
  }

  /**
   * Fetches a resource from a URL and caches it locally.
   * If the resource is already in the cache, it loads it from there.
   */
  async fetchAndCache(url: string): Promise<ArrayBuffer> {
    const fileName = path.basename(new URL(url).pathname);
    const cachePath = path.join(CACHE_DIR, fileName);

    if (existsSync(cachePath)) {
      this.log(`Loading cached resource from: ${cachePath}`);
      const buf = readFileSync(cachePath);
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }

    console.log(
      `[FaceService] Downloading resource: ${fileName}\n` +
        `                 Cached at: ${CACHE_DIR}`,
    );
    this.log(`Fetching resource from URL: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch resource from ${url}`);
    }
    if (!response.body) {
      throw new Error("Response body is null or undefined");
    }

    const contentLength = response.headers.get("Content-Length");
    const totalLength = contentLength ? parseInt(contentLength, 10) : 0;
    let receivedLength = 0;
    const chunks: Uint8Array[] = [];

    const reader = response.body.getReader();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
      receivedLength += value.length;

      if (totalLength > 0) {
        const percentage = ((receivedLength / totalLength) * 100).toFixed(2);
        process.stdout.write(`\rDownloading... ${percentage}%`);
      }
    }
    process.stdout.write("\n"); // Move to the next line

    const buffer = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, position);
      position += chunk.length;
    }

    this.log(`Caching resource to: ${cachePath}`);
    if (!existsSync(CACHE_DIR)) {
      mkdirSync(CACHE_DIR, { recursive: true });
    }
    writeFileSync(cachePath, Buffer.from(buffer));

    return buffer.buffer;
  }

  /**
   * Loads a resource from a buffer, a file path, a URL, or a default URL.
   */
  async loadResource(
    source: string | ArrayBuffer | undefined,
    defaultUrl: string,
  ): Promise<ArrayBuffer> {
    if (source instanceof ArrayBuffer) {
      this.log("Loading resource from ArrayBuffer");
      return source;
    }

    if (typeof source === "string") {
      if (source.startsWith("http")) {
        return this.fetchAndCache(source);
      } else {
        const resolvedPath = path.resolve(process.cwd(), source);
        this.log(`Loading resource from path: ${resolvedPath}`);
        const buf = readFileSync(resolvedPath);
        return buf.buffer.slice(
          buf.byteOffset,
          buf.byteOffset + buf.byteLength,
        );
      }
    }

    return this.fetchAndCache(defaultUrl);
  }


}
