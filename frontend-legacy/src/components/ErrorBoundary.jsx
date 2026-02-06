import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', backgroundColor: '#ffebee', color: '#b71c1c', border: '2px solid red', margin: '20px', borderRadius: '8px' }}>
                    <h1>⚠️ Algo salió mal.</h1>
                    <p>Por favor, envía una captura de este mensaje al desarrollador.</p>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
                        <summary>Ver detalles del error</summary>
                        <p style={{ fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</p>
                        <p>{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
                    </details>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#b71c1c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Volver al Inicio
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
