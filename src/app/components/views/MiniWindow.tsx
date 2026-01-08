import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { X, Plus, CheckCircle2, Circle, Maximize2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Task } from '../../types/task';
import { format } from 'date-fns';

export const MiniWindow: React.FC<{
  onMaximize: () => void;
}> = ({ onMaximize }) => {
  const { getTodayTasks, addTask, toggleTaskComplete } = useTaskContext();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const todayTasks = getTodayTasks();

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle,
        description: '',
        notes: '',
        priority: 'medium',
        status: 'todo',
        tags: [],
        colorLabel: null,
        dueDate: new Date(),
        startDate: new Date(),
        duration: 1,
        parentId: null,
        order: 0,
        completed: false
      });
      setNewTaskTitle('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  return (
    <div className="w-96 h-[500px] bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/50 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Quick Tasks</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onMaximize}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Add */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex gap-2">
          <Input
            placeholder="Add a quick task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleAddTask} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-2 text-sm text-muted-foreground">
          Today's Tasks ({todayTasks.length})
        </div>
        
        {todayTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No tasks for today
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.map(task => (
              <div
                key={task.id}
                className={`
                  p-3 rounded-lg border border-border bg-card
                  hover:shadow-md transition-all
                  ${task.completed ? 'opacity-60' : ''}
                `}
                style={{
                  borderLeft: task.colorLabel ? `3px solid ${task.colorLabel}` : undefined
                }}
              >
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground capitalize">
                        {task.priority}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        •
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border bg-muted/30 text-center">
        <button
          onClick={onMaximize}
          className="text-sm text-primary hover:underline"
        >
          Open full app
        </button>
      </div>
    </div>
  );
};
