import { useEffect, useState } from 'react';
import type { IpcRendererEvent } from 'electron';

/**
 * Custom window title bar. The app runs frameless (see main.ts), so this strip
 * provides the draggable region and — on Windows/Linux — branded minimize /
 * maximize / close controls. On macOS the native traffic lights are used, so we
 * only render the draggable region there.
 */
export default function TitleBar() {
  const isMac = (window?.electron?.platform || 'darwin') === 'darwin';
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (isMac) return;
    window.electron.windowIsMaximized?.().then(setIsMaximized).catch(() => {});
    const handler = (_event: IpcRendererEvent, ...args: unknown[]) =>
      setIsMaximized(Boolean(args[0]));
    window.electron.on('window-maximized-change', handler);
    return () => window.electron.off('window-maximized-change', handler);
  }, [isMac]);

  if (isMac) {
    return <div className="titlebar-drag-region" />;
  }

  return (
    <div
      dir="ltr"
      className="window-titlebar relative z-50 flex h-8 shrink-0 items-center bg-background-secondary"
    >
      <div className="flex-1" />
      <div className="no-drag flex h-full items-stretch">
        <button
          type="button"
          aria-label="Minimize"
          onClick={() => window.electron.windowMinimize?.()}
          className="flex w-12 items-center justify-center text-text-secondary transition-colors hover:bg-background-tertiary hover:text-text-primary"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <rect x="0" y="4.5" width="10" height="1" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Maximize"
          onClick={() => window.electron.windowMaximizeToggle?.()}
          className="flex w-12 items-center justify-center text-text-secondary transition-colors hover:bg-background-tertiary hover:text-text-primary"
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <rect x="0" y="2.5" width="7" height="7" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M2.5 2.5 V0.5 H9.5 V7.5 H7.5" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          )}
        </button>
        <button
          type="button"
          aria-label="Close"
          onClick={() => window.electron.closeWindow()}
          className="flex w-12 items-center justify-center text-text-secondary transition-colors hover:bg-red-600 hover:text-white"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M0 0 L10 10 M10 0 L0 10" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
