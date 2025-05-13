import React from 'react';

interface Problem {
  id: string;
  title: string;
  description: string;
}

interface ProblemSelectorProps {
  problems: Problem[];
  selectedProblemId: string;
  onSelectProblem: (problemId: string) => void;
}

export default function ProblemSelector({ problems, selectedProblemId, onSelectProblem }: ProblemSelectorProps) {
  return (
    <div className="problem-selector">
      <h2>問題一覧</h2>
      <div className="problem-list">
        {problems.map(problem => (
          <div
            key={problem.id}
            className={`problem-item ${problem.id === selectedProblemId ? 'selected' : ''}`}
            onClick={() => onSelectProblem(problem.id)}
          >
            <div className="problem-id">{problem.id}</div>
            <div className="problem-title">{problem.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 