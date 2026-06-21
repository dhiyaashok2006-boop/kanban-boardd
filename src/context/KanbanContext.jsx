import { createContext, useContext, useEffect, useReducer } from "react";

const KanbanContext = createContext(null);

const INITIAL = {
  todo: [
    {
      id: "1",
      title: "Design system setup",
      description: "Define colors, typography, and spacing tokens for the project.",
      priority: "high",
      tags: ["Design"],
      deadline: "",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "User research",
      description: "Interview 5 users about pain points in the current workflow.",
      priority: "medium",
      tags: ["Research"],
      deadline: "",
      createdAt: new Date().toISOString(),
    },
  ],
  inprogress: [
    {
      id: "3",
      title: "Build dashboard layout",
      description: "Create the main dashboard with sidebar and header components.",
      priority: "high",
      tags: ["Frontend"],
      deadline: "",
      createdAt: new Date().toISOString(),
    },
  ],
  done: [
    {
      id: "4",
      title: "Project scaffolding",
      description: "Initialize repo, configure Vite, Tailwind, and ESLint.",
      priority: "low",
      tags: ["Setup"],
      deadline: "",
      createdAt: new Date().toISOString(),
    },
  ],
};

function loadFromStorage() {
  try {
    const saved = localStorage.getItem("kanban-tasks");
    return saved ? JSON.parse(saved) : INITIAL;
  } catch {
    return INITIAL;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TASK": {
      const { colId, task } = action;
      return { ...state, [colId]: [...(state[colId] || []), task] };
    }
    case "UPDATE_TASK": {
      const { task } = action;
      const newState = {};
      for (const col in state) {
        newState[col] = state[col].map((t) => (t.id === task.id ? task : t));
      }
      return newState;
    }
    case "DELETE_TASK": {
      const { taskId } = action;
      const newState = {};
      for (const col in state) {
        newState[col] = state[col].filter((t) => t.id !== taskId);
      }
      return newState;
    }
    case "MOVE_TASK": {
      const { taskId, fromCol, toCol, overIndex } = action;
      const task = state[fromCol]?.find((t) => t.id === taskId);
      if (!task) return state;
      const toList = state[toCol].filter((t) => t.id !== taskId);
      if (overIndex !== undefined && overIndex >= 0) {
        toList.splice(overIndex, 0, task);
      } else {
        toList.push(task);
      }
      return {
        ...state,
        [fromCol]: state[fromCol].filter((t) => t.id !== taskId),
        [toCol]: toList,
      };
    }
    case "REORDER_TASK": {
      const { colId, oldIndex, newIndex } = action;
      const list = [...state[colId]];
      const [moved] = list.splice(oldIndex, 1);
      list.splice(newIndex, 0, moved);
      return { ...state, [colId]: list };
    }
    default:
      return state;
  }
}

export function KanbanProvider({ children }) {
  const [tasks, dispatch] = useReducer(reducer, null, loadFromStorage);

  useEffect(() => {
    localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
  }, [tasks]);

  function addTask(colId, data) {
    dispatch({
      type: "ADD_TASK",
      colId,
      task: { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() },
    });
  }

  function updateTask(task) {
    dispatch({ type: "UPDATE_TASK", task });
  }

  function deleteTask(taskId) {
    dispatch({ type: "DELETE_TASK", taskId });
  }

  function moveTask(taskId, fromCol, toCol, overIndex) {
    dispatch({ type: "MOVE_TASK", taskId, fromCol, toCol, overIndex });
  }

  function reorderTask(colId, oldIndex, newIndex) {
    dispatch({ type: "REORDER_TASK", colId, oldIndex, newIndex });
  }

  // Find which column a task belongs to
  function findTaskCol(taskId) {
    for (const col in tasks) {
      if (tasks[col].find((t) => t.id === taskId)) return col;
    }
    return null;
  }

  return (
    <KanbanContext.Provider value={{ tasks, addTask, updateTask, deleteTask, moveTask, reorderTask, findTaskCol }}>
      {children}
    </KanbanContext.Provider>
  );
}

export function useKanban() {
  return useContext(KanbanContext);
}
