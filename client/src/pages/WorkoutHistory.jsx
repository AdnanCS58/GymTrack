
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Dumbbell,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Weight,
  ClipboardList,
  Pencil,
  Clock,
  Activity,
  CheckCircle2,
} from 'lucide-react'

import api from '../services/api'

const formatDate = (dateString) => {
  if (!dateString) return 'Date unavailable'

  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const calculateVolume = (exercises = []) => {
  return exercises.reduce((total, exercise) => {
    return (
      total +
      (exercise.sets || []).reduce(
        (sum, set) =>
          sum + (Number(set.reps) || 0) * (Number(set.weight) || 0),
        0
      )
    )
  }, 0)
}

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedWorkout, setExpandedWorkout] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/workouts')
      setWorkouts(response.data.workouts || [])
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load your workout history.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  const handleDelete = async (workoutId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this workout? This cannot be undone.'
    )

    if (!confirmed) return

    try {
      setDeletingId(workoutId)
      setError('')

      await api.delete(`/workouts/${workoutId}`)

      setWorkouts((previous) =>
        previous.filter((workout) => workout._id !== workoutId)
      )

      if (expandedWorkout === workoutId) {
        setExpandedWorkout(null)
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not delete this workout.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const statistics = useMemo(() => {
    const totalWorkouts = workouts.length

    const totalVolume = workouts.reduce(
      (sum, workout) =>
        sum + calculateVolume(workout.exercises),
      0
    )

    const totalExercises = workouts.reduce(
      (sum, workout) =>
        sum + (workout.exercises?.length || 0),
      0
    )

    return {
      totalWorkouts,
      totalExercises,
      totalVolume,
    }
  }, [workouts])

  return (
    <div className="gt-page">
      <div className="gt-container" style={{ maxWidth: '1100px' }}>
        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-3">
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
                Workout History
              </h1>
            </div>
          </div>

          <Link
            to="/workouts/new"
            className="gt-button-primary"
          >
            <Plus size={17} />
            <span className="hidden sm:inline">New Workout</span>
            <span className="sm:hidden">New</span>
          </Link>
        </header>

        {/* Page heading */}
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--gt-primary)]">
            <Activity size={16} />
            Training Overview
          </div>

          <h2 className="gt-page-title">Your Training History</h2>

          <p className="gt-description mt-2 max-w-2xl">
            Review your previous training sessions, monitor your
            workload, and keep track of your progress over time.
          </p>
        </section>

        {/* Statistics */}
        <section className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="gt-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--gt-text-secondary)]">
                Total Workouts
              </span>
              <Dumbbell
                size={19}
                className="text-[var(--gt-primary)]"
              />
            </div>

            <p className="mt-4 text-3xl font-semibold tabular-nums text-[var(--gt-text-primary)]">
              {statistics.totalWorkouts}
            </p>

            <p className="mt-1 text-xs text-[var(--gt-text-muted)]">
              Training sessions completed
            </p>
          </div>

          <div className="gt-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--gt-text-secondary)]">
                Exercises Logged
              </span>
              <ClipboardList
                size={19}
                className="text-[var(--gt-primary)]"
              />
            </div>

            <p className="mt-4 text-3xl font-semibold tabular-nums text-[var(--gt-text-primary)]">
              {statistics.totalExercises}
            </p>

            <p className="mt-1 text-xs text-[var(--gt-text-muted)]">
              Exercises across all sessions
            </p>
          </div>

          <div className="gt-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--gt-text-secondary)]">
                Total Volume
              </span>
              <Weight
                size={19}
                className="text-[var(--gt-primary)]"
              />
            </div>

            <p className="mt-4 text-3xl font-semibold tabular-nums text-[var(--gt-text-primary)]">
              {statistics.totalVolume.toLocaleString()}
              <span className="ml-1 text-sm font-medium text-[var(--gt-text-secondary)]">
                kg
              </span>
            </p>

            <p className="mt-1 text-xs text-[var(--gt-text-muted)]">
              Combined training volume
            </p>
          </div>
        </section>

        {/* Workout list */}
        <section>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="gt-section-title">All Workouts</h3>
              <p className="gt-description mt-1">
                Your latest training sessions appear first.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchWorkouts}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--gt-border)] bg-[var(--gt-surface)] px-4 py-2.5 text-sm font-medium text-[var(--gt-text-secondary)] transition hover:border-[var(--gt-primary)] hover:text-[var(--gt-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={loading ? 'animate-spin' : ''}
              />
              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
            >
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="gt-card py-16 text-center">
              <RefreshCw
                className="mx-auto animate-spin text-[var(--gt-primary)]"
                size={28}
              />
              <p className="mt-4 text-sm text-[var(--gt-text-secondary)]">
                Loading your workouts...
              </p>
            </div>
          ) : workouts.length === 0 ? (
            /* Empty state */
            <div className="gt-card px-5 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--gt-primary-light)] text-[var(--gt-primary)]">
                <Dumbbell size={28} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-[var(--gt-text-primary)]">
                No workouts recorded yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--gt-text-secondary)]">
                Your training sessions will appear here once you
                start logging your workouts.
              </p>

              <Link
                to="/workouts/new"
                className="gt-button-primary mt-6"
              >
                <Plus size={17} />
                Log Your First Workout
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {workouts.map((workout) => {
                const isExpanded =
                  expandedWorkout === workout._id

                const volume = calculateVolume(workout.exercises)

                const muscleGroups = [
                  ...new Set(
                    (workout.exercises || [])
                      .map((exercise) => exercise.muscleGroup)
                      .filter(Boolean)
                  ),
                ]

                return (
                  <article
                    key={workout._id}
                    className="overflow-hidden rounded-2xl border border-[var(--gt-border)] bg-[var(--gt-surface)]"
                  >
                    {/* Workout summary */}
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--gt-primary-light)] text-[var(--gt-primary)]">
                            <Dumbbell size={21} />
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-semibold text-[var(--gt-text-primary)]">
                              {muscleGroups.length > 0
                                ? muscleGroups.join(' & ')
                                : 'Workout Session'}
                            </h4>

                            <p className="mt-1 flex items-center gap-2 text-xs text-[var(--gt-text-secondary)]">
                              <CalendarDays size={14} />
                              {formatDate(workout.date)}
                            </p>

                            {muscleGroups.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {muscleGroups.map((group) => (
                                  <span
                                    key={group}
                                    className="rounded-md bg-[var(--gt-primary-light)] px-2.5 py-1 text-xs font-medium text-[var(--gt-primary)]"
                                  >
                                    {group}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Workout metrics */}
                        <div className="grid grid-cols-3 gap-4 border-t border-[var(--gt-border)] pt-4 sm:gap-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                          <div>
                            <p className="text-xs text-[var(--gt-text-muted)]">
                              Exercises
                            </p>
                            <p className="mt-1 text-sm font-semibold tabular-nums text-[var(--gt-text-primary)]">
                              {workout.exercises?.length || 0}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-[var(--gt-text-muted)]">
                              Volume
                            </p>
                            <p className="mt-1 text-sm font-semibold tabular-nums text-[var(--gt-text-primary)]">
                              {volume.toLocaleString()} kg
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-[var(--gt-text-muted)]">
                              Duration
                            </p>
                            <p className="mt-1 text-sm font-semibold tabular-nums text-[var(--gt-text-primary)]">
                              {workout.duration || 0} min
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--gt-border)] pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedWorkout(
                              isExpanded ? null : workout._id
                            )
                          }
                          className="flex items-center gap-2 text-sm font-semibold text-[var(--gt-primary)] transition hover:opacity-75"
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'}

                          {isExpanded ? (
                            <ChevronUp size={17} />
                          ) : (
                            <ChevronDown size={17} />
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/workouts/edit/${workout._id}`}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--gt-text-secondary)] transition hover:bg-[var(--gt-primary-light)] hover:text-[var(--gt-primary)]"
                          >
                            <Pencil size={15} />
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(workout._id)}
                            disabled={deletingId === workout._id}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 size={15} />
                            {deletingId === workout._id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="space-y-4 border-t border-[var(--gt-border)] bg-[var(--gt-background)] p-4 sm:p-6">
                        {(workout.exercises || []).map(
                          (exercise, exerciseIndex) => (
                            <div
                              key={
                                exercise._id ||
                                `${exercise.name}-${exerciseIndex}`
                              }
                              className="rounded-xl border border-[var(--gt-border)] bg-[var(--gt-surface)] p-4 sm:p-5"
                            >
                              <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                <div>
                                  <h5 className="font-semibold text-[var(--gt-text-primary)]">
                                    {exercise.name}
                                  </h5>

                                  <p className="mt-1 text-xs text-[var(--gt-primary)]">
                                    {exercise.muscleGroup || 'Other'}
                                  </p>
                                </div>

                                <span className="text-xs text-[var(--gt-text-muted)]">
                                  {exercise.sets?.length || 0} sets
                                </span>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full min-w-[400px] text-left text-sm">
                                  <thead>
                                    <tr className="border-b border-[var(--gt-border)] text-xs text-[var(--gt-text-muted)]">
                                      <th className="py-3 font-medium">Set</th>
                                      <th className="py-3 font-medium">Reps</th>
                                      <th className="py-3 font-medium">Weight</th>
                                      <th className="py-3 text-right font-medium">
                                        Volume
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {(exercise.sets || []).map(
                                      (set, index) => (
                                        <tr
                                          key={index}
                                          className="border-b border-[var(--gt-border)] last:border-0"
                                        >
                                          <td className="py-3 font-medium text-[var(--gt-text-primary)]">
                                            {set.setNumber || index + 1}
                                          </td>

                                          <td className="py-3 text-[var(--gt-text-secondary)]">
                                            {set.reps}
                                          </td>

                                          <td className="py-3 text-[var(--gt-text-secondary)]">
                                            {set.weight} kg
                                          </td>

                                          <td className="py-3 text-right font-medium text-[var(--gt-text-primary)]">
                                            {(
                                              (Number(set.reps) || 0) *
                                              (Number(set.weight) || 0)
                                            ).toLocaleString()}{' '}
                                            kg
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )
                        )}

                        {workout.notes && (
                          <div className="rounded-xl border border-[var(--gt-border)] bg-[var(--gt-surface)] p-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--gt-text-muted)]">
                              Workout Notes
                            </p>

                            <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--gt-text-secondary)]">
                              {workout.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <footer className="mt-10 border-t border-[var(--gt-border)] py-5 text-center">
          <p className="text-xs text-[var(--gt-text-muted)]">
            GymTrack — Your training, organized.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default WorkoutHistory
