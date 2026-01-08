import React from 'react';
import {
  LayoutDashboard,
  List,
  LayoutGrid,
  Calendar,
  GanttChart,
  Settings,
  Moon,
  Sun,
  Plus,
  Minimize2,
  Keyboard
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

export type ViewType = 'dashboard' | 'list' | 'kanban' | 'calendar' | 'gantt' | 'mini';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onNewTask: () => void;
  onShowShortcuts?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onNewTask, onShowShortcuts }) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard' as ViewType, icon: LayoutDashboard, label: 'Dashboard', shortcut: '1' },
    { id: 'list' as ViewType, icon: List, label: 'List View', shortcut: '2' },
    { id: 'kanban' as ViewType, icon: LayoutGrid, label: 'Kanban', shortcut: '3' },
    { id: 'calendar' as ViewType, icon: Calendar, label: 'Calendar', shortcut: '4' },
    { id: 'gantt' as ViewType, icon: GanttChart, label: 'Gantt Chart', shortcut: '5' }
  ];

  return (
    <div className="w-64 h-screen bg-background border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-xl font-semibold text-foreground">Task Manager</h1>
        <p className="text-sm text-muted-foreground mt-1">Notion-inspired workflow</p>
      </div>

      {/* New Task Button */}
      <div className="px-4 mb-4">
        <Button onClick={onNewTask} className="w-full justify-start gap-2">
          <Plus className="w-4 h-4" />
          New Task
          <kbd className="ml-auto text-xs opacity-60">Ctrl+N</kbd>
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                transition-colors duration-150
                ${isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              <kbd className={`text-xs ${isActive ? 'opacity-70' : 'opacity-40'}`}>{item.shortcut}</kbd>
            </button>
          );
        })}
      </nav>

      <Separator />

      {/* Bottom Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => onViewChange('mini')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                     text-muted-foreground hover:bg-accent hover:text-accent-foreground
                     transition-colors duration-150"
        >
          <Minimize2 className="w-5 h-5" />
          <span className="flex-1 text-left">Mini Window</span>
          <kbd className="text-xs opacity-40">M</kbd>
        </button>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                     text-muted-foreground hover:bg-accent hover:text-accent-foreground
                     transition-colors duration-150"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          <span className="flex-1 text-left">{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
        </button>

        {onShowShortcuts && (
          <button
            onClick={onShowShortcuts}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                       text-muted-foreground hover:bg-accent hover:text-accent-foreground
                       transition-colors duration-150"
          >
            <Keyboard className="w-5 h-5" />
            <span className="flex-1 text-left">Shortcuts</span>
            <kbd className="text-xs opacity-40">Ctrl+/</kbd>
          </button>
        )}

        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                     text-muted-foreground hover:bg-accent hover:text-accent-foreground
                     transition-colors duration-150"
        >
          <Settings className="w-5 h-5" />
          <span className="flex-1 text-left">Settings</span>
        </button>
      </div>
    </div>
  );
};