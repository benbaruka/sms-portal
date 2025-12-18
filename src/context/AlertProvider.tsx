"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import Alert from "@/components/ui/alert/Alert";
type AlertType = "success" | "error" | "info" | "warning";
interface AlertData {
  id: number;
  variant: AlertType;
  title: string;
  message: string;
  showLink?: boolean;
  linkHref?: string;
  linkText?: string;
}
interface AlertContextType {
  showAlert: (alert: Omit<AlertData, "id">) => void;
  dismissAlert: (id: number) => void;
}
const AlertContext = createContext<AlertContextType | undefined>(undefined);
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within AlertProvider");
  return context;
};
export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const MAX_ALERTS = 3; // Limite le nombre de toasts affichés simultanément
  const timeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const idCounter = useRef(0);

  // Nettoyer tous les timeouts lors du démontage
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
      timeouts.clear();
    };
  }, []);

  const dismissAlert = useCallback((id: number) => {
    // Nettoyer le timeout si l'alerte est fermée manuellement
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const showAlert = useCallback((alert: Omit<AlertData, "id">) => {
    const id = ++idCounter.current;
    setAlerts((prev) => {
      // Garde seulement les MAX_ALERTS plus récents
      const updated = [...prev, { ...alert, id }];

      // Si on dépasse la limite, nettoyer les timeouts des alertes supprimées
      if (updated.length > MAX_ALERTS) {
        const removedIds = updated.slice(0, updated.length - MAX_ALERTS).map((a) => a.id);

        removedIds.forEach((removedId) => {
          const timeout = timeoutsRef.current.get(removedId);
          if (timeout) {
            clearTimeout(timeout);
            timeoutsRef.current.delete(removedId);
          }
        });
      }

      return updated.slice(-MAX_ALERTS);
    });
    // Fermeture automatique après 5 secondes
    const timeout = setTimeout(() => {
      timeoutsRef.current.delete(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 5000);
    timeoutsRef.current.set(id, timeout);
  }, []);
  return (
    <AlertContext.Provider value={{ showAlert, dismissAlert }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[999999] w-[300px] space-y-3">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            id={alert.id}
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
            showLink={alert.showLink}
            linkHref={alert.linkHref}
            linkText={alert.linkText}
            onDismiss={dismissAlert}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
};
