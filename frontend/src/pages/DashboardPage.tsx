import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from "../hooks/tasksHooks";

type EditingState =
  | { id: null }
  | { id: string; title: string; description: string };

export function DashboardPage() {
  const { user, logout } = useAuth();

  const { data: tasks, isLoading, isError, error } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editing, setEditing] = useState<EditingState>({ id: null });

  const sorted = useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [tasks]);

  const busy =
    createTask.isPending || updateTask.isPending || deleteTask.isPending;

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    await createTask.mutateAsync({
      title: t,
      ...(description.trim() ? { description: description.trim() } : {}),
    });

    setTitle("");
    setDescription("");
  }

  async function toggleComplete(id: string, current: boolean) {
    // don't toggle while editing that same task (optional UX)
    if (editing.id === id) return;
    await updateTask.mutateAsync({ id, input: { completed: !current } });
  }

  function startEdit(task: { id: string; title: string; description?: string | null }) {
    setEditing({
      id: task.id,
      title: task.title,
      description: task.description ?? "",
    });
  }

  function cancelEdit() {
    setEditing({ id: null });
  }

  async function saveEdit() {
    if (!editing.id) return;

    const newTitle = editing.title.trim();
    if (!newTitle) return;

    await updateTask.mutateAsync({
      id: editing.id,
      input: {
        title: newTitle,
        // send description only if user typed something; otherwise omit it
        ...(editing.description.trim() ? { description: editing.description.trim() } : { description: "" }),
      },
    });

    setEditing({ id: null });
  }

  async function onDelete(id: string) {
    if (editing.id === id) cancelEdit();
    await deleteTask.mutateAsync(id);
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>Welcome, {user?.username}</h2>
          <div style={{ color: "#666", marginTop: 4 }}>{user?.email}</div>
        </div>
        <button onClick={logout}>Logout</button>
      </div>

      <hr style={{ margin: "20px 0" }} />

      <section>
        <h3 style={{ marginBottom: 8 }}>Add Task</h3>
        <form onSubmit={onCreate} style={{ display: "grid", gap: 8 }}>
          <input
            placeholder="Title (required)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={busy}
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={busy}
            rows={3}
          />
          <div>
            <button type="submit" disabled={busy || !title.trim()}>
              {createTask.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
        {createTask.isError && (
          <p style={{ color: "crimson" }}>
            Create failed: {(createTask.error as any)?.response?.data?.error?.code ?? "ERROR"}
          </p>
        )}
      </section>

      <hr style={{ margin: "20px 0" }} />

      <section>
        <h3 style={{ marginBottom: 8 }}>My Tasks</h3>

        {isLoading && <p>Loading tasks...</p>}
        {isError && (
          <p style={{ color: "crimson" }}>
            Failed to load: {(error as any)?.response?.data?.error?.code ?? "ERROR"}
          </p>
        )}

        {!isLoading && !isError && sorted.length === 0 && (
          <p style={{ color: "#666" }}>No tasks yet. Add your first one above.</p>
        )}

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
          {sorted.map((t) => {
            const isEditing = editing.id === t.id;

            return (
              <li
                key={t.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                  display: "grid",
                  gap: 10,
                }}
              >
                {!isEditing ? (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <label style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => toggleComplete(t.id, t.completed)}
                        disabled={busy}
                      />
                      <div>
                        <div style={{ fontWeight: 600, textDecoration: t.completed ? "line-through" : "none" }}>
                          {t.title}
                        </div>
                        {t.description ? (
                          <div style={{ color: "#555", marginTop: 4, whiteSpace: "pre-wrap" }}>{t.description}</div>
                        ) : null}
                      </div>
                    </label>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => startEdit(t)} disabled={busy}>
                        Edit
                      </button>
                      <button onClick={() => onDelete(t.id)} disabled={busy}>
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    <input
                      value={editing.title}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                      disabled={busy}
                      placeholder="Title"
                    />
                    <textarea
                      value={editing.description}
                      onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                      disabled={busy}
                      placeholder="Description"
                      rows={3}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={saveEdit} disabled={busy || !editing.title.trim()}>
                        {updateTask.isPending ? "Saving..." : "Save"}
                      </button>
                      <button onClick={cancelEdit} disabled={busy}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {(updateTask.isError || deleteTask.isError) && (
                  <div style={{ color: "crimson" }}>
                    {updateTask.isError
                      ? `Update failed: ${(updateTask.error as any)?.response?.data?.error?.code ?? "ERROR"}`
                      : null}
                    {deleteTask.isError
                      ? ` Delete failed: ${(deleteTask.error as any)?.response?.data?.error?.code ?? "ERROR"}`
                      : null}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
