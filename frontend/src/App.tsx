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
}

interface ProblemListItem {
  id: string;
  title: string;
  description: string;
}

function App() {
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<string>('');
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

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
          setOutput('');
          setError(null);
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
      if (result.error) {
        setError(result.error);
        setOutput('');
      } else {
        setOutput(result.output);
        setError(null);
      }
    } catch (err) {
      console.error('Error running code:', err);
      setError(err instanceof Error ? err.message : '実行中にエラーが発生しました');
      setOutput('');
    }
  };

  if (problems.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <header>
        <h1>TypeScript 100本ノック</h1>
      </header>
      <main>
        <div className="problem-selector-section">
          <ProblemSelector
            problems={problems}
            selectedProblemId={selectedProblemId}
            onSelectProblem={setSelectedProblemId}
          />
        </div>
        <div className="problem-section">
          {problem && <ProblemView problem={problem} />}
        </div>
        <div className="editor-section">
          <Editor code={code} onChange={value => setCode(value || '')} />
          <button onClick={handleRun}>実行</button>
          <div className="result-section">
            <ResultView output={output} error={error} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 