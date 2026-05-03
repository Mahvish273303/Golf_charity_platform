import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Loader from "../components/Loader";
import SectionTitle from "../components/SectionTitle";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { taskService } from "../services/dashboardService";

const STATUS_LABELS = { todo: "To Do", "in-progress": "In Progress", done: "Done" };
const STATUS_COLORS = {
  todo: "bg-[#F5F3F0] text-[#3A2E2A]",
  "in-progress": "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
};

function isOverdue(task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
}

function TasksPage() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await taskService.getTasks();
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingId(taskId);
    setError("");
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update task status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3F0]">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <section className="mb-7 rounded-[2rem] border border-[#A68A64]/30 bg-gradient-to-r from-[#3A2E2A] to-[#5A463F] p-6 text-white shadow-xl shadow-[#1F1F1F]/20 md:p-8">
          <p className="text-sm text-[#A68A64]">{isAdmin ? "Admin View" : "My Tasks"}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-wide md:text-4xl">Task Manager</h1>
          <p className="mt-2 text-sm text-[#E5E1DC]">
            {isAdmin
              ? "View and manage all team tasks."
              : "View and update your assigned tasks."}
          </p>
        </section>

        <SectionTitle title="Tasks" subtitle="Track task status and deadlines." />

        {error ? <p className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
        {loading ? <Loader text="Loading tasks..." /> : null}

        {!loading && !tasks.length ? (
          <Card>
            <p className="text-sm text-[#6B6B6B]">No tasks found.</p>
          </Card>
        ) : null}

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => {
            const overdue = isOverdue(task);
            return (
              <div
                key={task.id}
                className={`rounded-2xl border bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                  overdue ? "border-rose-300" : "border-[#E5E1DC]"
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[#1F1F1F] leading-tight">{task.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[task.status]}`}
                  >
                    {STATUS_LABELS[task.status] || task.status}
                  </span>
                </div>

                {task.description ? (
                  <p className="mb-2 text-xs text-[#6B6B6B] leading-relaxed">{task.description}</p>
                ) : null}

                <div className="space-y-1 text-xs text-[#6B6B6B]">
                  <p>
                    <span className="font-medium text-[#3A2E2A]">Assigned to:</span>{" "}
                    {task.assignedTo?.name || "—"}
                  </p>
                  {isAdmin && (
                    <p>
                      <span className="font-medium text-[#3A2E2A]">Created by:</span>{" "}
                      {task.createdBy?.name || "—"}
                    </p>
                  )}
                  <p>
                    <span className="font-medium text-[#3A2E2A]">Due:</span>{" "}
                    {task.dueDate ? (
                      <span className={overdue ? "font-semibold text-rose-600" : ""}>
                        {new Date(task.dueDate).toLocaleDateString()}
                        {overdue ? " (Overdue)" : ""}
                      </span>
                    ) : (
                      "No due date"
                    )}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <select
                    className="flex-1 rounded-lg border border-[#E5E1DC] bg-white px-2 py-1.5 text-xs shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#A68A64]"
                    value={task.status}
                    disabled={updatingId === task.id}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  {updatingId === task.id ? (
                    <span className="text-xs text-[#6B6B6B]">Saving...</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default TasksPage;
