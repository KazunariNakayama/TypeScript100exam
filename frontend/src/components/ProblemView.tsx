interface Problem {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  testCode: string;
}

interface ProblemViewProps {
  problem: Problem;
}

export default function ProblemView({ problem }: ProblemViewProps) {
  return (
    <div className="problem-view">
      <h2>{problem.title}</h2>
      <div className="description">
        <h3>問題文</h3>
        <p>{problem.description}</p>
      </div>
      <div className="test-info">
        <h3>テストコード</h3>
        <pre>{problem.testCode}</pre>
      </div>
    </div>
  );
} 