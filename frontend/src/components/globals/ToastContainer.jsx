import useToastStore from '../../store/useToastStore.js';
import styles from './ToastContainer.module.css';

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (!toasts.length) return null;

  return (
    <div
      className={styles.container}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type] || ''}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
