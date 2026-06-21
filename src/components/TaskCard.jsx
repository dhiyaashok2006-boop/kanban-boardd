import { useKanban } from "../context/KanbanContext";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PRIORITY = {
  high:   { label: "High",   cls: "bg-red-900/50 text-red-300 border border-red-700/50" },
  medium: { label: "Medium", cls: "bg-amber-900/50 text-amber-300 border border-amber-700/50" },
  low:    { label: "Low",    cls: "bg-slate-700/60 text-slate-400 border border-slate-600/50" },
};

const TAG_COLORS = [
  "bg-violet-900/50 text-violet-300",
  "bg-blue-900/50 text-blue-300",
  "bg-teal-900/50 text-teal-300",
  "bg-pink-900/50 text-pink-300",
  "bg-orange-900/50 text-orange-300",
];

function tagColor(tag) {
  let hash = 0;
  for (const c of tag) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

function isOverdue(deadline) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export default function TaskCard({ task, onView, onEdit }) {
  const { deleteTask } = useKanban();
  const pr = PRIORITY[task.priority] || PRIORITY.medium;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  const overdue = isOverdue(task.deadline);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-slate-800/80 border rounded-xl p-3.5 transition-all duration-150 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 ${
        isDragging ? "shadow-2xl scale-105 border-violet-500" : "border-slate-700 hover:border-slate-500"
      }`}
    >
      {/* Top row: priority + drag handle + actions */}
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pr.cls}`}>
          {pr.label}
        </span>
        <div className="flex gap-1 items-center">
          {/* Drag handle */}
          <span
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 px-1 py-0.5 rounded select-none"
            title="Drag to move"
          >
            ⠿
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              onClick={onEdit}
              className="text-slate-500 hover:text-slate-200 text-xs px-1.5 py-0.5 rounded hover:bg-slate-700 transition-colors"
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-slate-500 hover:text-red-400 text-xs px-1.5 py-0.5 rounded hover:bg-slate-700 transition-colors"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-slate-100 text-sm font-medium leading-snug mb-1.5 cursor-pointer hover:text-violet-300 transition-colors"
        onClick={onView}
      >
        {task.title}
      </h3>

      {/* Description preview */}
      {task.description && (
        <p className="text-slate-500 text-xs leading-relaxed mb-2.5 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag) => (
            <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${tagColor(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
        <span className="text-slate-600 text-xs">
          {new Date(task.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
        {task.deadline && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${overdue ? "bg-red-900/50 text-red-300" : "bg-slate-700/60 text-slate-400"}`}>
            {overdue ? "⚠️ " : "📅 "}
            {new Date(task.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
}
