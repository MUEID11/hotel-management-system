import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { CheckCircle2, Info, XCircle, AlertTriangle, X } from 'lucide-react';
import { classNames } from '../utils/format.js';

const NotificationContext = createContext(null);

const STYLES = {
  success: 'border-l-emerald-500 bg-white text-slate-800',
  error: 'border-l-rose-500 bg-white text-slate-800',
  info: 'border-l-sky-500 bg-white text-slate-800',
  warning: 'border-l-amber-500 bg-white text-slate-800',
};

const ICONS = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  error: <XCircle className="h-5 w-5 text-rose-500" />,
  info: <Info className="h-5 w-5 text-sky-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
};

let notificationId = 0;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const dismiss = useCallback((id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((message, type = 'info', timeout = 4200) => {
    const id = notificationId + 1;
    notificationId += 1;
    setNotifications((current) => [...current, { id, message, type }]);
    window.setTimeout(() => dismiss(id), timeout);
  }, [dismiss]);

  const toast = useMemo(() => ({
    success: (message) => notify(message, 'success'),
    error: (message) => notify(message, 'error'),
    info: (message) => notify(message, 'info'),
    warning: (message) => notify(message, 'warning'),
    dismiss,
  }), [notify, dismiss]);

  return (
    <NotificationContext.Provider value={toast}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3"
        aria-live="polite"
      >
        {notifications.map((item) => (
          <div
            key={item.id}
            className={classNames(
              'pointer-events-auto flex items-start gap-3 rounded-lg border-l-4 p-4 shadow-lg',
              STYLES[item.type]
            )}
            role="status"
          >
            <span className="mt-0.5 shrink-0">{ICONS[item.type]}</span>
            <p className="flex-1 text-sm font-medium">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}