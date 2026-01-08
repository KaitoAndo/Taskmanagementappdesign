import React, { useMemo } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { TaskCard } from '../TaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { Task } from '../../types/task';

export const DashboardView: React.FC<{
  onEditTask: (task: Task) => void;
}> = ({ onEditTask }) => {
  const { getAllTasks, getTodayTasks, getOverdueTasks, toggleTaskComplete, deleteTask } = useTaskContext();

  const allTasks = getAllTasks();
  const todayTasks = getTodayTasks();
  const overdueTasks = getOverdueTasks();

  // Calculate statistics
  const stats = useMemo(() => {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.completed).length;
    const inProgress = allTasks.filter(t => t.status === 'in-progress').length;
    const todo = allTasks.filter(t => t.status === 'todo').length;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      todo,
      today: todayTasks.length,
      overdue: overdueTasks.length,
      progressPercentage
    };
  }, [allTasks, todayTasks, overdueTasks]);

  // Status distribution for pie chart
  const statusData = useMemo(() => [
    { name: 'To Do', value: allTasks.filter(t => t.status === 'todo').length, color: '#94a3b8' },
    { name: 'In Progress', value: allTasks.filter(t => t.status === 'in-progress').length, color: '#3b82f6' },
    { name: 'Review', value: allTasks.filter(t => t.status === 'review').length, color: '#8b5cf6' },
    { name: 'Completed', value: allTasks.filter(t => t.status === 'completed').length, color: '#10b981' }
  ].filter(item => item.value > 0), [allTasks]);

  // Priority distribution for bar chart
  const priorityData = useMemo(() => [
    { name: 'Low', count: allTasks.filter(t => t.priority === 'low').length },
    { name: 'Medium', count: allTasks.filter(t => t.priority === 'medium').length },
    { name: 'High', count: allTasks.filter(t => t.priority === 'high').length },
    { name: 'Urgent', count: allTasks.filter(t => t.priority === 'urgent').length }
  ], [allTasks]);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Your task overview and statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Progress
            </CardTitle>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.progressPercentage}%</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.completed} of {stats.total} tasks completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Tasks
            </CardTitle>
            <Clock className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.today}</div>
            <p className="text-sm text-muted-foreground mt-1">Due today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Tasks
            </CardTitle>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.overdue}</div>
            <p className="text-sm text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <ListTodo className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.inProgress}</div>
            <p className="text-sm text-muted-foreground mt-1">Active tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Today's Tasks</h3>
        {todayTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No tasks due today</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onEditTask(task)}
                onToggleComplete={() => toggleTaskComplete(task.id)}
                onEdit={() => onEditTask(task)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Overdue Tasks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overdueTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onEditTask(task)}
                onToggleComplete={() => toggleTaskComplete(task.id)}
                onEdit={() => onEditTask(task)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
