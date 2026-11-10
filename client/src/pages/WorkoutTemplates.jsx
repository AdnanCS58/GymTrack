
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Dumbbell,
  Plus,
  Trash2,
  Pencil,
  Play,
  RefreshCw,
  ClipboardList,
  Activity,
} from 'lucide-react'
import api from '../services/api'

const WorkoutTemplates = () => {
  const navigate = useNavigate()

  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/workout-templates')

      setTemplates(
        Array.isArray(response.data)
          ? response.data
          : response.data.templates || []
      )
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load your workout templates.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleDelete = async (template) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${template.name}"? This cannot be undone.`
    )

    if (!confirmed) return

    try {
      setDeletingId(template._id)
      setError('')

      await api.delete(`/workout-templates/${template._id}`)

      setTemplates((previous) =>
        previous.filter((item) => item._id !== template._id)
      )
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not delete this template.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleLoadTemplate = (template) => {
    navigate('/workouts/new', {
      state: {
        selectedExercises: template.exercises,
      },
    })
  }

  const statistics = useMemo(() => {
    return {
      totalTemplates: templates.length,
      totalExercises: templates.reduce(
        (total, template) =>
          total + (template.exercises?.length || 0),
        0
      ),
    }
  }, [templates])

  return (
    <div className="gt-page">
      <div className="gt-container" style={{ maxWidth: '1100px' }}>

        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              to="/dashboard"
              aria-label="Back to dashboard"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--gt-border)] bg-[var(--gt-surface)] text-[var(--gt-text-secondary)] transition hover:border-[var(--gt-primary)] hover:text-[var(--gt-primary)]"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--gt-text-muted)]">
                GymTrack
              </p>

              <h1 className="text-lg font-semibold text-[var(--gt-text-primary)]">
                Workout Templates
              </h1>
            </div>
          </div>

          <Link
            to="/exercises"
            className="gt-button-primary shrink-0"
          >
            <Plus size={17} />
            <span className="hidden sm:inline">Create Template</span>
            <span className="sm:hidden">Create</span>
          </Link>
        </header>

        {/* Page Heading */}
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--gt-primary)]">
            <Activity size={16} />
            Training Tools
          </div>

          <h2 className="gt-page-title">
            Your Workout Templates
          </h2>

          <p className="gt-description mt-2 max-w-2xl">
            Save your favorite exercise combinations, organize your
            training routines, and quickly load them into your workout logger.
          </p>
        </section>

        {/* Statistics */}
        <section className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="gt-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--gt-text-secondary)]">
                Saved Templates
              </span>

              <ClipboardList
                size={19}
                className="text-[var(--gt-primary)]"
              />
            </div>

            <p className="mt-4 text-3xl font-semibold tabular-nums text-[var(--gt-text-primary)]">
              {statistics.totalTemplates}
            </p>

            <p className="mt-1 text-xs text-[var(--gt-text-muted)]">
              Your saved workout routines
            </p>
          </div>

          <div className="gt-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--gt-text-secondary)]">
                Total Saved Exercises
              </span>

              <Dumbbell
                size={19}
                className="text-[var(--gt-primary)]"
              />
            </div>

            <p className="mt-4 text-3xl font-semibold tabular-nums text-[var(--gt-text-primary)]">
              {statistics.totalExercises}
            </p>

            <p className="mt-1 text-xs text-[var(--gt-text-muted)]">
              Exercises across all templates
            </p>
          </div>

        </section>

        {/* Template List */}
        <section>

          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="gt-section-title">
                Your Templates
              </h3>

              <p className="gt-description mt-1">
                Select a template to start a workout or manage your routines.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchTemplates}
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
                Loading your templates...
              </p>
            </div>
          ) : templates.length === 0 ? (

            /* Empty State */
            <div className="gt-card px-5 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--gt-primary-light)] text-[var(--gt-primary)]">
                <Dumbbell size={28} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-[var(--gt-text-primary)]">
                No workout templates yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--gt-text-secondary)]">
                Create your first template by selecting exercises
                from the Exercise Library.
              </p>

              <Link
                to="/exercises"
                className="gt-button-primary mt-6"
              >
                <Plus size={17} />
                Create Your First Template
              </Link>
            </div>

          ) : (

            /* Template Cards */
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

              {templates.map((template) => {
                const muscleGroups = [
                  ...new Set(
                    (template.exercises || [])
                      .map((exercise) => exercise.muscleGroup)
                      .filter(Boolean)
                  ),
                ]

                return (
                  <article
                    key={template._id}
                    className="overflow-hidden rounded-2xl border border-[var(--gt-border)] bg-[var(--gt-surface)]"
                  >
                    <div className="p-5 sm:p-6">

                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--gt-primary-light)] text-[var(--gt-primary)]">
                            <Dumbbell size={21} />
                          </div>

                          <div className="min-w-0">
                            <h4 className="break-words font-semibold text-[var(--gt-text-primary)]">
                              {template.name}
                            </h4>

                            <p className="mt-1 text-xs text-[var(--gt-text-secondary)]">
                              {template.exercises?.length || 0} exercises
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/workout-templates/${template._id}/edit`
                              )
                            }
                            aria-label="Edit template"
                            title="Edit template"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--gt-text-secondary)] transition hover:bg-[var(--gt-primary-light)] hover:text-[var(--gt-primary)]"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(template)}
                            disabled={deletingId === template._id}
                            aria-label="Delete template"
                            title="Delete template"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/30"
                          >
                            {deletingId === template._id ? (
                              <RefreshCw
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Muscle Groups */}
                      {muscleGroups.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
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

                      {/* Exercise List */}
                      <div className="mt-5 border-t border-[var(--gt-border)] pt-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gt-text-muted)]">
                            Exercises
                          </p>

                          <span className="text-xs text-[var(--gt-text-muted)]">
                            {template.exercises?.length || 0} total
                          </span>
                        </div>

                        <div className="space-y-3">
                          {template.exercises?.slice(0, 4).map(
                            (exercise, index) => (
                              <div
                                key={exercise._id || index}
                                className="flex items-center justify-between gap-3"
                              >
                                <span className="min-w-0 truncate text-sm font-medium text-[var(--gt-text-primary)]">
                                  {exercise.name}
                                </span>

                                <span className="shrink-0 text-xs text-[var(--gt-text-muted)]">
                                  {exercise.muscleGroup}
                                </span>
                              </div>
                            )
                          )}

                          {template.exercises?.length > 4 && (
                            <p className="pt-1 text-xs font-medium text-[var(--gt-primary)]">
                              +{template.exercises.length - 4} more exercises
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Load Template */}
                      <div className="mt-5 border-t border-[var(--gt-border)] pt-4">
                        <button
                          type="button"
                          onClick={() => handleLoadTemplate(template)}
                          className="gt-button-primary w-full justify-center"
                        >
                          <Play size={16} />
                          Use This Template
                        </button>
                      </div>

                    </div>
                  </article>
                )
              })}

            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-[var(--gt-border)] py-5 text-center">
          <p className="text-xs text-[var(--gt-text-muted)]">
            GymTrack — Your training, organized.
          </p>
        </footer>

      </div>
    </div>
  )
}

export default WorkoutTemplates
