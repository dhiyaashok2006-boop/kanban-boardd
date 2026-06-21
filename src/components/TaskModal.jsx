import { useState, useEffect } from "react";
import { useKanban } from "../context/KanbanContext";

const PRIORITIES = ["high", "medium", "low"];
const PRESET_TAGS = ["Frontend", "Backend", "Design", "Research", "Bug", "Setup", "Docs", "Testing"];

export default function TaskModal({ modal, columns, onClose }) {
  const { addTask, updateTask, deleteTask } = useKanban();
  const isView = modal.mode === "view";
  const isEdit = modal.mode === "edit";
  const isAdd = modal.mode === "add";

  const [editing, setEditing] = useState(isAdd || isEdit);
  const [form, setForm] = useState({
    title: modal.task?.title || "",
    description: modal.task?.description || "",
    priority: modal.task?.priority || "medium",
    tags: modal.task?.tags || [],
    deadline: modal.task?.deadline || "",
    colId: modal.colId || "todo",
  });
  const [tagInput, setTagInput] = useState("");

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  function toggleTag(tag) {
    set("tags", form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag]);
  }

  function addCustomTag() {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      set("tags", [...form.tags, t]);
    }
    setTagInput("");
  }

  function handleSubmit() {
    if (!form.title.trim()) return;
    if (isAdd) {
      addTask(form.colId, {
        title: form.title,
        description: form.description,
        priority: form.priority,
        tags: form.tags,
        deadline: form.deadline,
      });
    } else {
      updateTask({
        ...modal.task,
        title: form.title,
        description: form.description,
        priority: form.priority,
        tags: form.tags,
        deadline: form.deadline,
      });
    }
    onClose();
  }

  function handleDelete() {
    if (modal.task) deleteTask(modal.task.id);
    onClose();
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const priorityColors = {
    high: "border-red-500 bg-red-500",
    medium: "border-amber-500 bg-amber-500",
    low: "border-slate-500 bg-slate-500",
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-slate-100 font-semibold text-base">
            {isAdd ? "New task" : editing ? "Edit task" : "Task details"}
          </h2>
          <div className="flex items-center gap-2">
            {isView && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Edit
              </button>
            )}
            {modal.task && (
              <button
                onClick={handleDelete}
                className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Delete
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors text-lg"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Title *</label>
            {editing ? (
              <input
                autoFocus
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="What needs to be done?"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            ) : (
              <p className="text-slate-100 font-medium">{form.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Description</label>
            {editing ? (
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Add details, context, or acceptance criteria..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none"
              />
            ) : (
              <p className="text-slate-400 text-sm leading-relaxed">
                {form.description || <span className="text-slate-600 italic">No description</span>}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  disabled={!editing}
                  onClick={() => set("priority", p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.priority === p
                      ? p === "high" ? "border-red-500 bg-red-900/40 text-red-300"
                        : p === "medium" ? "border-amber-500 bg-amber-900/40 text-amber-300"
                        : "border-slate-500 bg-slate-700 text-slate-300"
                      : "border-slate-700 text-slate-500 hover:border-slate-500"
                  } disabled:cursor-default`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    form.priority === p ? priorityColors[p].split(" ")[1] : "bg-slate-600"
                  }`} />
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Deadline</label>
            {editing ? (
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            ) : (
              <p className="text-slate-400 text-sm">
                {form.deadline
                  ? new Date(form.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                  : <span className="text-slate-600 italic">No deadline</span>
                }
              </p>
            )}
          </div>

          {/* Column (add mode) */}
          {isAdd && (
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Column</label>
              <select
                value={form.colId}
                onChange={(e) => set("colId", e.target.value)}
                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  disabled={!editing}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all disabled:cursor-default ${
                    form.tags.includes(tag)
                      ? "bg-violet-900/50 border-violet-600 text-violet-300"
                      : "border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-400"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {editing && (
              <div className="flex gap-2 mt-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag(); }}}
                  placeholder="Custom tag..."
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-violet-500 transition-colors"
                />
                <button
                  onClick={addCustomTag}
                  className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Created at */}
          {modal.task && (
            <p className="text-slate-600 text-xs pt-1">
              Created {new Date(modal.task.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>

        {/* Footer */}
        {editing && (
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-700 bg-slate-800/50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.title.trim()}
              className="px-5 py-2 text-sm bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isAdd ? "Add task" : "Save changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
