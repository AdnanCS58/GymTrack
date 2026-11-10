import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Dumbbell,
  Save,
  Clock,
  Weight,
  Calculator,
  CheckCircle2,
  Activity,
} from "lucide-react";

import api from "../services/api";

const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Abs",
  "Cardio",
  "Full Body",
  "Other",
];

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createExercise = (selectedExercise = null) => ({
  id: crypto.randomUUID(),
  name: selectedExercise?.name || "",
  muscleGroup: selectedExercise?.muscleGroup || "Chest",
  sets: [{ reps: "", weight: "" }],
});

const Workout = () => {
  const location = useLocation();

  const selectedExercises = location.state?.selectedExercises || [];

  const selectedExercise = location.state?.exercise || null;

  const initialExercises =
    selectedExercises.length > 0
      ? selectedExercises.map((exercise) => createExercise(exercise))
      : [createExercise(selectedExercise)];

  const [date, setDate] = useState(today());
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState(initialExercises);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalVolume = useMemo(() => {
    return exercises.reduce((total, exercise) => {
      const exerciseVolume = exercise.sets.reduce((sum, set) => {
        return sum + (Number(set.reps) || 0) * (Number(set.weight) || 0);
      }, 0);

      return total + exerciseVolume;
    }, 0);
  }, [exercises]);

  const totalSets = useMemo(() => {
    return exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0,
    );
  }, [exercises]);

  const updateExercise = (exerciseId, field, value) => {
    setExercises((previous) =>
      previous.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, [field]: value } : exercise,
      ),
    );
  };

  const addExercise = () => {
    setExercises((previous) => [...previous, createExercise()]);
    setError("");
    setSuccess("");
  };

  const removeExercise = (exerciseId) => {
    if (exercises.length === 1) return;

    setExercises((previous) =>
      previous.filter((exercise) => exercise.id !== exerciseId),
    );
  };

  const removeAllExercises = () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove all exercises? This action cannot be undone.",
    );

    if (!confirmed) return;

    setExercises([createExercise()]);
    setError("");
    setSuccess("");
  };

  const addSet = (exerciseId) => {
    setExercises((previous) =>
      previous.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: [...exercise.sets, { reps: "", weight: "" }],
            }
          : exercise,
      ),
    );
  };

  const removeSet = (exerciseId, setIndex) => {
    setExercises((previous) =>
      previous.map((exercise) =>
        exercise.id === exerciseId && exercise.sets.length > 1
          ? {
              ...exercise,
              sets: exercise.sets.filter((_, index) => index !== setIndex),
            }
          : exercise,
      ),
    );
  };

  const updateSet = (exerciseId, setIndex, field, value) => {
    setExercises((previous) =>
      previous.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set, index) =>
                index === setIndex ? { ...set, [field]: value } : set,
              ),
            }
          : exercise,
      ),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!date) {
      setError("Please select a workout date.");
      return;
    }

    if (duration !== "" && Number(duration) < 0) {
      setError("Duration cannot be negative.");
      return;
    }

    for (const exercise of exercises) {
      if (!exercise.name.trim()) {
        setError("Please enter a name for every exercise.");
        return;
      }

      if (!exercise.muscleGroup) {
        setError("Please select a muscle group for every exercise.");
        return;
      }

      for (const set of exercise.sets) {
        if (
          set.reps === "" ||
          !Number.isInteger(Number(set.reps)) ||
          Number(set.reps) < 1 ||
          set.weight === "" ||
          !Number.isFinite(Number(set.weight)) ||
          Number(set.weight) < 0
        ) {
          setError("Please enter valid reps and weight for every set.");
          return;
        }
      }
    }

    const workoutData = {
      date,
      duration: Number(duration) || 0,
      notes,
      exercises: exercises.map((exercise) => ({
        name: exercise.name.trim(),
        muscleGroup: exercise.muscleGroup,
        sets: exercise.sets.map((set, index) => ({
          setNumber: index + 1,
          reps: Number(set.reps),
          weight: Number(set.weight),
        })),
      })),
    };

    try {
      setSaving(true);

      await api.post("/workouts", workoutData);

      setSuccess("Workout saved successfully.");
      setExercises([createExercise()]);
      setDuration("");
      setNotes("");
      setDate(today());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not save workout. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "gt-input";
  const labelClass = "gt-label";

  return (
    <div className="gt-page">
      <div className="gt-container" style={{ maxWidth: "960px" }}>
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              aria-label="Back to dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--gt-border)] bg-[var(--gt-surface)] text-[var(--gt-text-secondary)] transition hover:border-[var(--gt-primary)] hover:text-[var(--gt-primary)]"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--gt-text-muted)]">
                GymTrack
              </p>
              <h1 className="text-lg font-semibold text-[var(--gt-text-primary)]">
                Workout Logger
              </h1>
            </div>
          </div>

          <Link
            to="/workouts"
            className="text-sm font-medium text-[var(--gt-primary)] transition hover:underline"
          >
            Workout History
          </Link>
        </header>

        {/* Page heading */}
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--gt-primary)]">
            <Activity size={16} />
            Training Session
          </div>

          <h2 className="gt-page-title">Log a Workout</h2>

          <p className="gt-description mt-2 max-w-2xl">
            Record your exercises, track each set, and keep a detailed history
            of your training progress.
          </p>
        </section>

        {/* Summary */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="gt-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--gt-text-secondary)]">
                Exercises
              </span>
              <Dumbbell size={19} className="text-[var(--gt-primary)]" />
            </div>

            <p className="mt-4 text-3xl font-semibold tabular-nums text-[var(--gt-text-primary)]">
              {exercises.length}
            </p>

            <p className="mt-1 text-xs text-[var(--gt-text-muted)]">
              Exercises in this session
            </p>
          </div>

          <div className="gt-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--gt-text-secondary)]">
                Total Sets
              </span>
              <Calculator size={19} className="text-[var(--gt-primary)]" />
            </div>

            <p className="mt-4 text-3xl font-semibold tabular-nums text-[var(--gt-text-primary)]">
              {totalSets}
            </p>

            <p className="mt-1 text-xs text-[var(--gt-text-muted)]">
              Sets recorded
            </p>
          </div>

          <div className="gt-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--gt-text-secondary)]">
                Training Volume
              </span>
              <Weight size={19} className="text-[var(--gt-primary)]" />
            </div>

            <p className="mt-4 text-3xl font-semibold tabular-nums text-[var(--gt-text-primary)]">
              {totalVolume.toLocaleString()}
              <span className="ml-1 text-sm font-medium text-[var(--gt-text-secondary)]">
                kg
              </span>
            </p>

            <p className="mt-1 text-xs text-[var(--gt-text-muted)]">
              Total weight lifted
            </p>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workout details */}
          <section className="gt-card">
            <div className="mb-6">
              <h3 className="gt-section-title">Workout Details</h3>
              <p className="gt-description mt-1">
                Set the date and duration of your training session.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Workout Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <Clock size={15} />
                    Duration (minutes)
                  </span>
                </label>

                <input
                  type="number"
                  min="0"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 60"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Exercise section */}
          <section className="space-y-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="gt-section-title">Exercises</h3>
                <p className="gt-description mt-1">
                  Add exercises and record the details of every set.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={removeAllExercises}
                  disabled={
                    exercises.length === 1 &&
                    !exercises[0].name &&
                    exercises[0].sets.length === 1 &&
                    !exercises[0].sets[0].reps &&
                    !exercises[0].sets[0].weight
                  }
                  className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900/50 dark:hover:bg-red-950/30"
                >
                  <Trash2 size={16} />
                  Clear All
                </button>

                <button
                  type="button"
                  onClick={addExercise}
                  className="gt-button-primary"
                >
                  <Plus size={17} />
                  Add Exercise
                </button>
              </div>
            </div>

            {exercises.map((exercise, exerciseIndex) => {
              const exerciseVolume = exercise.sets.reduce(
                (sum, set) =>
                  sum + (Number(set.reps) || 0) * (Number(set.weight) || 0),
                0,
              );

              return (
                <div key={exercise.id} className="gt-card">
                  {/* Exercise heading */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gt-primary-light)] text-[var(--gt-primary)]">
                        <Dumbbell size={19} />
                      </div>

                      <div>
                        <h4 className="font-semibold text-[var(--gt-text-primary)]">
                          Exercise {exerciseIndex + 1}
                        </h4>
                        <p className="mt-0.5 text-xs text-[var(--gt-text-muted)]">
                          {exercise.sets.length}{" "}
                          {exercise.sets.length === 1 ? "set" : "sets"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeExercise(exercise.id)}
                      disabled={exercises.length === 1}
                      aria-label="Remove exercise"
                      title="Remove exercise"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--gt-text-muted)] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  {/* Exercise information */}
                  <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Exercise Name</label>

                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) =>
                          updateExercise(exercise.id, "name", e.target.value)
                        }
                        placeholder="e.g. Bench Press"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Muscle Group</label>

                      <select
                        value={exercise.muscleGroup}
                        onChange={(e) =>
                          updateExercise(
                            exercise.id,
                            "muscleGroup",
                            e.target.value,
                          )
                        }
                        className={inputClass}
                      >
                        {muscleGroups.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sets heading */}
                  <div className="mb-3 flex items-center justify-between">
                    <h5 className="text-sm font-semibold text-[var(--gt-text-primary)]">
                      Set Details
                    </h5>
                    <span className="text-xs text-[var(--gt-text-muted)]">
                      Weight in kg
                    </span>
                  </div>

                  {/* Set column labels */}
                  <div className="mb-2 grid grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)_36px] items-center gap-2 sm:grid-cols-[56px_minmax(0,1fr)_minmax(0,1fr)_40px]">
                    <span className="text-xs font-medium text-[var(--gt-text-muted)]">
                      Set
                    </span>
                    <span className="text-xs font-medium text-[var(--gt-text-muted)]">
                      Reps
                    </span>
                    <span className="text-xs font-medium text-[var(--gt-text-muted)]">
                      Weight
                    </span>
                    <span />
                  </div>

                  {/* Set rows */}
                  <div className="space-y-3">
                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className="grid grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)_36px] items-center gap-2 sm:grid-cols-[56px_minmax(0,1fr)_minmax(0,1fr)_40px]"
                      >
                        <div className="flex h-11 items-center justify-center rounded-lg bg-[var(--gt-primary-light)] text-sm font-semibold text-[var(--gt-primary)]">
                          {setIndex + 1}
                        </div>

                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={set.reps}
                          onChange={(e) =>
                            updateSet(
                              exercise.id,
                              setIndex,
                              "reps",
                              e.target.value,
                            )
                          }
                          placeholder="12"
                          aria-label={`Set ${setIndex + 1} reps`}
                          className={`${inputClass} min-w-0 px-3`}
                          required
                        />

                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={set.weight}
                          onChange={(e) =>
                            updateSet(
                              exercise.id,
                              setIndex,
                              "weight",
                              e.target.value,
                            )
                          }
                          placeholder="20"
                          aria-label={`Set ${setIndex + 1} weight`}
                          className={`${inputClass} min-w-0 px-3`}
                          required
                        />

                        <button
                          type="button"
                          onClick={() => removeSet(exercise.id, setIndex)}
                          disabled={exercise.sets.length === 1}
                          aria-label={`Remove set ${setIndex + 1}`}
                          title="Remove set"
                          className="flex h-10 items-center justify-center rounded-lg text-[var(--gt-text-muted)] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-950/30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Exercise footer */}
                  <div className="mt-5 flex flex-col justify-between gap-3 border-t border-[var(--gt-border)] pt-4 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => addSet(exercise.id)}
                      className="flex items-center gap-2 text-sm font-semibold text-[var(--gt-primary)] transition hover:opacity-75"
                    >
                      <Plus size={16} />
                      Add Set
                    </button>

                    <p className="text-sm text-[var(--gt-text-secondary)]">
                      Exercise Volume:{" "}
                      <span className="font-semibold tabular-nums text-[var(--gt-text-primary)]">
                        {exerciseVolume.toLocaleString()} kg
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Notes */}
          <section className="gt-card">
            <div className="mb-4">
              <h3 className="gt-section-title">Workout Notes</h3>
              <p className="gt-description mt-1">
                Record anything important about this session.
              </p>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Add personal records, observations, or notes about your workout..."
              className={`${inputClass} resize-y`}
            />

            <p className="mt-2 text-right text-xs text-[var(--gt-text-muted)]">
              {notes.length}/1000 characters
            </p>
          </section>

          {/* Feedback */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
            >
              <span className="font-semibold">Error:</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400"
            >
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col-reverse gap-3 border-t border-[var(--gt-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--gt-text-muted)]">
              Review your exercise details before saving.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="gt-button-primary w-full py-3 sm:w-auto sm:min-w-48"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving Workout...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Workout
                </>
              )}
            </button>
          </div>
        </form>

        <footer className="mt-10 border-t border-[var(--gt-border)] py-5 text-center">
          <p className="text-xs text-[var(--gt-text-muted)]">
            GymTrack — Your training, organized.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Workout;
