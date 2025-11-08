import React, { Component, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

class ErrorBoundary extends Component<{children: ReactNode}, {err?: Error}> {
    // FIX: Replaced the constructor with class property syntax for state initialization.
    // The previous constructor-based approach was causing type inference issues, leading to errors where `state` and `props` were not found on the component instance.
    state: { err?: Error } = { err: undefined };

    static getDerivedStateFromError(error: Error) {
        return { err: error };
    }
    render() {
        if (this.state.err) {
            return (
                <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-word",padding:"16px",border:"1px solid #555",background:"#111",color:"#eee"}}>
                    {String(this.state.err.stack || this.state.err)}
                </pre>
            );
        }
        return this.props.children;
    }
}

const el = document.getElementById("root");
if (!el) throw new Error("Missing #root element in index.html");

createRoot(el).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);