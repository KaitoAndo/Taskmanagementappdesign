import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import { Sidebar, ViewType } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { ListView } from './components/views/ListView';
import { KanbanView } from './components/views/KanbanView';
import { CalendarView } from './components/views/CalendarView';
import { GanttView } from './components/views/GanttView';
import { MiniWindow } from './components/views/MiniWindow';
import { TaskModal } from './components/TaskModal';
import { KeyboardShortcutsDialog, useKeyboardShortcuts } from './components/KeyboardShortcuts';
import { WelcomeTour, useWelcomeTour } from './components/WelcomeTour';
import { Task, TaskStatus } from './types/task';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus | null>(null);

  const { addTask, updateTask, addSubtask } = useTaskContext();
  const { showTour, completeTour } = useWelcomeTour();

  // Keyboard shortcuts
  const views: ViewType[] = ['dashboard', 'list', 'kanban', 'calendar', 'gantt'];
  useKeyboardShortcuts({
    onNewTask: handleNewTask,
    onToggleShortcuts: () => setIsShortcutsOpen(prev => !prev),
    onSwitchView: (index) => {
      if (index >= 0 && index < views.length) {
        setCurrentView(views[index]);
      }
    },
    onToggleMini: () => setCurrentView(prev => prev === 'mini' ? 'dashboard' : 'mini')
  });

  function handleNewTask() {
    setEditingTask(null);
    setNewTaskStatus(null);
    setIsTaskModalOpen(true);
  }

  const handleNewTaskWithStatus = (status: TaskStatus) => {
    setEditingTask(null);
    setNewTaskStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskStatus(null);
    setIsTaskModalOpen(true);
  };

  const handleAddSubtask = (parentId: string) => {
    // For simplicity, we'll handle this through the modal with a note
    // In a full implementation, you'd want a separate subtask modal
    toast.info('Edit the parent task to add subtasks');
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      toast.success('Task updated successfully');
    } else {
      const finalTaskData = {
        ...taskData,
        status: newTaskStatus || taskData.status || 'todo'
      };
      addTask(finalTaskData as any);
      toast.success('Task created successfully');
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setNewTaskStatus(null);
  };

  const handleMaximize = () => {
    setCurrentView('dashboard');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onEditTask={handleEditTask} />;
      case 'list':
        return <ListView onEditTask={handleEditTask} onAddSubtask={handleAddSubtask} />;
      case 'kanban':
        return <KanbanView onEditTask={handleEditTask} onNewTaskWithStatus={handleNewTaskWithStatus} />;
      case 'calendar':
        return <CalendarView onEditTask={handleEditTask} />;
      case 'gantt':
        return <GanttView onEditTask={handleEditTask} />;
      case 'mini':
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
            <MiniWindow onMaximize={handleMaximize} />
          </div>
        );
      default:
        return <DashboardView onEditTask={handleEditTask} />;
    }
  };

  if (currentView === 'mini') {
    return (
      <>
        {renderView()}
        <TaskModal
          open={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
            setNewTaskStatus(null);
          }}
          onSave={handleSaveTask}
          task={editingTask}
          mode={editingTask ? 'edit' : 'create'}
        />
      </>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onNewTask={handleNewTask}
        onShowShortcuts={() => setIsShortcutsOpen(true)}
      />
      
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>

      <TaskModal
        open={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setNewTaskStatus(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        mode={editingTask ? 'edit' : 'create'}
      />

      <KeyboardShortcutsDialog
        open={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <WelcomeTour
        open={showTour}
        onClose={() => completeTour()}
      />

      <Toaster position="top-right" />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </ThemeProvider>
  );
}