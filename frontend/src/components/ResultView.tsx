interface ResultViewProps {
  output: string;
  error: string | null;
}

export default function ResultView({ output, error }: ResultViewProps) {
  return (
    <div className="result-view">
      <h3>実行結果</h3>
      {error ? (
        <div className="error">
          <pre>{error}</pre>
        </div>
      ) : (
        <div className="output">
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
} 