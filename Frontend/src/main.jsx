import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import './styles/admin.css';
import App from './App';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('App Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: '#080d1a', color: '#edf2ff',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '40px', fontFamily: 'monospace'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⚠️ App Error</div>
          <div style={{
            background: 'rgba(239,100,121,0.15)', border: '1px solid rgba(239,100,121,0.4)',
            borderRadius: '12px', padding: '20px', maxWidth: '700px', width: '100%',
            fontSize: '0.85rem', color: '#ef6479', whiteSpace: 'pre-wrap', wordBreak: 'break-all'
          }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.info?.componentStack}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px', padding: '12px 28px', background: '#6c53e8',
              border: 'none', borderRadius: '8px', color: '#fff',
              cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700
            }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
