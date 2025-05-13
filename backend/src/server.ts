import express from 'express';
import cors from 'cors';
import { runCode } from './runExecutor';
import path from 'path';
import fs from 'fs/promises';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

// CORSの設定を更新
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// 問題ファイルのディレクトリパスを設定
const problemsDir = path.join(__dirname, '../problems');

// Get list of problems
app.get('/api/problems', async (req, res) => {
  try {
    console.log('Reading problems from:', problemsDir);
    const files = await fs.readdir(problemsDir);
    console.log('Found files:', files);

    const problems = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const filePath = path.join(problemsDir, file);
          console.log('Reading file:', filePath);
          const content = await fs.readFile(filePath, 'utf-8');
          const problem = JSON.parse(content);
          return {
            id: problem.id,
            title: problem.title,
            description: problem.description
          };
        })
    );

    console.log('Sending problems:', problems);
    res.json(problems.sort((a, b) => a.id.localeCompare(b.id)));
  } catch (error) {
    console.error('Error reading problems:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
  }
});

// Get specific problem
app.get('/api/problems/:id', async (req, res) => {
  try {
    const problemId = req.params.id;
    const filePath = path.join(problemsDir, `${problemId}.json`);
    console.log('Reading problem file:', filePath);

    const content = await fs.readFile(filePath, 'utf-8');
    const problem = JSON.parse(content);
    res.json(problem);
  } catch (error) {
    console.error('Error reading problem:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
  }
});

// Run code endpoint
app.post('/api/run', async (req, res) => {
  try {
    const { code, testCode } = req.body;
    if (!code || !testCode) {
      return res.status(400).json({ error: 'Code and test code are required' });
    }

    const result = await runCode(code, testCode);
    res.json({ output: result });
  } catch (error) {
    console.error('Error running code:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  console.log('Problems directory:', problemsDir);
}); 