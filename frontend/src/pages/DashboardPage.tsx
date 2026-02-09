import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from "../hooks/tasksHooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskFormSchema, type CreateTaskFormValues, editTaskFormSchema, type EditTaskFormValues } from "../validation/tasks";
import {
  Box, Button, Card, CardContent, Checkbox, Chip, Container, Divider, 
  FormControlLabel, IconButton, Stack, TextField, Typography, DialogActions, 
  DialogTitle, DialogContent, DialogContentText, Dialog
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";

type EditingState = { id: null } | { id: string };

export function DashboardPage() {
  const { user, logout } = useAuth();

  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;  taskId: string | null; title: string;
  }>({
    open: false,  taskId: null, title: "",
  });
  const completedParam = filter === "all" ? undefined : filter === "completed" ? true : false;

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

  const busy = createTask.isPending || updateTask.isPending || deleteTask.isPending;

  // Create form
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

  // Edit form
  const editForm = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskFormSchema),
    defaultValues: { title: "", description: "" },
    mode: "onTouched",
  });

  function startEdit(task: { id: string; title: string; description?: string | null }) {
    setEditing({ id: task.id });
    editForm.reset({ title: task.title, description: task.description ?? "" });
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
      input: { title, description: desc },
    });

    setEditing({ id: null });
  }

  async function toggleComplete(id: string, current: boolean) {
    if (editing.id === id) return;
    await updateTask.mutateAsync({ id, input: { completed: !current } });
  }

  async function confirmDeleteTask() {
    if (!confirmDelete.taskId) return;

    const id = confirmDelete.taskId;
    setConfirmDelete({ open: false, taskId: null, title: "" });

    await onDelete(id);
  }

  async function onDelete(id: string) {
    if (editing.id === id) cancelEdit();
    await deleteTask.mutateAsync(id);
  }

  const apiErrorCode =
    (isError ? (error as any)?.response?.data?.error?.code : null) ??
    (createTask.isError ? (createTask.error as any)?.response?.data?.error?.code : null) ??
    (updateTask.isError ? (updateTask.error as any)?.response?.data?.error?.code : null) ??
    (deleteTask.isError ? (deleteTask.error as any)?.response?.data?.error?.code : null);

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      {/* Header */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Welcome, {user?.username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>

        <Button variant="outlined" startIcon={<LogoutIcon />} onClick={logout}>
          Logout
        </Button>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Create */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Add Task
          </Typography>

          <Stack
            component="form"
            onSubmit={createForm.handleSubmit(onCreate)}
            spacing={2}
            sx={{ mt: 1 }}
          >
            <TextField
              label="Title"
              placeholder="e.g. Buy groceries"
              disabled={busy}
              {...createForm.register("title")}
              error={!!createForm.formState.errors.title}
              helperText={createForm.formState.errors.title?.message ?? " "}
              fullWidth
            />

            <TextField
              label="Description"
              placeholder="Optional"
              disabled={busy}
              {...createForm.register("description")}
              error={!!createForm.formState.errors.description}
              helperText={createForm.formState.errors.description?.message ?? " "}
              fullWidth
              multiline
              minRows={3}
            />

            <Box>
              <Button type="submit" variant="contained" disabled={busy || createTask.isPending}>
                {createTask.isPending ? "Creating..." : "Create"}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Filter + List */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          My Tasks
        </Typography>

        <Stack direction="row" spacing={1}>
          <Chip
            label="All"
            clickable
            color={filter === "all" ? "primary" : "default"}
            variant={filter === "all" ? "filled" : "outlined"}
            onClick={() => setFilter("all")}
            disabled={busy}
          />
          <Chip
            label="Active"
            clickable
            color={filter === "active" ? "primary" : "default"}
            variant={filter === "active" ? "filled" : "outlined"}
            onClick={() => setFilter("active")}
            disabled={busy}
          />
          <Chip
            label="Completed"
            clickable
            color={filter === "completed" ? "primary" : "default"}
            variant={filter === "completed" ? "filled" : "outlined"}
            onClick={() => setFilter("completed")}
            disabled={busy}
          />
        </Stack>
      </Stack>

      {isLoading && <Typography color="text.secondary">Loading tasks...</Typography>}

      {apiErrorCode && (
        <Typography sx={{ mt: 1 }} color="error">
          Error: {apiErrorCode}
        </Typography>
      )}

      {!isLoading && !isError && sorted.length === 0 && (
        <Typography color="text.secondary">No tasks yet. Add your first one above.</Typography>
      )}

      <Stack spacing={2} sx={{ mt: 2 }}>
        {sorted.map((t) => {
          const isEditing = editing.id === t.id;

          return (
            <Card key={t.id} variant="outlined">
              <CardContent>
                {!isEditing ? (
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={t.completed}
                            onChange={() => toggleComplete(t.id, t.completed)}
                            disabled={busy}
                          />
                        }
                        label={
                          <Box>
                            <Typography
                              fontWeight={700}
                              sx={{ textDecoration: t.completed ? "line-through" : "none" }}
                            >
                              {t.title}
                            </Typography>
                            {t.description ? (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
                                {t.description}
                              </Typography>
                            ) : null}
                          </Box>
                        }
                      />
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <IconButton aria-label="edit" onClick={() => startEdit(t)} disabled={busy}>
                        <EditOutlinedIcon />
                      </IconButton>
                      <IconButton aria-label="delete" onClick={() => setConfirmDelete({ open: true, taskId: t.id, title: t.title })} disabled={busy}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                ) : (
                  <Stack component="form" onSubmit={editForm.handleSubmit(onSaveEdit)} spacing={2}>
                    <TextField
                      label="Title"
                      disabled={busy}
                      {...editForm.register("title")}
                      error={!!editForm.formState.errors.title}
                      helperText={editForm.formState.errors.title?.message ?? " "}
                      fullWidth
                    />

                    <TextField
                      label="Description"
                      disabled={busy}
                      {...editForm.register("description")}
                      error={!!editForm.formState.errors.description}
                      helperText={editForm.formState.errors.description?.message ?? " "}
                      fullWidth
                      multiline
                      minRows={3}
                    />

                    <Stack direction="row" spacing={1}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveOutlinedIcon />}
                        disabled={busy || updateTask.isPending}
                      >
                        {updateTask.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        type="button"
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        onClick={cancelEdit}
                        disabled={busy}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Stack>
  
    <Dialog
      open={confirmDelete.open}
      onClose={() =>
        setConfirmDelete({ open: false, taskId: null, title: "" })
      }
    >
      <DialogTitle>Delete task?</DialogTitle>

      <DialogContent>
        <DialogContentText>
          This will permanently delete{" "}
          <strong>{confirmDelete.title}</strong>.
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() =>
            setConfirmDelete({ open: false, taskId: null, title: "" })
          }
          disabled={deleteTask.isPending}
        >
          Cancel
        </Button>

        <Button
          color="error"
          variant="contained"
          onClick={confirmDeleteTask}
          disabled={deleteTask.isPending}
        >
          {deleteTask.isPending ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>

    </Container>
  
  );
  
}
