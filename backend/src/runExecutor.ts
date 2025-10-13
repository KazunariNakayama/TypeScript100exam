import { writeFile, unlink } from 'fs/promises';
import { exec, ExecException } from 'child_process';
import { promisify } from 'util';

const run = promisify(exec);
const RESULT_MARKER = '__TEST_RESULTS__';

export interface TestCaseResult {
  name: string;
  passed: boolean;
  message?: string;
}

export interface ExecutionSummary {
  total: number;
  passed: number;
  failed: number;
}

export interface ExecutionResult {
  success: boolean;
  results: TestCaseResult[];
  summary: ExecutionSummary;
  stdout: string;
  stderr: string;
  error?: string;
}

function buildHarness(code: string, testCode: string): string {
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

function parseExecution(stdout: string, stderr: string, error?: string): ExecutionResult {
  let results: TestCaseResult[] = [];
  let cleanedStdout = stdout;

  const markerIndex = stdout.lastIndexOf(RESULT_MARKER);
  if (markerIndex !== -1) {
    const jsonString = stdout.slice(markerIndex + RESULT_MARKER.length).trim();
    cleanedStdout = stdout.slice(0, markerIndex).trim();
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        results = parsed.filter((entry): entry is TestCaseResult => typeof entry === 'object' && entry !== null && 'passed' in entry && 'name' in entry);
      }
    } catch (parseError) {
      console.error('Failed to parse test results:', parseError);
    }
  } else {
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

export async function runCode(code: string, testCode: string): Promise<ExecutionResult> {
  const fileName = `temp_${Date.now()}.ts`;
  const fullCode = buildHarness(code, testCode);

  try {
    await writeFile(fileName, fullCode);
    const { stdout, stderr } = await run(`npx ts-node ${fileName}`);
    return parseExecution(stdout, stderr);
  } catch (err) {
    const execError = err as ExecException & { stdout?: string; stderr?: string };
    const stdout = execError.stdout ?? '';
    const stderr = execError.stderr ?? '';
    const errorMessage = execError.message ?? 'Unknown error occurred';
    return parseExecution(stdout, stderr, errorMessage);
  } finally {
    try {
      await unlink(fileName);
    } catch (unlinkError) {
      console.error('Error deleting temporary file:', unlinkError);
    }
  }
}
