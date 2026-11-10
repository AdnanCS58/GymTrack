import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Dumbbell, Loader2, AlertCircle } from "lucide-react";

import api from "../services/api";
import exercises from "../data/exercises";

const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Abs",
  "Forearms",
  "Cardio",
];

export default function EditWorkoutTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [templateName, setTemplateName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await api.get(`/workout-templates/${id}`);
        const template = response.data.template || response.data;

        setTemplateName(template.name || "");
        setSelectedExercises(template.exercises || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load template.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  const addExercise = (exercise) => {
    const alreadyAdded = selectedExercises.some(
      (item) => item.name === exercise.name,
    );

    if (alreadyAdded) {
      setError("Exercise already added.");
      return;
    }

    setSelectedExercises((prev) => [
      ...prev,
      {
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
      },
    ]);
  };

  const removeExercise = (index) => {
    setSelectedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!templateName.trim()) {
      setError("Please enter a template name.");
      return;
    }

    if (selectedExercises.length === 0) {
      setError("Add at least one exercise.");
      return;
    }

    try {
      setSaving(true);

      await api.put(`/workout-templates/${id}`, {
        name: templateName.trim(),
        exercises: selectedExercises.map(({ name, muscleGroup }) => ({
          name,
          muscleGroup,
        })),
      });

      navigate("/workout-templates");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update template.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="gt-page">
        <div className="gt-container flex items-center justify-center py-24">
          <Loader2 className="animate-spin" size={28} />
        </div>
      </div>
    );
  }

  return (
    <div className="gt-page">
      <div className="gt-container max-w-5xl space-y-6">
        <Link
          to="/workout-templates"
          className="inline-flex items-center gap-2 text-sm"
          style={{ color: "var(--gt-text-secondary)" }}
        >
          <ArrowLeft size={17} />
          Back to Templates
        </Link>

        <div>
          <h1 className="gt-page-title">Edit Workout Template</h1>
          <p className="gt-description mt-1">
            Rename your template and manage its exercises.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <section className="gt-card space-y-3">
            <label className="gt-label" htmlFor="templateName">
              Template Name
            </label>
            <input
              id="templateName"
              className="gt-input w-full"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Upper Body Day"
              maxLength={50}
              required
            />
          </section>

          <section className="gt-card space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="gt-section-title">Selected Exercises</h2>
                <p className="gt-description">
                  {selectedExercises.length} exercises in this template
                </p>
              </div>
              <Dumbbell size={22} />
            </div>

            {selectedExercises.length === 0 ? (
              <p className="gt-description py-5 text-center">
                No exercises added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedExercises.map((exercise, index) => (
                  <div
                    key={`${exercise.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border p-4"
                    style={{
                      borderColor: "var(--gt-border)",
                      background: "var(--gt-background)",
                    }}
                  >
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: "var(--gt-text-primary)" }}
                      >
                        {exercise.name}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--gt-text-secondary)" }}
                      >
                        {exercise.muscleGroup}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                      aria-label={`Remove ${exercise.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="gt-card space-y-4">
            <div>
              <h2 className="gt-section-title">Add Exercises</h2>
              <p className="gt-description">
                Choose exercises to add to this template.
              </p>
            </div>

            {muscleGroups.map((group) => {
              const groupExercises = exercises.filter(
                (exercise) => exercise.muscleGroup === group,
              );

              if (groupExercises.length === 0) return null;

              return (
                <div key={group} className="space-y-2">
                  <h3
                    className="font-medium"
                    style={{ color: "var(--gt-text-primary)" }}
                  >
                    {group}
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {groupExercises.map((exercise) => {
                      const added = selectedExercises.some(
                        (item) => item.name === exercise.name,
                      );

                      return (
                        <button
                          key={exercise.id}
                          type="button"
                          disabled={added}
                          onClick={() => addExercise(exercise)}
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                          style={{
                            borderColor: "var(--gt-border)",
                            color: "var(--gt-text-primary)",
                          }}
                        >
                          <Plus size={15} />
                          {exercise.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>

          <div className="flex flex-wrap justify-end gap-3">
            <Link to="/workout-templates" className="gt-button-secondary">
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="gt-button-primary inline-flex items-center gap-2"
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
        {error && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div
              className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
              style={{
                background: "var(--gt-surface)",
                borderColor: "var(--gt-border)",
              }}
            >
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                  <AlertCircle size={22} />
                </div>

                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: "var(--gt-text-primary)" }}
                  >
                    Something went wrong
                  </h3>

                  <p
                    className="mt-1 text-sm leading-6"
                    style={{ color: "var(--gt-text-secondary)" }}
                  >
                    {error}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="gt-button-primary"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
