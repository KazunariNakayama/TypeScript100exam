"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCode = runCode;
const promises_1 = require("fs/promises");
const child_process_1 = require("child_process");
const util_1 = require("util");
const run = (0, util_1.promisify)(child_process_1.exec);
const RESULT_MARKER = '__TEST_RESULTS__';
function buildHarness(code, testCode) {
    const harness = `
const __results: { name: string; passed: boolean; message?: string }[] = [];
const __normalizeName = (message?: unknown): string => {
  if (typeof message !== 'string') {
    return 'Unnamed assertion';
  }
  const trimmed = message.replace(/^Test failed:\\s*/u, '').trim();
  return trimmed || 'Unnamed assertion';
};
const __recordResult = (name: string, passed: boolean, message?: string) => {
  __results.push({ name, passed, message });
};
const __originalConsoleAssert = console.assert.bind(console);
console.assert = (...args: unknown[]) => {
  const [condition, message] = args;
  const name = __normalizeName(message);
  if (condition) {
    __recordResult(name, true);
  } else {
    const failureMessage = typeof message === 'string' && message
      ? message
      : 'Assertion failed';
    __recordResult(name, false, failureMessage);
  }
};
`.trim();
    const footer = `
console.assert = __originalConsoleAssert;
console.log('${RESULT_MARKER}' + JSON.stringify(__results));
`.trim();
    return `${harness}\n\n${code}\n\n${testCode}\n\n${footer}\n`;
}
function parseExecution(stdout, stderr, error) {
    let results = [];
    let cleanedStdout = stdout;
    const markerIndex = stdout.lastIndexOf(RESULT_MARKER);
    if (markerIndex !== -1) {
        const jsonString = stdout.slice(markerIndex + RESULT_MARKER.length).trim();
        cleanedStdout = stdout.slice(0, markerIndex).trim();
        try {
            const parsed = JSON.parse(jsonString);
            if (Array.isArray(parsed)) {
                results = parsed.filter((entry) => typeof entry === 'object' && entry !== null && 'passed' in entry && 'name' in entry);
            }
        }
        catch (parseError) {
            console.error('Failed to parse test results:', parseError);
        }
    }
    else {
        cleanedStdout = stdout.trim();
    }
    const failed = results.filter(result => !result.passed).length;
    const passed = results.length - failed;
    return {
        success: failed === 0 && (!error || error.length === 0),
        results,
        summary: {
            total: results.length,
            passed,
            failed
        },
        stdout: cleanedStdout,
        stderr: stderr.trim(),
        error
    };
}
async function runCode(code, testCode) {
    const fileName = `temp_${Date.now()}.ts`;
    const fullCode = buildHarness(code, testCode);
    try {
        await (0, promises_1.writeFile)(fileName, fullCode);
        const { stdout, stderr } = await run(`npx ts-node ${fileName}`);
        return parseExecution(stdout, stderr);
    }
    catch (err) {
        const execError = err;
        const stdout = execError.stdout ?? '';
        const stderr = execError.stderr ?? '';
        const errorMessage = execError.message ?? 'Unknown error occurred';
        return parseExecution(stdout, stderr, errorMessage);
    }
    finally {
        try {
            await (0, promises_1.unlink)(fileName);
        }
        catch (unlinkError) {
            console.error('Error deleting temporary file:', unlinkError);
        }
    }
}
