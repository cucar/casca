import { useState } from 'react';
import './App.css';
import { TransactionSummary } from './TransactionSummary';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('statement', file);

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/extract', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to process file');
      const result = await response.json();
      if (result.error) throw new Error(result.error); // show error if there is one
      setResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Bank Statement Analyzer</h1>
      <p>
        Please select a bank statement by clicking the button below and click Submit button to get a summary of the transactions. 
        It may take 1-2 minutes for a new statement to be analyzed.
      </p>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-input-container">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            id="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            {file ? file.name : 'Choose a file'}
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading || !file}
          className="submit-button"
        >
          {loading ? 'Processing...' : 'Submit'}
        </button>

        {loading && (
          <div className="progress-container">
            <progress className="progress-bar" />
          </div>
        )}
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading && result && (
        <div className="results">
          {result.transactions?.length > 0 && (
            <TransactionSummary transactions={result.transactions} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
