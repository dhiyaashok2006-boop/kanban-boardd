import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

const COL_STYLES = {
  blue:  { header: "text-blue-400",  badge: "bg-blue-900/50 text-blue-300",  line: "bg-blue-500",  drop: "border-violet-500 bg-violet-500/5" },
  amber: { header: "text-amber-400", badge: "bg-amber-900/50 text-amber-300", line: "bg-amber-500", drop: "border-violet-500 bg-violet-500/5" },
  green: { header: "text-green-400", badge: "bg-green-900/50 text-green-300", line: "bg-green-500", drop: "border-violet-500 bg-violet-500/5" },
};

export default function Column({ col, tasks, onAddTask, onViewTask, onEditTask }) {
  const st = COL_STYLES[col.color];

  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div className="flex flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${st.line}`} />
          <h2 className={`font-semibold text-sm uppercase tracking-widest ${st.header}`}>
            {col.label}
          </h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.badge}`}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="text-slate-500 hover:text-slate-300 text-xl leading-none transition-colors"
          title="Add task"
        >
          +
        </button>
      </div>

      {/* Drop zone */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`min-h-64 rounded-xl border-2 transition-all duration-150 p-2 flex flex-col gap-2 ${
            isOver ? `border-dashed ${st.drop}` : "border-transparent"
          }`}
        >
          {tasks.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-slate-600 text-sm py-8">
              {isOver ? "Drop here" : "No tasks yet"}
            </div>
          )}
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              colId={col.id}
              onView={() => onViewTask(task)}
              onEdit={() => onEditTask(task)}
            />
          ))}

          {/* Add task button at bottom */}
          <button
            onClick={onAddTask}
            className="w-full mt-1 py-2 rounded-lg border border-dashed border-slate-700 hover:border-slate-500 text-slate-600 hover:text-slate-400 text-sm transition-colors"
          >
            + Add task
          </button>
        </div>
      </SortableContext>
    </div>
  );
}
