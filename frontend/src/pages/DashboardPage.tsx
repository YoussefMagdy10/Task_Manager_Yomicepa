import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from "../hooks/tasksHooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskFormSchema, type CreateTaskFormValues, editTaskFormSchema, type EditTaskFormValues } from "../validation/tasks";

type EditingState =
  | { id: null }
  | { id: string };

export function DashboardPage() {
  const { user, logout } = useAuth();

  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const completedParam =
    filter === "all" ? undefined : filter === "completed" ? true : false;

  const { data: tasks, isLoading, isError, error } = useTasks({
    ...(completedParam === undefined ? {} : { completed: completedParam }),
  });

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [editing, setEditing] = useState<EditingState>({ id: null });

  const sorted = useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [tasks]);

  const busy =
    createTask.isPending || updateTask.isPending || deleteTask.isPending;

  // -------- Create form (RHF + Zod) --------
  const createForm = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: { title: "", description: "" },
    mode: "onTouched",
  });

  async function onCreate(values: CreateTaskFormValues) {
    const title = values.title.trim();
    const desc = (values.description ?? "").trim();

    await createTask.mutateAsync({
      title,
      ...(desc ? { description: desc } : {}),
    });

    createForm.reset({ title: "", description: "" });
  }

  // -------- Edit form (RHF + Zod) --------
  const editForm = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskFormSchema),
    defaultValues: { title: "", description: "" },
    mode: "onTouched",
  });

  function startEdit(task: { id: string; title: string; description?: string | null }) {
    setEditing({ id: task.id });
    editForm.reset({
      title: task.title,
      description: task.description ?? "",
    });
  }

  function cancelEdit() {
    setEditing({ id: null });
  }

  async function onSaveEdit(values: EditTaskFormValues) {
    if (!editing.id) return;

    const title = values.title.trim();
    const desc = (values.description ?? "").trim();

    await updateTask.mutateAsync({
      id: editing.id,
      input: {
        title,
        // send empty string if user cleared it (valid per backend schema)
        description: desc,
      },
    });

    setEditing({ id: null });
  }

  async function onDelete(id: string) {
    if (editing.id === id) cancelEdit();
    await deleteTask.mutateAsync(id);
  }

  async function toggleComplete(id: string, current: boolean) {
    if (editing.id === id) return;
    await updateTask.mutateAsync({ id, input: { completed: !current } });
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

      {/* Create */}
      <section>
        <h3 style={{ marginBottom: 8 }}>Add Task</h3>

        <form
          onSubmit={createForm.handleSubmit(onCreate)}
          style={{ display: "grid", gap: 8 }}
        >
          <div>
            <input
              placeholder="Title (required)"
              {...createForm.register("title")}
              disabled={busy}
              style={{ width: "100%" }}
            />
            {createForm.formState.errors.title && (
              <div style={{ color: "crimson", marginTop: 4 }}>
                {createForm.formState.errors.title.message}
              </div>
            )}
          </div>

          <div>
            <textarea
              placeholder="Description (optional)"
              {...createForm.register("description")}
              disabled={busy}
              rows={3}
              style={{ width: "100%" }}
            />
            {createForm.formState.errors.description && (
              <div style={{ color: "crimson", marginTop: 4 }}>
                {createForm.formState.errors.description.message}
              </div>
            )}
          </div>

          <div>
            <button type="submit" disabled={busy || createTask.isPending}>
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

      {/* List */}
      <section>
        <h3 style={{ marginBottom: 8 }}>My Tasks</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
          <span style={{ color: "#666" }}>Filter:</span>

          <button
            type="button"
            onClick={() => setFilter("all")}
            disabled={busy}
            style={{ fontWeight: filter === "all" ? 700 : 400 }}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setFilter("active")}
            disabled={busy}
            style={{ fontWeight: filter === "active" ? 700 : 400 }}
          >
            Active
          </button>

          <button
            type="button"
            onClick={() => setFilter("completed")}
            disabled={busy}
            style={{ fontWeight: filter === "completed" ? 700 : 400 }}
          >
            Completed
          </button>
        </div>

        <div style={{ color: "#666", marginBottom: 10 }}>
          Showing {sorted.length} task{sorted.length === 1 ? "" : "s"}
        </div>



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
                      <button onClick={() => startEdit(t)} disabled={busy}>Edit</button>
                      <button onClick={() => onDelete(t.id)} disabled={busy}>Delete</button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={editForm.handleSubmit(onSaveEdit)} style={{ display: "grid", gap: 8 }}>
                    <div>
                      <input
                        {...editForm.register("title")}
                        disabled={busy}
                        placeholder="Title"
                        style={{ width: "100%" }}
                      />
                      {editForm.formState.errors.title && (
                        <div style={{ color: "crimson", marginTop: 4 }}>
                          {editForm.formState.errors.title.message}
                        </div>
                      )}
                    </div>

                    <div>
                      <textarea
                        {...editForm.register("description")}
                        disabled={busy}
                        placeholder="Description"
                        rows={3}
                        style={{ width: "100%" }}
                      />
                      {editForm.formState.errors.description && (
                        <div style={{ color: "crimson", marginTop: 4 }}>
                          {editForm.formState.errors.description.message}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="submit" disabled={busy || updateTask.isPending}>
                        {updateTask.isPending ? "Saving..." : "Save"}
                      </button>
                      <button type="button" onClick={cancelEdit} disabled={busy}>
                        Cancel
                      </button>
                    </div>
                  </form>
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
