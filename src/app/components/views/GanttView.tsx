import React, { useMemo, useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { Task } from '../../types/task';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

export const GanttView: React.FC<{
  onEditTask: (task: Task) => void;
}> = ({ onEditTask }) => {
  const { getAllTasks } = useTaskContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const allTasks = getAllTasks();

  // Filter tasks with dates
  const tasksWithDates = useMemo(() => {
    return allTasks.filter(task => task.startDate && task.dueDate);
  }, [allTasks]);

  // Calculate timeline range
  const { timelineStart, timelineEnd, totalDays } = useMemo(() => {
    if (tasksWithDates.length === 0) {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      return {
        timelineStart: start,
        timelineEnd: end,
        totalDays: differenceInDays(end, start) + 1
      };
    }

    const dates = tasksWithDates.flatMap(task => [
      task.startDate ? new Date(task.startDate) : null,
      task.dueDate ? new Date(task.dueDate) : null
    ].filter(Boolean) as Date[]);

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Add some padding
    const start = addDays(minDate, -7);
    const end = addDays(maxDate, 7);

    return {
      timelineStart: start,
      timelineEnd: end,
      totalDays: differenceInDays(end, start) + 1
    };
  }, [tasksWithDates, currentMonth]);

  // Generate timeline days
  const timelineDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < totalDays; i++) {
      days.push(addDays(timelineStart, i));
    }
    return days;
  }, [timelineStart, totalDays]);

  const getTaskPosition = (task: Task) => {
    if (!task.startDate) return null;

    const start = new Date(task.startDate);
    const daysFromStart = differenceInDays(start, timelineStart);
    const duration = task.duration || 1;

    const leftPercent = (daysFromStart / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`
    };
  };

  const priorityColors: Record<string, string> = {
    low: '#3b82f6',
    medium: '#f59e0b',
    high: '#f97316',
    urgent: '#ef4444'
  };

  const navigatePrev = () => {
    setCurrentMonth(prev => addDays(prev, -30));
  };

  const navigateNext = () => {
    setCurrentMonth(prev => addDays(prev, 30));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-8 pb-6 border-b border-border">
        <h2 className="text-3xl font-semibold text-foreground">Gantt Chart</h2>
        <p className="text-muted-foreground mt-1">Timeline and task duration visualization</p>
      </div>

      {/* Controls */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={navigatePrev}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={navigateNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="ml-4 text-lg font-semibold">
            {format(timelineStart, 'MMM d')} - {format(timelineEnd, 'MMM d, yyyy')}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {tasksWithDates.length} tasks with dates
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[1200px]">
          {/* Timeline Header */}
          <div className="flex sticky top-0 z-10 bg-background border-b border-border">
            <div className="w-64 flex-shrink-0 p-4 border-r border-border font-semibold">
              Task
            </div>
            <div className="flex-1 flex">
              {timelineDays.map((day, index) => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const isMonthStart = day.getDate() === 1;

                return (
                  <div
                    key={index}
                    className={`
                      flex-1 min-w-[40px] p-2 text-center text-xs border-r border-border
                      ${isWeekend ? 'bg-muted/30' : ''}
                      ${isMonthStart ? 'border-l-2 border-l-primary' : ''}
                    `}
                  >
                    <div className="font-medium">{format(day, 'd')}</div>
                    {isMonthStart && (
                      <div className="text-muted-foreground">{format(day, 'MMM')}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tasks */}
          {tasksWithDates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No tasks with start and due dates
            </div>
          ) : (
            <div>
              {tasksWithDates.map(task => {
                const position = getTaskPosition(task);
                if (!position) return null;

                return (
                  <div
                    key={task.id}
                    className="flex border-b border-border hover:bg-accent/30 transition-colors"
                  >
                    {/* Task Info */}
                    <div className="w-64 flex-shrink-0 p-4 border-r border-border">
                      <button
                        onClick={() => onEditTask(task)}
                        className="text-left w-full hover:text-primary transition-colors"
                      >
                        <div className={`font-medium text-sm ${task.completed ? 'line-through opacity-60' : ''}`}>
                          {task.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {task.duration} day{task.duration !== 1 ? 's' : ''}
                        </div>
                      </button>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 relative h-16">
                      {/* Background grid */}
                      <div className="absolute inset-0 flex">
                        {timelineDays.map((day, index) => {
                          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                          return (
                            <div
                              key={index}
                              className={`flex-1 min-w-[40px] border-r border-border ${isWeekend ? 'bg-muted/20' : ''}`}
                            />
                          );
                        })}
                      </div>

                      {/* Task bar */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-8 rounded-md cursor-pointer
                                   hover:opacity-80 transition-all shadow-sm hover:shadow-md
                                   flex items-center px-3"
                        style={{
                          left: position.left,
                          width: position.width,
                          backgroundColor: task.colorLabel || priorityColors[task.priority],
                          minWidth: '60px'
                        }}
                        onClick={() => onEditTask(task)}
                      >
                        <span className="text-xs font-medium text-white truncate">
                          {task.title}
                        </span>
                      </div>

                      {/* Today indicator */}
                      {(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const daysFromStart = differenceInDays(today, timelineStart);
                        if (daysFromStart >= 0 && daysFromStart < totalDays) {
                          const leftPercent = (daysFromStart / totalDays) * 100;
                          return (
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                              style={{ left: `${leftPercent}%` }}
                            >
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center gap-6 text-sm">
          <span className="text-muted-foreground font-medium">Priority:</span>
          {Object.entries(priorityColors).map(([priority, color]) => (
            <div key={priority} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
              <span className="capitalize">{priority}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-0.5 h-4 bg-red-500" />
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};
