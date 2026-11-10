import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Dumbbell,
  Loader2,
  CalendarDays,
  Clock3,
  Weight,
  ClipboardList,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const muscleGroups = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Abs',
  'Cardio',
  'Other',
];

const createId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const createSet = (setNumber = 1) => ({
  id: createId(),
  setNumber,
  reps: '',
  weight: '',
});

const createExercise = () => ({
  id: createId(),
  name: '',
  muscleGroup: 'Chest',
  sets: [createSet()],
});

const formatDateForInput = (dateValue) => {
  if (!dateValue) return '';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const EditWorkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [formData, setFormData] = useState({
    date: '',
    duration: '',
    notes: '',
  });

  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        setLoading(true);
        setLoadError('');

        const response = await api.get(`/workouts/${id}`);
        const workout = response.data.workout;

        if (!workout) {
          throw new Error('Workout information could not be found.');
        }

        setFormData({
          date: formatDateForInput(workout.date),
          duration: workout.duration ?? '',
          notes: workout.notes || '',
        });

        const formattedExercises = (workout.exercises || []).map(
          (exercise) => ({
            id: createId(),
            name: exercise.name || '',
            muscleGroup: exercise.muscleGroup || 'Chest',
            sets:
              exercise.sets?.length > 0
                ? exercise.sets.map((set) => ({
                    id: createId(),
                    setNumber: set.setNumber,
                    reps: String(set.reps ?? ''),
                    weight: String(set.weight ?? ''),
                  }))
                : [createSet()],
          })
        );

        setExercises(
          formattedExercises.length > 0
            ? formattedExercises
            : [createExercise()]
        );
      } catch (error) {
        console.error('Error fetching workout:', error);

        const message =
          error.response?.data?.message ||
          error.message ||
          'Failed to load workout.';

        setLoadError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [id]);

  const totalSets = useMemo(
    () =>
      exercises.reduce(
        (total, exercise) => total + exercise.sets.length,
        0
      ),
    [exercises]
  );

  const totalVolume = useMemo(
    () =>
      exercises.reduce(
        (total, exercise) =>
          total +
          exercise.sets.reduce(
            (setTotal, set) =>
              setTotal +
              (Number(set.reps) || 0) * (Number(set.weight) || 0),
            0
          ),
        0
      ),
    [exercises]
  );

  const updateFormField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateExercise = (exerciseId, field, value) => {
    setExercises((previous) =>
      previous.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, [field]: value }
          : exercise
      )
    );
  };

  const addExercise = () => {
    setExercises((previous) => [...previous, createExercise()]);
  };

  const removeExercise = (exerciseId) => {
    if (exercises.length === 1) {
      toast.error('At least one exercise is required.');
      return;
    }

    setExercises((previous) =>
      previous.filter((exercise) => exercise.id !== exerciseId)
    );
  };

  const addSet = (exerciseId) => {
    setExercises((previous) =>
      previous.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;

        return {
          ...exercise,
          sets: [...exercise.sets, createSet(exercise.sets.length + 1)],
        };
      })
    );
  };

  const removeSet = (exerciseId, setId) => {
    setExercises((previous) =>
      previous.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;

        if (exercise.sets.length === 1) {
          toast.error('At least one set is required per exercise.');
          return exercise;
        }

        const updatedSets = exercise.sets
          .filter((set) => set.id !== setId)
          .map((set, index) => ({
            ...set,
            setNumber: index + 1,
          }));

        return {
          ...exercise,
          sets: updatedSets,
        };
      })
    );
  };

  const updateSet = (exerciseId, setId, field, value) => {
    setExercises((previous) =>
      previous.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId
                  ? { ...set, [field]: value }
                  : set
              ),
            }
          : exercise
      )
    );
  };

  const validateForm = () => {
    if (!formData.date) {
      toast.error('Please select a workout date.');
      return false;
    }

    if (
      formData.duration !== '' &&
      (!Number.isFinite(Number(formData.duration)) ||
        Number(formData.duration) < 0)
    ) {
      toast.error('Please enter a valid workout duration.');
      return false;
    }

    if (exercises.length === 0) {
      toast.error('Please add at least one exercise.');
      return false;
    }

    for (let index = 0; index < exercises.length; index++) {
      const exercise = exercises[index];

      if (!exercise.name.trim()) {
        toast.error(`Please enter a name for exercise ${index + 1}.`);
        return false;
      }

      if (!exercise.muscleGroup) {
        toast.error(`Please select a muscle group for exercise ${index + 1}.`);
        return false;
      }

      if (exercise.sets.length === 0) {
        toast.error(`Exercise ${index + 1} must have at least one set.`);
        return false;
      }

      for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) {
        const set = exercise.sets[setIndex];

        if (
          set.reps === '' ||
          !Number.isInteger(Number(set.reps)) ||
          Number(set.reps) < 1
        ) {
          toast.error(
            `Enter valid repetitions for exercise ${index + 1}, set ${setIndex + 1}.`
          );
          return false;
        }

        if (
          set.weight === '' ||
          !Number.isFinite(Number(set.weight)) ||
          Number(set.weight) < 0
        ) {
          toast.error(
            `Enter a valid weight for exercise ${index + 1}, set ${setIndex + 1}.`
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        date: formData.date,
        duration:
          formData.duration === '' ? 0 : Number(formData.duration),
        notes: formData.notes.trim(),
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

      await api.put(`/workouts/${id}`, payload);

      toast.success('Workout updated successfully.');
      navigate('/workouts');
    } catch (error) {
      console.error('Error updating workout:', error);

      toast.error(
        error.response?.data?.message || 'Failed to update workout.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="gt-page flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={30}
            className="animate-spin"
            style={{ color: 'var(--gt-primary)' }}
          />
          <p className="gt-description">Loading workout details...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="gt-page">
        <div className="gt-container">
          <Link
            to="/workouts"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: 'var(--gt-text-secondary)' }}
          >
            <ArrowLeft size={17} />
            Back to workout history
          </Link>

          <div className="gt-card text-center">
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: 'var(--gt-primary-light)' }}
            >
              <Dumbbell
                size={22}
                style={{ color: 'var(--gt-primary)' }}
              />
            </div>

            <h2 className="gt-section-title mb-2">
              Unable to load workout
            </h2>

            <p className="gt-description mb-5">{loadError}</p>

            <button
              type="button"
              onClick={() => navigate('/workouts')}
              className="gt-button-primary"
            >
              Return to workouts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gt-page">
      <div className="gt-container">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/workouts"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--gt-text-secondary)' }}
          >
            <ArrowLeft size={17} />
            Back to workout history
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="gt-page-title">Edit workout</h1>
              <p className="gt-description mt-2">
                Update your workout details, exercises and training sets.
              </p>
            </div>

            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
              style={{
                background: 'var(--gt-primary-light)',
                color: 'var(--gt-primary)',
              }}
            >
              <Dumbbell size={17} />
              Workout editor
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_300px]">
            {/* Main form */}
            <div className="space-y-6">
              {/* Workout information */}
              <section className="gt-card">
                <div className="mb-6 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: 'var(--gt-primary-light)' }}
                  >
                    <ClipboardList
                      size={19}
                      style={{ color: 'var(--gt-primary)' }}
                    />
                  </div>

                  <div>
                    <h2 className="gt-section-title">
                      Workout information
                    </h2>
                    <p className="gt-description mt-1">
                      Basic details about your training session.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="gt-label">
                      Workout date
                    </label>
                    <div className="relative">
                      <CalendarDays
                        size={17}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--gt-text-muted)' }}
                      />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(event) =>
                          updateFormField('date', event.target.value)
                        }
                        className="gt-input pl-11"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="gt-label">
                      Duration (minutes)
                    </label>
                    <div className="relative">
                      <Clock3
                        size={17}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--gt-text-muted)' }}
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 60"
                        value={formData.duration}
                        onChange={(event) =>
                          updateFormField('duration', event.target.value)
                        }
                        className="gt-input pl-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="gt-label">
                    Workout notes
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Add notes about your workout, performance or progress..."
                    value={formData.notes}
                    onChange={(event) =>
                      updateFormField('notes', event.target.value)
                    }
                    className="gt-input resize-y"
                  />
                </div>
              </section>

              {/* Exercises */}
              <section className="gt-card">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: 'var(--gt-primary-light)' }}
                    >
                      <Dumbbell
                        size={19}
                        style={{ color: 'var(--gt-primary)' }}
                      />
                    </div>

                    <div>
                      <h2 className="gt-section-title">Exercises</h2>
                      <p className="gt-description mt-1">
                        Manage exercises and their individual sets.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addExercise}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors"
                    style={{
                      borderColor: 'var(--gt-primary)',
                      color: 'var(--gt-primary)',
                    }}
                  >
                    <Plus size={17} />
                    Add exercise
                  </button>
                </div>

                <div className="space-y-5">
                  {exercises.map((exercise, exerciseIndex) => {
                    const exerciseVolume = exercise.sets.reduce(
                      (total, set) =>
                        total +
                        (Number(set.reps) || 0) *
                          (Number(set.weight) || 0),
                      0
                    );

                    return (
                      <div
                        key={exercise.id}
                        className="rounded-xl border p-4 sm:p-5"
                        style={{ borderColor: 'var(--gt-border)' }}
                      >
                        {/* Exercise header */}
                        <div className="mb-5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold"
                              style={{
                                background: 'var(--gt-primary-light)',
                                color: 'var(--gt-primary)',
                              }}
                            >
                              {String(exerciseIndex + 1).padStart(2, '0')}
                            </span>

                            <h3 className="font-semibold">
                              Exercise {exerciseIndex + 1}
                            </h3>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeExercise(exercise.id)}
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors"
                            style={{ color: 'var(--gt-danger)' }}
                            title="Remove exercise"
                          >
                            <Trash2 size={15} />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>

                        {/* Exercise fields */}
                        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="gt-label">
                              Exercise name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Bench Press"
                              value={exercise.name}
                              onChange={(event) =>
                                updateExercise(
                                  exercise.id,
                                  'name',
                                  event.target.value
                                )
                              }
                              className="gt-input"
                              required
                            />
                          </div>

                          <div>
                            <label className="gt-label">
                              Muscle group
                            </label>
                            <select
                              value={exercise.muscleGroup}
                              onChange={(event) =>
                                updateExercise(
                                  exercise.id,
                                  'muscleGroup',
                                  event.target.value
                                )
                              }
                              className="gt-input"
                              required
                            >
                              {muscleGroups.map((group) => (
                                <option key={group} value={group}>
                                  {group}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Sets table */}
                        <div
                          className="overflow-hidden rounded-lg border"
                          style={{ borderColor: 'var(--gt-border)' }}
                        >
                          <div
                            className="grid grid-cols-[45px_1fr_1fr_40px] items-center gap-3 px-3 py-3 text-xs font-semibold sm:grid-cols-[55px_1fr_1fr_50px] sm:px-4"
                            style={{
                              background: 'var(--gt-background)',
                              color: 'var(--gt-text-secondary)',
                            }}
                          >
                            <span>SET</span>
                            <span>REPS</span>
                            <span>WEIGHT (KG)</span>
                            <span></span>
                          </div>

                          <div className="divide-y" style={{ borderColor: 'var(--gt-border)' }}>
                            {exercise.sets.map((set, setIndex) => (
                              <div
                                key={set.id}
                                className="grid grid-cols-[45px_1fr_1fr_40px] items-center gap-3 px-3 py-3 sm:grid-cols-[55px_1fr_1fr_50px] sm:px-4"
                              >
                                <span
                                  className="text-sm font-semibold"
                                  style={{ color: 'var(--gt-text-secondary)' }}
                                >
                                  {String(setIndex + 1).padStart(2, '0')}
                                </span>

                                <input
                                  type="number"
                                  min="1"
                                  placeholder="12"
                                  value={set.reps}
                                  onChange={(event) =>
                                    updateSet(
                                      exercise.id,
                                      set.id,
                                      'reps',
                                      event.target.value
                                    )
                                  }
                                  className="gt-input !px-3 !py-2.5 text-sm"
                                  required
                                />

                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  placeholder="20"
                                  value={set.weight}
                                  onChange={(event) =>
                                    updateSet(
                                      exercise.id,
                                      set.id,
                                      'weight',
                                      event.target.value
                                    )
                                  }
                                  className="gt-input !px-3 !py-2.5 text-sm"
                                  required
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeSet(exercise.id, set.id)
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
                                  style={{ color: 'var(--gt-text-muted)' }}
                                  title="Remove set"
                                >
                                  <X size={17} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Exercise footer */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => addSet(exercise.id)}
                            className="inline-flex items-center gap-2 text-sm font-semibold"
                            style={{ color: 'var(--gt-primary)' }}
                          >
                            <Plus size={16} />
                            Add set
                          </button>

                          <p
                            className="text-xs font-medium"
                            style={{ color: 'var(--gt-text-secondary)' }}
                          >
                            Exercise volume:{' '}
                            <span
                              className="font-semibold"
                              style={{ color: 'var(--gt-text-primary)' }}
                            >
                              {exerciseVolume.toLocaleString()} kg
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={addExercise}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-4 text-sm font-semibold transition-colors"
                  style={{
                    borderColor: 'var(--gt-primary)',
                    color: 'var(--gt-primary)',
                  }}
                >
                  <Plus size={17} />
                  Add another exercise
                </button>
              </section>
            </div>

            {/* Summary sidebar */}
            <aside className="space-y-5 lg:sticky lg:top-6">
              <section className="gt-card">
                <h2 className="gt-section-title mb-5">
                  Workout summary
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="gt-description">
                      Total exercises
                    </span>
                    <span className="text-sm font-semibold">
                      {exercises.length}
                    </span>
                  </div>

                  <div
                    className="border-t"
                    style={{ borderColor: 'var(--gt-border)' }}
                  />

                  <div className="flex items-center justify-between">
                    <span className="gt-description">Total sets</span>
                    <span className="text-sm font-semibold">
                      {totalSets}
                    </span>
                  </div>

                  <div
                    className="border-t"
                    style={{ borderColor: 'var(--gt-border)' }}
                  />

                  <div className="flex items-center justify-between">
                    <span className="gt-description">Duration</span>
                    <span className="text-sm font-semibold">
                      {formData.duration
                        ? `${formData.duration} min`
                        : '—'}
                    </span>
                  </div>

                  <div
                    className="border-t"
                    style={{ borderColor: 'var(--gt-border)' }}
                  />

                  <div>
                    <span className="gt-description">
                      Total volume
                    </span>

                    <div className="mt-2 flex items-center gap-2">
                      <Weight
                        size={19}
                        style={{ color: 'var(--gt-primary)' }}
                      />
                      <span
                        className="text-2xl font-bold tracking-tight"
                        style={{ color: 'var(--gt-primary)' }}
                      >
                        {totalVolume.toLocaleString()}
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: 'var(--gt-text-secondary)' }}
                      >
                        kg
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section
                className="rounded-xl border p-4"
                style={{
                  borderColor: 'var(--gt-border)',
                  background: 'var(--gt-primary-light)',
                }}
              >
                <h3
                  className="mb-2 text-sm font-semibold"
                  style={{ color: 'var(--gt-primary)' }}
                >
                  Review before saving
                </h3>
                <p
                  className="text-xs leading-5"
                  style={{ color: 'var(--gt-text-secondary)' }}
                >
                  Check your exercise names, muscle groups, repetitions and
                  weights before updating this workout.
                </p>
              </section>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="gt-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Updating workout...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Update workout
                    </>
                  )}
                </button>

                <Link
                  to="/workouts"
                  className="flex w-full items-center justify-center rounded-lg border px-5 py-3 text-sm font-semibold transition-colors"
                  style={{
                    borderColor: 'var(--gt-border)',
                    color: 'var(--gt-text-secondary)',
                  }}
                >
                  Cancel
                </Link>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWorkout;