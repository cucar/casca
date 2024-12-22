import { useState } from 'react';
import './App.css';

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
      const response = await fetch('http://localhost:3000/api/extract', { method: 'POST', body: formData });

      if (!response.ok) {
        throw new Error('Failed to process file');
      }

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
      <h1>Bank Statement Extractor</h1>
      
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
          {loading ? 'Processing...' : 'Extract Data'}
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

      {result && (
        <div className="results">
          <h2>Extracted Data</h2>
          
          {result.transactions?.length > 0 && (
            <div className="transactions">
              <h3>Transactions</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {result.transactions.map((tx, i) => (
                    <tr key={i}>
                      <td>{tx.date}</td>
                      <td>{tx.description}</td>
                      <td>{tx.category}</td>
                      <td>{tx.type}</td>
                      <td>${tx.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.checks?.length > 0 && (
            <div className="checks">
              <h3>Checks</h3>
              <table>
                <thead>
                  <tr>
                    <th>Check #</th>
                    <th>Date</th>
                    <th>Payee</th>
                    <th>For</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {result.checks.map((check, i) => (
                    <tr key={i}>
                      <td>{check.checkNumber}</td>
                      <td>{check.date}</td>
                      <td>{check.payee}</td>
                      <td>{check.for}</td>
                      <td>${check.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
