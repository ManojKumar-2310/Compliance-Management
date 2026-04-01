import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const TaskCard = ({ task }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getPriorityColor = (priority) => {
        const colors = {
            High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300',
            Medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300',
            Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300'
        };
        return colors[priority] || '';
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-card p-4 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow mb-3"
        >
            <div className="flex items-start gap-3">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-1"
                >
                    <GripVertical size={20} />
                </button>
                <div className="flex-1">
                    <h3 className="font-semibold mb-2">{task.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>

                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                        </span>

                        {task.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar size={14} />
                                {format(new Date(task.dueDate), 'MMM dd')}
                            </div>
                        )}

                        {task.assignedTo && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User size={14} />
                                {task.assignedTo.name}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const KanbanColumn = ({ title, tasks, status, count }) => {
    const getColumnColor = () => {
        const colors = {
            Pending: 'border-orange-500 bg-orange-50 dark:bg-orange-900/10',
            'In Progress': 'border-blue-500 bg-blue-50 dark:bg-blue-900/10',
            Completed: 'border-green-500 bg-green-50 dark:bg-green-900/10'
        };
        return colors[status] || '';
    };

    return (
        <div className="flex-1 min-w-[300px]">
            <div className={`border-t-4 rounded-t-lg ${getColumnColor()}`}>
                <div className="bg-card p-4 border-x border-b border-border rounded-b-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl lg:text-2xl font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">{title}</h3>
                        <span className="bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">{count}</span>
                    </div>

                    <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3 min-h-[400px]">
                            {tasks.map(task => (
                                <TaskCard key={task._id} task={task} />
                            ))}
                            {tasks.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No tasks</p>
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </div>
            </div>
        </div>
    );
};

const KanbanBoard = ({ tasks: initialTasks }) => {
    const [tasks, setTasks] = useState(initialTasks || []);

    // Sync state with props when initialTasks changes
    useEffect(() => {
        setTasks(initialTasks || []);
    }, [initialTasks]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            // Find the task and the target task's status
            const activeTask = tasks.find(t => t._id === active.id);
            const overTask = tasks.find(t => t._id === over.id);
            
            if (activeTask && overTask && activeTask.status !== overTask.status) {
                // Cross-column drag! Update the status to match the target column.
                let newStatus = overTask.status;
                if (['Rejected', 'Overdue'].includes(newStatus)) newStatus = 'Pending';
                if (newStatus === 'Under Review') newStatus = 'In Progress';
                if (newStatus === 'Completed' || newStatus === 'Submitted') newStatus = 'Approved';
                
                try {
                    // Optimistic update locally
                    setTasks(items => items.map(item => 
                        item._id === active.id ? { ...item, status: newStatus } : item
                    ));
                    // Send API request to persist
                    const api = require('../../api/axios').default;
                    await api.put(`/tasks/${active.id}`, { status: newStatus });
                } catch (error) {
                    console.error('Failed to update task status:', error);
                }
            } else {
                setTasks((items) => {
                    const oldIndex = items.findIndex(item => item._id === active.id);
                    const newIndex = items.findIndex(item => item._id === over.id);
                    return arrayMove(items, oldIndex, newIndex);
                });
            }
        }
    };

    const pendingTasks = tasks.filter(t => ['Pending', 'Rejected', 'Overdue'].includes(t.status));
    const inProgressTasks = tasks.filter(t => ['In Progress', 'Under Review'].includes(t.status));
    const completedTasks = tasks.filter(t => ['Approved', 'Completed', 'Submitted'].includes(t.status));

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tight mb-2">Task Board</h1>
                <p className="text-muted-foreground">Drag and drop tasks to update their status</p>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="flex gap-6 overflow-x-auto pb-4">
                    <KanbanColumn
                        title="Pending"
                        tasks={pendingTasks}
                        status="Pending"
                        count={pendingTasks.length}
                    />
                    <KanbanColumn
                        title="In Progress"
                        tasks={inProgressTasks}
                        status="In Progress"
                        count={inProgressTasks.length}
                    />
                    <KanbanColumn
                        title="Completed"
                        tasks={completedTasks}
                        status="Completed"
                        count={completedTasks.length}
                    />
                </div>
            </DndContext>
        </div>
    );
};

export default KanbanBoard;
