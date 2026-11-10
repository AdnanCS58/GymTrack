
import { useEffect, useState } from 'react'
import {
  Activity,
  Plus,
  Scale,
  Ruler,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  ClipboardList,
} from 'lucide-react'

import {
  createMeasurement,
  getMeasurements,
} from '../services/bodyMeasurementService'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const getToday = () => {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .split('T')[0]
}

const initialForm = {
  date: getToday(),
  weight: '',
  chest: '',
  arm: '',
  waist: '',
  shoulder: '',
  thigh: '',
  notes: '',
}

const fields = [
  { name: 'chest', label: 'Chest' },
  { name: 'arm', label: 'Arm' },
  { name: 'waist', label: 'Waist' },
  { name: 'shoulder', label: 'Shoulders' },
  { name: 'thigh', label: 'Thigh' },
]

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

const BodyProgress = () => {
  const [form, setForm] = useState(initialForm)
  const [measurements, setMeasurements] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchMeasurements = async () => {
    try {
      setLoading(true)
      const data = await getMeasurements()

      const sorted = [...(data.measurements || [])].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      )

      setMeasurements(sorted)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load measurements'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeasurements()
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.weight || Number(form.weight) <= 0) {
      setError('Please enter a valid body weight.')
      return
    }

    try {
      setSaving(true)

      const payload = {
        date: form.date,
        weight: Number(form.weight),
        notes: form.notes,
      }

      fields.forEach((field) => {
        payload[field.name] =
          form[field.name] === ''
            ? null
            : Number(form[field.name])
      })

      await createMeasurement(payload)

      setSuccess('Measurement saved successfully.')
      setForm({
        ...initialForm,
        date: getToday(),
      })

      await fetchMeasurements()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to save measurement.'
      )
    } finally {
      setSaving(false)
    }
  }

  const latest = measurements[0]
  const oldest = measurements[measurements.length - 1]

  const weightChange =
    latest && oldest
      ? Number((latest.weight - oldest.weight).toFixed(1))
      : 0

  const chartData = [...measurements]
    .reverse()
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      }),
      fullDate: formatDate(item.date),
      weight: item.weight,
    }))

  const inputClass =
    'gt-input'

  const cardClass =
    'gt-card'

  const summaryCards = [
    {
      title: 'Current Weight',
      value: latest ? `${latest.weight} kg` : '--',
      description: latest
        ? `Last updated ${formatDate(latest.date)}`
        : 'No measurements recorded',
      icon: Scale,
    },
    {
      title: 'Total Records',
      value: measurements.length,
      description: 'Saved measurement entries',
      icon: ClipboardList,
    },
    {
      title: 'Weight Change',
      value: `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`,
      description: 'Since your first recorded entry',
      icon:
        weightChange > 0
          ? TrendingUp
          : TrendingDown,
      positive: weightChange > 0,
      negative: weightChange < 0,
    },
  ]

  return (
    <div className="gt-page">
      <div className="gt-container space-y-8">

        {/* Page Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--gt-primary)]">
              <Activity size={18} />
              Progress Tracking
            </div>

            <h1 className="gt-page-title">
              Body Progress
            </h1>

            <p className="gt-description mt-2">
              Monitor your body weight and physical measurements over time.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--gt-text-secondary)]">
            <CalendarDays size={17} />
            {new Date().toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </header>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon

            return (
              <div
                key={card.title}
                className={`${cardClass} flex items-start justify-between gap-4`}
              >
                <div>
                  <p className="text-sm font-medium text-[var(--gt-text-secondary)]">
                    {card.title}
                  </p>

                  <p
                    className={`mt-3 text-3xl font-bold tracking-tight ${
                      card.positive
                        ? 'text-[var(--gt-success)]'
                        : card.negative
                          ? 'text-[var(--gt-danger)]'
                          : 'text-[var(--gt-text-primary)]'
                    }`}
                  >
                    {card.value}
                  </p>

                  <p className="mt-2 text-xs text-[var(--gt-text-muted)]">
                    {card.description}
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--gt-primary-light)] p-3 text-[var(--gt-primary)]">
                  <Icon size={21} />
                </div>
              </div>
            )
          })}
        </section>

        {/* Weight Progress Chart */}
        <section className={cardClass}>
          <div className="mb-7">
            <h2 className="gt-section-title">
              Weight Progress
            </h2>

            <p className="gt-description mt-1">
              Visualize how your body weight changes over time.
            </p>
          </div>

          {loading ? (
            <div className="flex h-72 items-center justify-center text-sm text-[var(--gt-text-secondary)]">
              Loading weight history...
            </div>
          ) : chartData.length < 2 ? (
            <div className="flex h-72 flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-xl bg-[var(--gt-primary-light)] p-4 text-[var(--gt-primary)]">
                <TrendingUp size={28} />
              </div>

              <p className="font-semibold text-[var(--gt-text-primary)]">
                Not enough data yet
              </p>

              <p className="gt-description mt-2 max-w-sm">
                Record at least two measurements to see your weight progression chart.
              </p>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 15,
                    left: 5,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    stroke="var(--gt-border)"
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: 'var(--gt-text-secondary)',
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                    dy={12}
                  />

                  <YAxis
                    domain={['dataMin - 1', 'dataMax + 1']}
                    tick={{
                      fill: 'var(--gt-text-secondary)',
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                    tickFormatter={(value) => `${value} kg`}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--gt-surface)',
                      border: '1px solid var(--gt-border)',
                      borderRadius: '12px',
                      color: 'var(--gt-text-primary)',
                      fontSize: '13px',
                    }}
                    labelStyle={{
                      color: 'var(--gt-text-secondary)',
                      marginBottom: '5px',
                    }}
                    labelFormatter={(label, payload) =>
                      payload?.[0]?.payload?.fullDate || label
                    }
                    formatter={(value) => [
                      `${value} kg`,
                      'Weight',
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--gt-primary)"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: 'var(--gt-primary)',
                      strokeWidth: 2,
                      stroke: 'var(--gt-surface)',
                    }}
                    activeDot={{
                      r: 7,
                      fill: 'var(--gt-primary)',
                      stroke: 'var(--gt-surface)',
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Add Measurement Form */}
        <section className={cardClass}>
          <div className="mb-7">
            <h2 className="gt-section-title">
              Add Body Measurement
            </h2>

            <p className="gt-description mt-1">
              Record your current weight and body dimensions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Date and Weight */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="gt-label">
                  Measurement Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="gt-label">
                  Body Weight (kg) *
                </label>

                <input
                  type="number"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="Enter your weight"
                  min="1"
                  step="0.1"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Body Dimensions */}
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[var(--gt-text-primary)]">
                  Body Measurements
                </h3>

                <p className="mt-1 text-xs text-[var(--gt-text-muted)]">
                  All measurements are in centimeters (cm). These fields are optional.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {fields.map((field) => (
                  <div key={field.name}>
                    <label className="gt-label">
                      {field.label} (cm)
                    </label>

                    <input
                      type="number"
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      min="0"
                      step="0.1"
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="gt-label">
                Notes
              </label>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Add any observations about your progress..."
                className={`${inputClass} resize-y`}
              />
            </div>

            {/* Feedback */}
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-[var(--gt-danger)]">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-[var(--gt-success)]">
                {success}
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end border-t border-[var(--gt-border)] pt-5">
              <button
                type="submit"
                disabled={saving}
                className="gt-button-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={18} />
                {saving ? 'Saving...' : 'Save Measurement'}
              </button>
            </div>
          </form>
        </section>

        {/* Measurement History */}
        <section className={cardClass}>
          <div className="mb-6">
            <h2 className="gt-section-title">
              Measurement History
            </h2>

            <p className="gt-description mt-1">
              Review your previously recorded measurements.
            </p>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-[var(--gt-text-secondary)]">
              Loading measurements...
            </div>
          ) : measurements.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 w-fit rounded-xl bg-[var(--gt-primary-light)] p-4 text-[var(--gt-primary)]">
                <Ruler size={25} />
              </div>

              <p className="font-medium text-[var(--gt-text-primary)]">
                No measurements recorded
              </p>

              <p className="gt-description mt-1">
                Your saved measurements will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {measurements.map((item) => (
                <article
                  key={item._id}
                  className="rounded-xl border border-[var(--gt-border)] p-4 transition-colors hover:bg-[var(--gt-background)]"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold text-[var(--gt-primary)]">
                        {item.weight} kg
                      </p>

                      <p className="mt-1 text-xs text-[var(--gt-text-muted)]">
                        Body weight
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-[var(--gt-text-secondary)]">
                      <CalendarDays size={15} />
                      {formatDate(item.date)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-[var(--gt-border)] pt-4 sm:grid-cols-3 lg:grid-cols-5">
                    {fields.map((field) => (
                      <div key={field.name}>
                        <p className="text-xs text-[var(--gt-text-muted)]">
                          {field.label}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[var(--gt-text-primary)]">
                          {item[field.name] != null
                            ? `${item[field.name]} cm`
                            : '--'}
                        </p>
                      </div>
                    ))}
                  </div>

                  {item.notes && (
                    <p className="mt-4 border-t border-[var(--gt-border)] pt-3 text-sm leading-6 text-[var(--gt-text-secondary)]">
                      {item.notes}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

export default BodyProgress
