import React, { useMemo } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { Task, TaskStatus } from '../../types/task';
import { TaskCard } from '../TaskCard';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

const ITEM_TYPE = 'TASK';

interface DraggableTaskCardProps {
  task: Task;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  onEditTask,
  onToggleComplete,
  onDelete
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-move"
    >
      <TaskCard
        task={task}
        onClick={() => onEditTask(task)}
        onToggleComplete={() => onToggleComplete(task.id)}
        onEdit={() => onEditTask(task)}
        onDelete={() => onDelete(task.id)}
        compact
      />
    </div>
  );
};

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onDrop: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onAddTask: (status: TaskStatus) => void;
}

const statusColors: Record<TaskStatus, string> = {
  'todo': 'bg-gray-100 dark:bg-gray-800',
  'in-progress': 'bg-blue-50 dark:bg-blue-950',
  'review': 'bg-purple-50 dark:bg-purple-950',
  'completed': 'bg-green-50 dark:bg-green-950'
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  onDrop,
  onEditTask,
  onToggleComplete,
  onDelete,
  onAddTask
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: string; status: TaskStatus }) => {
      if (item.status !== status) {
        onDrop(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  return (
    <div
      ref={drop}
      className={`
        flex flex-col h-full rounded-lg border border-border
        ${statusColors[status]}
        ${isOver ? 'ring-2 ring-primary' : ''}
        transition-all
      `}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{tasks.length} tasks</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddTask(status)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {tasks.map(task => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onEditTask={onEditTask}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};

export const KanbanView: React.FC<{
  onEditTask: (task: Task) => void;
  onNewTaskWithStatus: (status: TaskStatus) => void;
}> = ({ onEditTask, onNewTaskWithStatus }) => {
  const { getAllTasks, updateTask, toggleTaskComplete, deleteTask } = useTaskContext();

  const allTasks = getAllTasks();

  const tasksByStatus = useMemo(() => {
    return {
      todo: allTasks.filter(t => t.status === 'todo'),
      'in-progress': allTasks.filter(t => t.status === 'in-progress'),
      review: allTasks.filter(t => t.status === 'review'),
      completed: allTasks.filter(t => t.status === 'completed')
    };
  }, [allTasks]);

  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  const columns: Array<{ status: TaskStatus; title: string }> = [
    { status: 'todo', title: 'To Do' },
    { status: 'in-progress', title: 'In Progress' },
    { status: 'review', title: 'Review' },
    { status: 'completed', title: 'Completed' }
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-border">
          <h2 className="text-3xl font-semibold text-foreground">Kanban Board</h2>
          <p className="text-muted-foreground mt-1">Drag and drop tasks between columns</p>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="grid grid-cols-4 gap-4 h-full">
            {columns.map(column => (
              <KanbanColumn
                key={column.status}
                status={column.status}
                title={column.title}
                tasks={tasksByStatus[column.status]}
                onDrop={handleDrop}
                onEditTask={onEditTask}
                onToggleComplete={toggleTaskComplete}
                onDelete={deleteTask}
                onAddTask={onNewTaskWithStatus}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
