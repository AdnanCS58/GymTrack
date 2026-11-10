import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Dumbbell,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Activity,
  Plus,
  X,
  Filter,
  Check,
  CheckSquare,
  Save,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";

import api from "../services/api";
import exercises from "../data/exercises";

const muscleGroups = [
  "All",
  ...new Set(exercises.map((exercise) => exercise.muscleGroup)),
];

const equipmentTypes = [
  "All",
  ...new Set(exercises.map((exercise) => exercise.equipment)),
];

const difficultyLevels = ["All", "Beginner", "Intermediate", "Advanced"];

const ExerciseLibrary = () => {
  const [search, setSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState([]);

  // Template modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  const selectedExercises = useMemo(
    () =>
      exercises.filter((exercise) => selectedExerciseIds.includes(exercise.id)),
    [selectedExerciseIds],
  );

  const filteredExercises = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return exercises.filter((exercise) => {
      const searchableFields = [
        exercise.name,
        exercise.muscleGroup,
        exercise.equipment,
        exercise.difficulty,
        exercise.instructions,
      ];

      const matchesSearch =
        !normalizedSearch ||
        searchableFields.some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(normalizedSearch),
        );

      const matchesMuscle =
        selectedMuscle === "All" || exercise.muscleGroup === selectedMuscle;

      const matchesEquipment =
        selectedEquipment === "All" || exercise.equipment === selectedEquipment;

      const matchesDifficulty =
        selectedDifficulty === "All" ||
        exercise.difficulty === selectedDifficulty;

      return (
        matchesSearch && matchesMuscle && matchesEquipment && matchesDifficulty
      );
    });
  }, [search, selectedMuscle, selectedEquipment, selectedDifficulty]);

  const toggleExercise = (exerciseId) => {
    setSelectedExerciseIds((previous) =>
      previous.includes(exerciseId)
        ? previous.filter((id) => id !== exerciseId)
        : [...previous, exerciseId],
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredExercises.map((exercise) => exercise.id);

    setSelectedExerciseIds((previous) => [
      ...new Set([...previous, ...visibleIds]),
    ]);
  };

  const clearSelection = () => {
    setSelectedExerciseIds([]);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedMuscle("All");
    setSelectedEquipment("All");
    setSelectedDifficulty("All");
    setExpandedExercise(null);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedMuscle !== "All" ||
    selectedEquipment !== "All" ||
    selectedDifficulty !== "All";

  const allVisibleSelected =
    filteredExercises.length > 0 &&
    filteredExercises.every((exercise) =>
      selectedExerciseIds.includes(exercise.id),
    );

  // Save selected exercises as a workout template
  const handleSaveTemplate = async (event) => {
    event.preventDefault();

    const trimmedName = templateName.trim();

    if (!trimmedName) {
      toast.error("Please enter a template name");
      return;
    }

    if (trimmedName.length > 50) {
      toast.error("Template name cannot exceed 50 characters");
      return;
    }

    if (selectedExercises.length === 0) {
      toast.error("Please select at least one exercise");
      return;
    }

    try {
      setSavingTemplate(true);

      const templateExercises = selectedExercises.map((exercise) => ({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
      }));

      await api.post("/workout-templates", {
        name: trimmedName,
        exercises: templateExercises,
      });

      toast.success("Workout template saved successfully");

      setShowTemplateModal(false);
      setTemplateName("");
      setSelectedExerciseIds([]);
    } catch (error) {
      console.error("Failed to save template:", error);

      toast.error(
        error.response?.data?.message || "Failed to save workout template",
      );
    } finally {
      setSavingTemplate(false);
    }
  };

  const difficultyStyle = {
    Beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    Intermediate: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    Advanced: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <div className="gt-page">
      <div className="gt-container" style={{ maxWidth: "1200px" }}>
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
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
                Exercise Library
              </h1>
            </div>
          </div>

          <Link to="/workouts/new" className="gt-button-primary">
            <Plus size={16} />
            Log Workout
          </Link>
        </header>

        {/* Page heading */}
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--gt-primary)]">
            <Dumbbell size={17} />
            Exercise Database
          </div>

          <h2 className="gt-page-title">Explore Exercises</h2>

          <p className="gt-description mt-2 max-w-2xl">
            Select multiple exercises, explore different muscle groups, and load
            your choices into one workout session or save them as a reusable
            template.
          </p>
        </section>

        {/* Statistics */}
        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="gt-card">
            <p className="text-sm text-[var(--gt-text-secondary)]">
              Total Exercises
            </p>
            <p className="mt-3 text-3xl font-bold text-[var(--gt-text-primary)]">
              {exercises.length}
            </p>
          </div>

          <div className="gt-card">
            <p className="text-sm text-[var(--gt-text-secondary)]">
              Muscle Groups
            </p>
            <p className="mt-3 text-3xl font-bold text-[var(--gt-text-primary)]">
              {muscleGroups.length - 1}
            </p>
          </div>

          <div className="gt-card">
            <p className="text-sm text-[var(--gt-text-secondary)]">
              Selected Exercises
            </p>
            <p className="mt-3 text-3xl font-bold text-[var(--gt-primary)]">
              {selectedExerciseIds.length}
            </p>
          </div>
        </section>

        {/* Search and filters */}
        <section className="gt-card mb-7">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-[var(--gt-primary)]" />
            <div>
              <h3 className="font-semibold text-[var(--gt-text-primary)]">
                Find an Exercise
              </h3>
              <p className="mt-1 text-xs text-[var(--gt-text-muted)]">
                Search by name, muscle group, equipment or difficulty.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--gt-text-muted)]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search exercises, muscles, equipment..."
              aria-label="Search exercises"
              className="gt-input gt-input-icon pr-12"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--gt-text-muted)] transition hover:text-[var(--gt-danger)]"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mb-3 flex items-center gap-2">
            <Filter size={15} className="text-[var(--gt-text-muted)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--gt-text-secondary)]">
              Filters
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="gt-label">Muscle Group</label>

              <select
                value={selectedMuscle}
                onChange={(event) => setSelectedMuscle(event.target.value)}
                className="gt-input"
              >
                {muscleGroups.map((group) => (
                  <option key={group} value={group}>
                    {group === "All" ? "All Muscle Groups" : group}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="gt-label">Equipment</label>

              <select
                value={selectedEquipment}
                onChange={(event) => setSelectedEquipment(event.target.value)}
                className="gt-input"
              >
                {equipmentTypes.map((equipment) => (
                  <option key={equipment} value={equipment}>
                    {equipment === "All" ? "All Equipment" : equipment}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="gt-label">Difficulty</label>

              <select
                value={selectedDifficulty}
                onChange={(event) => setSelectedDifficulty(event.target.value)}
                className="gt-input"
              >
                {difficultyLevels.map((level) => (
                  <option key={level} value={level}>
                    {level === "All" ? "All Difficulty Levels" : level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter actions */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--gt-border)] pt-4">
            <p className="text-sm text-[var(--gt-text-secondary)]">
              <span className="font-semibold text-[var(--gt-text-primary)]">
                {filteredExercises.length}
              </span>{" "}
              of {exercises.length} exercises found
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-semibold text-[var(--gt-primary)] transition hover:underline"
              >
                Reset all filters
              </button>
            )}
          </div>
        </section>

        {/* Exercise list */}
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="gt-section-title">Available Exercises</h3>

              <p className="gt-description mt-1">
                Showing {filteredExercises.length} matching exercises
              </p>
            </div>

            {filteredExercises.length > 0 && (
              <button
                type="button"
                onClick={
                  allVisibleSelected
                    ? () =>
                        setSelectedExerciseIds((previous) =>
                          previous.filter(
                            (id) =>
                              !filteredExercises.some(
                                (exercise) => exercise.id === id,
                              ),
                          ),
                        )
                    : selectAllVisible
                }
                className="flex items-center gap-2 text-sm font-semibold text-[var(--gt-primary)] hover:underline"
              >
                <CheckSquare size={16} />
                {allVisibleSelected ? "Deselect Visible" : "Select All Visible"}
              </button>
            )}
          </div>

          {filteredExercises.length === 0 ? (
            <div className="gt-card py-16 text-center">
              <Search
                size={32}
                className="mx-auto mb-4 text-[var(--gt-text-muted)]"
              />

              <h4 className="font-semibold text-[var(--gt-text-primary)]">
                No exercises found
              </h4>

              <p className="gt-description mt-2">
                We couldn't find an exercise matching your search. Try another
                keyword or adjust your filters.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 gt-button-primary"
              >
                <X size={16} />
                Clear search and filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredExercises.map((exercise) => {
                const isExpanded = expandedExercise === exercise.id;

                const isSelected = selectedExerciseIds.includes(exercise.id);

                return (
                  <article
                    key={exercise.id}
                    className={`gt-card transition ${
                      isSelected
                        ? "border-[var(--gt-primary)] ring-1 ring-[var(--gt-primary)]"
                        : ""
                    }`}
                  >
                    {/* Exercise heading */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleExercise(exercise.id)}
                          aria-label={
                            isSelected
                              ? `Deselect ${exercise.name}`
                              : `Select ${exercise.name}`
                          }
                          aria-pressed={isSelected}
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition ${
                            isSelected
                              ? "border-[var(--gt-primary)] bg-[var(--gt-primary)] text-white"
                              : "border-[var(--gt-border)] text-transparent hover:border-[var(--gt-primary)]"
                          }`}
                        >
                          <Check size={16} />
                        </button>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--gt-primary-light)] text-[var(--gt-primary)]">
                          <Dumbbell size={21} />
                        </div>

                        <div className="min-w-0">
                          <h4 className="break-words font-semibold text-[var(--gt-text-primary)]">
                            {exercise.name}
                          </h4>

                          <p className="mt-1 text-xs text-[var(--gt-text-muted)]">
                            {exercise.muscleGroup}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                          difficultyStyle[exercise.difficulty] ||
                          "bg-gray-500/10 text-gray-500"
                        }`}
                      >
                        {exercise.difficulty}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-lg border border-[var(--gt-border)] px-3 py-1.5 text-xs text-[var(--gt-text-secondary)]">
                        {exercise.equipment}
                      </span>

                      <span className="rounded-lg border border-[var(--gt-border)] px-3 py-1.5 text-xs text-[var(--gt-text-secondary)]">
                        {exercise.muscleGroup}
                      </span>
                    </div>

                    {/* Instructions */}
                    {isExpanded && (
                      <div className="mt-5 rounded-xl bg-[var(--gt-background)] p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Activity
                            size={16}
                            className="text-[var(--gt-primary)]"
                          />

                          <p className="text-sm font-semibold text-[var(--gt-text-primary)]">
                            Instructions
                          </p>
                        </div>

                        <p className="text-sm leading-6 text-[var(--gt-text-secondary)]">
                          {exercise.instructions}
                        </p>
                      </div>
                    )}

                    {/* Card actions */}
                    <div className="mt-5 flex items-center justify-between border-t border-[var(--gt-border)] pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedExercise(isExpanded ? null : exercise.id)
                        }
                        aria-expanded={isExpanded}
                        className="flex items-center gap-2 text-sm font-medium text-[var(--gt-primary)] transition hover:opacity-75"
                      >
                        {isExpanded ? (
                          <>
                            Hide Details
                            <ChevronUp size={16} />
                          </>
                        ) : (
                          <>
                            View Instructions
                            <ChevronDown size={16} />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExercise(exercise.id)}
                        className="flex items-center gap-2 text-sm font-semibold text-[var(--gt-primary)] transition hover:underline"
                      >
                        {isSelected ? "Selected" : "Select Exercise"}
                        {isSelected ? <Check size={16} /> : <Plus size={16} />}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Selection bar */}
        {selectedExercises.length > 0 && (
          <div className="sticky bottom-4 z-20 mt-8">
            <div className="flex flex-col gap-4 rounded-2xl border border-[var(--gt-primary)] bg-[var(--gt-surface)] p-4 shadow-xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[var(--gt-text-primary)]">
                  {selectedExercises.length}{" "}
                  {selectedExercises.length === 1 ? "exercise" : "exercises"}{" "}
                  selected
                </p>

                <p className="mt-1 text-xs text-[var(--gt-text-secondary)]">
                  Load your selection into a workout or save it as a template.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={clearSelection}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--gt-text-secondary)] transition hover:bg-[var(--gt-background)]"
                >
                  <X size={16} />
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => setShowTemplateModal(true)}
                  className="flex items-center gap-2 rounded-xl border border-[var(--gt-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--gt-primary)] transition hover:bg-[var(--gt-primary-light)]"
                >
                  <Save size={16} />
                  Save as Template
                </button>

                <Link
                  to="/workouts/new"
                  state={{ selectedExercises }}
                  className="gt-button-primary"
                >
                  <Dumbbell size={17} />
                  Load Exercises
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs">
                    {selectedExercises.length}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Save Template Modal */}
        {showTemplateModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !savingTemplate) {
                setShowTemplateModal(false);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="template-modal-title"
              className="w-full max-w-md rounded-2xl border border-[var(--gt-border)] bg-[var(--gt-surface)] p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--gt-primary-light)] text-[var(--gt-primary)]">
                    <ClipboardList size={22} />
                  </div>

                  <h3
                    id="template-modal-title"
                    className="text-lg font-semibold text-[var(--gt-text-primary)]"
                  >
                    Save Workout Template
                  </h3>

                  <p className="mt-1 text-sm text-[var(--gt-text-secondary)]">
                    Give your selected exercises a name.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  disabled={savingTemplate}
                  aria-label="Close modal"
                  className="rounded-lg p-2 text-[var(--gt-text-muted)] transition hover:bg-[var(--gt-background)] disabled:opacity-50"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleSaveTemplate}>
                <label htmlFor="templateName" className="gt-label">
                  Template Name
                </label>

                <input
                  id="templateName"
                  type="text"
                  value={templateName}
                  onChange={(event) => setTemplateName(event.target.value)}
                  placeholder="e.g. Push Day, Pull Day, Leg Day"
                  maxLength={50}
                  autoFocus
                  required
                  disabled={savingTemplate}
                  className="gt-input"
                />

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-[var(--gt-text-muted)]">
                    Maximum 50 characters
                  </p>

                  <p className="text-xs tabular-nums text-[var(--gt-text-muted)]">
                    {templateName.length}/50
                  </p>
                </div>

                <div className="mt-5 rounded-xl bg-[var(--gt-background)] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[var(--gt-text-primary)]">
                      Selected Exercises
                    </p>

                    <span className="text-xs font-medium text-[var(--gt-primary)]">
                      {selectedExercises.length} selected
                    </span>
                  </div>

                  <div className="max-h-40 space-y-2 overflow-y-auto">
                    {selectedExercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="min-w-0 truncate text-[var(--gt-text-primary)]">
                          {exercise.name}
                        </span>

                        <span className="shrink-0 text-xs text-[var(--gt-text-muted)]">
                          {exercise.muscleGroup}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(false)}
                    disabled={savingTemplate}
                    className="rounded-xl border border-[var(--gt-border)] px-4 py-2.5 text-sm font-semibold text-[var(--gt-text-secondary)] transition hover:bg-[var(--gt-background)] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingTemplate || !templateName.trim()}
                    className="gt-button-primary justify-center disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingTemplate ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Template
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 border-t border-[var(--gt-border)] py-5 text-center">
          <p className="text-xs text-[var(--gt-text-muted)]">
            GymTrack — Your training, organized.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ExerciseLibrary;
