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

interface ResultViewProps {
  result: RunResult | null;
  error: string | null;
}

export default function ResultView({ result, error }: ResultViewProps) {
  const combinedError = error || result?.error || null;
  const hasResults = Boolean(result?.results.length);
  const hasLogs = Boolean(result && (result.stdout || result.stderr));

  return (
    <div className="result-view">
      {combinedError && (
        <div className="error">
          <pre>{combinedError}</pre>
        </div>
      )}

      {result ? (
        <>
          <div className="test-summary">
            {result.summary.total > 0 ? (
              <>
                <span>テスト: {result.summary.passed} / {result.summary.total} 成功</span>
                <span className={`badge ${result.summary.failed === 0 ? 'success' : 'error'}`}>
                  {result.summary.failed === 0 ? '全テスト成功' : `${result.summary.failed} 件失敗`}
                </span>
              </>
            ) : (
              <span className="badge">テストが定義されていません</span>
            )}
          </div>

          {hasResults ? (
            <ul className="test-results">
              {result.results.map((test, index) => (
                <li
                  key={`${test.name}-${index}`}
                  className={`test-result ${test.passed ? 'passed' : 'failed'}`}
                >
                  <span className="status-icon">{test.passed ? '✅' : '❌'}</span>
                  <div>
                    <div className="test-name">{test.name}</div>
                    {!test.passed && test.message && (
                      <div className="test-message">{test.message}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="result-empty">テスト結果はまだありません。</div>
          )}

          {hasLogs && (
            <div className="result-logs">
              {result.stdout && (
                <div className="log-block">
                  <h4>標準出力</h4>
                  <pre>{result.stdout}</pre>
                </div>
              )}
              {result.stderr && (
                <div className="log-block">
                  <h4>標準エラー</h4>
                  <pre>{result.stderr}</pre>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        !combinedError && <div className="result-empty">まだコードを実行していません。</div>
      )}
    </div>
  );
}
