import { createContext, useCallback, useContext, useState, ReactNode } from "react";

interface Toast { id: number; message: string; type: "success" | "error" | "info"; }
interface ToastContextValue { showToast: (message: string, type?: Toast["type"]) => void; }

const ToastContext = createContext<ToastContextValue | undefined>(undefined);
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: "fixed", bottom: 20, right: 20, display: "flex", flexDirection: "column", gap: 8, zIndex: 100 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: "12px 18px", borderRadius: 8, color: "white", fontSize: 14, fontWeight: 500,
              minWidth: 220, boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              background: t.type === "success" ? "#2E7D4F" : t.type === "error" ? "#B23A34" : "#2E5C8A",
              animation: "toast-in 0.2s ease",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
