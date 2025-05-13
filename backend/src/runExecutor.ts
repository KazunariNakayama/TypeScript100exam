import { writeFile, unlink } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const run = promisify(exec);

export async function runCode(code: string, testCode: string): Promise<string> {
  const fileName = `temp_${Date.now()}.ts`;
  const fullCode = `${code}\n\n${testCode}`;

  try {
    await writeFile(fileName, fullCode);
    const { stdout, stderr } = await run(`npx ts-node ${fileName}`);
    return stdout || stderr || '✅ Test Passed!';
  } catch (err) {
    if (err instanceof Error) {
      return err.message;
    }
    return 'Unknown error occurred';
  } finally {
    try {
      await unlink(fileName);
    } catch (err) {
      console.error('Error deleting temporary file:', err);
    }
  }
} 