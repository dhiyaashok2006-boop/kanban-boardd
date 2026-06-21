import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanProvider, useKanban } from "./context/KanbanContext";
import Column from "./components/Column";
import TaskModal from "./components/TaskModal";
import TaskCard from "./components/TaskCard";

const COLUMNS = [
  { id: "todo", label: "To Do", color: "blue" },
  { id: "inprogress", label: "In Progress", color: "amber" },
  { id: "done", label: "Done", color: "green" },
];

function Board() {
  const { tasks, moveTask, reorderTask, findTaskCol } = useKanban();
  const [modal, setModal] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const totalTasks = Object.values(tasks).flat().length;
  const doneTasks = tasks.done?.length || 0;

  function handleDragStart(event) {
    const { active } = event;
    const col = findTaskCol(active.id);
    if (col) {
      const task = tasks[col].find((t) => t.id === active.id);
      setActiveTask(task);
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const fromCol = findTaskCol(activeId);
    if (!fromCol) return;

    // Check if dropped over a column (empty column drop)
    const isOverCol = COLUMNS.some((c) => c.id === overId);
    if (isOverCol) {
      const toCol = overId;
      if (fromCol !== toCol) {
        moveTask(activeId, fromCol, toCol);
      }
      return;
    }

    // Dropped over another task
    const toCol = findTaskCol(overId);
    if (!toCol) return;

    if (fromCol === toCol) {
      // Reorder within same column
      const oldIndex = tasks[fromCol].findIndex((t) => t.id === activeId);
      const newIndex = tasks[toCol].findIndex((t) => t.id === overId);
      if (oldIndex !== newIndex) {
        reorderTask(fromCol, oldIndex, newIndex);
      }
    } else {
      // Move to different column, place before/at the over task
      const overIndex = tasks[toCol].findIndex((t) => t.id === overId);
      moveTask(activeId, fromCol, toCol, overIndex);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <header className="border-b border-slate-700 bg-slate-900/60 backdrop-blur sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-sm font-bold">K</div>
              <h1 className="text-xl font-semibold tracking-tight">Kanban Board</h1>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <span>{totalTasks} tasks · {doneTasks} done</span>
              <button
                onClick={() => setModal({ mode: "add", colId: "todo" })}
                className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                + New task
              </button>
            </div>
          </div>
        </header>

        {/* Board */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map((col) => (
              <Column
                key={col.id}
                col={col}
                tasks={tasks[col.id] || []}
                onAddTask={() => setModal({ mode: "add", colId: col.id })}
                onViewTask={(task) => setModal({ mode: "view", task })}
                onEditTask={(task) => setModal({ mode: "edit", task })}
              />
            ))}
          </div>
        </main>

        {/* Modal */}
        {modal && (
          <TaskModal
            modal={modal}
            columns={COLUMNS}
            onClose={() => setModal(null)}
          />
        )}
      </div>

      {/* Drag overlay — ghost card while dragging */}
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 scale-105 opacity-90">
            <TaskCard task={activeTask} onView={() => {}} onEdit={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default function App() {
  return (
    <KanbanProvider>
      <Board />
    </KanbanProvider>
  );
}
