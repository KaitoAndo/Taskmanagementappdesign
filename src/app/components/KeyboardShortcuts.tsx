import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Keyboard } from 'lucide-react';

interface ShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsDialog: React.FC<ShortcutsDialogProps> = ({ open, onClose }) => {
  const shortcuts = [
    { key: 'Ctrl + N', description: 'Create new task' },
    { key: 'Ctrl + K', description: 'Open command palette' },
    { key: 'Ctrl + /', description: 'Toggle keyboard shortcuts' },
    { key: '1-5', description: 'Switch between views (Dashboard, List, Kanban, Calendar, Gantt)' },
    { key: 'M', description: 'Toggle mini window' },
    { key: 'Ctrl + F', description: 'Focus search' },
    { key: 'Esc', description: 'Close dialog or deselect' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-muted text-foreground rounded border border-border">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          Press <kbd className="px-1.5 py-0.5 font-mono bg-muted rounded">Ctrl + /</kbd> anytime to view shortcuts
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const useKeyboardShortcuts = (handlers: {
  onNewTask?: () => void;
  onToggleShortcuts?: () => void;
  onSwitchView?: (view: number) => void;
  onToggleMini?: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + N - New task
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        handlers.onNewTask?.();
      }
      
      // Ctrl + / - Toggle shortcuts
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        handlers.onToggleShortcuts?.();
      }

      // Number keys 1-5 for view switching
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 5) {
          e.preventDefault();
          handlers.onSwitchView?.(num - 1);
        }
      }

      // M for mini window
      if (!e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        handlers.onToggleMini?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};
