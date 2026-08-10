import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#f6f3ec', fontFamily: "'JetBrains Mono', monospace",
        }}>
          <div style={{
            background: '#ffffff', border: '2.5px solid #141414', borderRadius: '12px',
            padding: '32px', boxShadow: '6px 6px 0 #141414', textAlign: 'center', maxWidth: '400px',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#141414', margin: '0 0 8px' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#6f6a5e', margin: '0 0 16px' }}>
              The page crashed. Try refreshing.
            </p>
            <button onClick={() => window.location.reload()}
              style={{
                background: '#141414', color: '#f6f3ec', border: '2.5px solid #141414',
                borderRadius: '8px', padding: '10px 24px', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', boxShadow: '4px 4px 0 rgba(0,0,0,0.25)',
              }}>
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
