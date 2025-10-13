import { useState, useEffect } from 'react';
import Editor from './components/Editor';
import ProblemView from './components/ProblemView';
import ResultView from './components/ResultView';
import ProblemSelector from './components/ProblemSelector';
import './App.css';

interface Problem {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  testCode: string;
  hint: string;
  answer: string;
  explanation: string;
  alternativeSolutions: string[];
}

interface ProblemListItem {
  id: string;
  title: string;
  description: string;
}

interface TestCaseResult {
  name: string;
  passed: boolean;
  message?: string;
}

interface RunSummary {
  total: number;
  passed: number;
  failed: number;
}

interface RunResult {
  success: boolean;
  results: TestCaseResult[];
  summary: RunSummary;
  stdout: string;
  stderr: string;
  error?: string;
}

function App() {
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<string>('');
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  // 問題一覧を取得
  useEffect(() => {
    fetch('/api/problems')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Problems loaded:', data);
        setProblems(data);
        if (data.length > 0) {
          setSelectedProblemId(data[0].id);
        }
      })
      .catch(err => {
        console.error('Error loading problems:', err);
        setError(err.message);
      });
  }, []);

  // 選択された問題の詳細を取得
  useEffect(() => {
    if (selectedProblemId) {
      fetch(`/api/problems/${selectedProblemId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Problem details loaded:', data);
          setProblem(data);
          setCode(data.starterCode);
          setError(null);
          setRunResult(null);
        })
        .catch(err => {
          console.error('Error loading problem details:', err);
          setError(err.message);
        });
    }
  }, [selectedProblemId]);

  const handleRun = async () => {
    if (!problem) return;

    try {
      setError(null);
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          testCode: problem.testCode,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setRunResult(result);
      setError(result.error ?? null);
    } catch (err) {
      console.error('Error running code:', err);
      setError(err instanceof Error ? err.message : '実行中にエラーが発生しました');
    }
  };

  if (problems.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>TypeScript チャレンジ</h1>
      </header>
      <main className="app-layout">
        <aside className="sidebar">
          <ProblemSelector
            problems={problems}
            selectedProblemId={selectedProblemId}
            onSelectProblem={setSelectedProblemId}
          />
        </aside>

        <section className="problem-panel">
          {problem && <ProblemView key={problem.id} problem={problem} />}
        </section>

        <section className="workspace">
          <div className="editor-card surface">
            <div className="editor-toolbar">
              <h2>エディタ</h2>
              <button type="button" className="run-button" onClick={handleRun}>
                ▶ 実行
              </button>
            </div>
            <Editor code={code} onChange={value => setCode(value || '')} />
          </div>

          <div className="terminal-card surface">
            <div className="terminal-header">
              <h2>ターミナル</h2>
            </div>
            <ResultView result={runResult} error={error} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
