import { describe, expect, test } from "bun:test";
import { Utils } from "../src/utils.service";

describe("Utils", () => {
  test("should merge options correctly", () => {
    const utils = new Utils();
    const defaults = { a: 1, b: 2 };
    const options = { b: 3 };
    
    const result = utils.mergeOptions(defaults, options);
    expect(result).toEqual({ a: 1, b: 3 });
  });

  test("should log only when verbose is true", () => {
    // Mock console.log
    const originalLog = console.log;
    let logCalled = false;
    console.log = () => { logCalled = true; };

    const utilsVerbose = new Utils({ verbose: true });
    utilsVerbose.log("test");
    expect(logCalled).toBe(true);

    logCalled = false;
    const utilsSilent = new Utils({ verbose: false });
    utilsSilent.log("test");
    expect(logCalled).toBe(false);

    console.log = originalLog;
  });

  test("should load resource from ArrayBuffer", async () => {
    const utils = new Utils();
    const buffer = new ArrayBuffer(8);
    const result = await utils.loadResource(buffer, "http://example.com");
    expect(result).toBe(buffer);
  });
});
