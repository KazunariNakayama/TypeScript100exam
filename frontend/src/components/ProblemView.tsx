import { useState } from 'react';

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

interface ProblemViewProps {
  problem: Problem;
}

type RevealableSection = 'hint' | 'answer' | 'explanation' | 'alternatives';

const initialVisibility: Record<RevealableSection, boolean> = {
  hint: false,
  answer: false,
  explanation: false,
  alternatives: false
};

export default function ProblemView({ problem }: ProblemViewProps) {
  const [visibility, setVisibility] = useState(initialVisibility);

  const toggleVisibility = (section: RevealableSection) => {
    setVisibility(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="problem-view">
      <section className="problem-card card">
        <header>
          <h2>{problem.title}</h2>
        </header>
        <div className="problem-body">
          <div className="description">
            <h3>問題文</h3>
            <p>{problem.description}</p>
          </div>
          <div className="test-info">
            <h3>テストコード</h3>
            <pre>{problem.testCode}</pre>
          </div>
        </div>
      </section>

      <aside className="problem-insights">
        <section className="hint-card card">
          <div className="card-header">
            <h3>ヒント</h3>
            <button
              type="button"
              className="toggle-button"
              onClick={() => toggleVisibility('hint')}
            >
              {visibility.hint ? '非表示にする' : '表示する'}
            </button>
          </div>
          {visibility.hint ? (
            <p>{problem.hint}</p>
          ) : (
            <p className="muted-text">ヒントは表示ボタンを押すまで隠されています。</p>
          )}
        </section>

        <section className="solutions-card card">
          <h3>学習メモ</h3>

          <div className="solution-section">
            <div className="card-subheader">
              <h4>回答例</h4>
              <button
                type="button"
                className="toggle-button"
                onClick={() => toggleVisibility('answer')}
              >
                {visibility.answer ? '非表示にする' : '表示する'}
              </button>
            </div>
            {visibility.answer ? (
              <pre>{problem.answer}</pre>
            ) : (
              <p className="muted-text">回答例は表示ボタンを押すまで隠されています。</p>
            )}
          </div>

          <div className="solution-section">
            <div className="card-subheader">
              <h4>解説</h4>
              <button
                type="button"
                className="toggle-button"
                onClick={() => toggleVisibility('explanation')}
              >
                {visibility.explanation ? '非表示にする' : '表示する'}
              </button>
            </div>
            {visibility.explanation ? (
              <p>{problem.explanation}</p>
            ) : (
              <p className="muted-text">解説は表示ボタンを押すまで隠されています。</p>
            )}
          </div>

          <div className="solution-section">
            <div className="card-subheader">
              <h4>別解</h4>
              <button
                type="button"
                className="toggle-button"
                onClick={() => toggleVisibility('alternatives')}
              >
                {visibility.alternatives ? '非表示にする' : '表示する'}
              </button>
            </div>
            {visibility.alternatives ? (
              <div className="alternative-list">
                {problem.alternativeSolutions.map((solution, index) => (
                  <pre key={index}>{solution}</pre>
                ))}
              </div>
            ) : (
              <p className="muted-text">別解は表示ボタンを押すまで隠されています。</p>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
