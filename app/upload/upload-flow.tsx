'use client'

import { Suspense, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import * as XLSX from 'xlsx'
import {
  detectColumns,
  getRequiredConcepts,
  CONCEPTS,
  type ConceptId,
  type ColumnMap,
} from '@/lib/column-detection'
import { OUTCOMES } from '@/lib/outcomes'
import { shippingTree, resolveRoute, type Category, type Answers } from '@/lib/intake'
import Link from 'next/link'

type Step = 'select' | 'guide' | 'upload' | 'map' | 'confirm' | 'submitting'

const STEPS: Step[] = ['select', 'guide', 'upload', 'map', 'confirm', 'submitting']
const STEP_LABELS = ['Select', 'Guide', 'Upload', 'Map', 'Confirm', 'Run']

interface Props {
  creditBalance: number
}

function ProgressBar({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="flex items-start mb-10">
      {STEPS.map((s, i) => {
        const isDone = i < stepIndex
        const isActive = i === stepIndex
        return (
          <div key={s} className="flex items-start">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  isDone
                    ? 'bg-ani-copper'
                    : isActive
                    ? 'border-2 border-ani-copper bg-transparent'
                    : 'bg-ani-border'
                }`}
              />
              <span
                className={`text-[10px] font-mono tracking-wide leading-none ${
                  isActive ? 'text-ani-copper' : 'text-ani-muted'
                }`}
              >
                {STEP_LABELS[i]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-8 mt-[5px] mx-1 transition-colors ${
                  i < stepIndex ? 'bg-ani-copper' : 'bg-ani-border'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function BottomBar({
  totalCredits,
  canProceed,
  onProceed,
  onBack,
  ctaLabel,
  buyLink = false,
}: {
  totalCredits: number
  canProceed: boolean
  onProceed: (() => void) | null
  onBack: (() => void) | null
  ctaLabel: string
  buyLink?: boolean
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-ani-border bg-ani-bg">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <span className="text-xs font-mono text-ani-muted">
          {totalCredits > 0
            ? `${totalCredits} ${totalCredits === 1 ? 'credit' : 'credits'} selected`
            : 'No credits selected'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onBack ?? undefined}
            disabled={!onBack}
            className="text-sm px-4 py-2 rounded-lg text-ani-muted hover:text-ani-white transition-colors disabled:pointer-events-none disabled:opacity-0"
          >
            Back
          </button>
          {buyLink ? (
            <Link
              href="/buy"
              className="text-sm bg-ani-copper text-ani-white px-5 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              {ctaLabel}
            </Link>
          ) : (
            <button
              onClick={onProceed ?? undefined}
              disabled={!canProceed || !onProceed}
              className="text-sm bg-ani-copper text-ani-white px-5 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {ctaLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function UploadFlowInner({ creditBalance }: Props) {
  const searchParams = useSearchParams()
  const requestedOutcome = searchParams.get('outcome')
  const preselectedOutcome =
    requestedOutcome && OUTCOMES.some((o) => o.id === requestedOutcome) ? requestedOutcome : null

  const [step, setStep] = useState<Step>(preselectedOutcome ? 'guide' : 'select')

  // Intake state
  const [intakeCategory, setIntakeCategory] = useState<Category | null>(null)
  const [intakeAnswers, setIntakeAnswers] = useState<Answers>({})
  const [intakeQIndex, setIntakeQIndex] = useState(0)

  // Upload state
  const [file, setFile] = useState<File | null>(null)
  const [fileStats, setFileStats] = useState<{ rows: number; cols: number } | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>(
    preselectedOutcome ? [preselectedOutcome] : []
  )
  const [columnMap, setColumnMap] = useState<ColumnMap>({})
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [liveBalance, setLiveBalance] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalCredits = OUTCOMES
    .filter((o) => selectedOutcomes.includes(o.id))
    .reduce((sum, o) => sum + o.credits, 0)

  const effectiveBalance = liveBalance ?? creditBalance
  const hasCredits = effectiveBalance >= totalCredits
  const requiredConcepts = getRequiredConcepts(selectedOutcomes)
  const stepIndex = STEPS.indexOf(step)
  const allMapped = requiredConcepts.every((c) => columnMap[c])

  async function goToConfirm() {
    const res = await fetch('/api/credits')
    const { balance } = await res.json()
    setLiveBalance(balance)
    setStep('confirm')
  }

  async function processFile(f: File) {
    setFileError(null)
    if (!f.name.match(/\.(csv|xls|xlsx)$/i)) {
      setFileError('Please upload a CSV or Excel file (.csv, .xls, .xlsx).')
      return
    }
    try {
      const data = await f.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })
      if (rows.length < 2) {
        setFileError('This file looks empty — it needs at least a header row and one data row.')
        return
      }
      const fileHeaders = (rows[0] as string[]).filter(Boolean)
      if (fileHeaders.length < 2) {
        setFileError("This file doesn't have enough columns to work with.")
        return
      }
      const detected = detectColumns(fileHeaders)
      const initial: ColumnMap = {}
      for (const concept of requiredConcepts) {
        initial[concept] = detected[concept]?.column ?? ''
      }
      setFile(f)
      setFileStats({ rows: rows.length - 1, cols: fileHeaders.length })
      setHeaders(fileHeaders)
      setColumnMap(initial)
      setStep('map')
    } catch {
      setFileError('We had trouble reading that file. Try saving it as CSV and uploading again.')
    }
  }

  async function handleConfirm() {
    if (!file || selectedOutcomes.length === 0) return
    setStep('submitting')
    const formData = new FormData()
    formData.append('file', file)
    selectedOutcomes.forEach((id) => formData.append('outcomeIds', id))
    formData.append('columnMap', JSON.stringify(columnMap))
    const res = await fetch('/api/analyze', { method: 'POST', body: formData })
    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: 'Something went wrong.' }))
      setSubmitError(msg ?? 'Something went wrong.')
      setStep('confirm')
      return
    }
    const { reportId } = await res.json()
    window.location.href = `/reports/${reportId}`
  }

  // ── Step: Select — intake engine ────────────────────────────────────
  if (step === 'select') {

    // Phase 1: category selection
    if (!intakeCategory) {
      return (
        <div className="pb-24">
          <ProgressBar stepIndex={stepIndex} />
          <h1 className="font-mono text-2xl font-bold text-ani-white mb-2">
            What&apos;s going on?
          </h1>
          <p className="text-sm text-ani-muted mb-8">Pick the one that fits best.</p>
          <div className="space-y-3">
            {shippingTree.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setIntakeCategory(cat)
                  setIntakeAnswers({})
                  setIntakeQIndex(0)
                }}
                className="w-full text-left border border-ani-border bg-ani-surface rounded-xl p-5 hover:border-ani-muted transition-colors group"
              >
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="text-sm font-mono font-medium text-ani-white">{cat.label}</p>
                    <p className="text-xs text-ani-muted mt-0.5">{cat.tagline}</p>
                  </div>
                  <span className="text-ani-muted group-hover:text-ani-white transition-colors text-lg leading-none">›</span>
                </div>
              </button>
            ))}
          </div>
          <BottomBar
            totalCredits={0}
            canProceed={false}
            onProceed={null}
            onBack={null}
            ctaLabel="Pick a category"
          />
        </div>
      )
    }

    // Phase 2: questions
    const question = intakeCategory.questions[intakeQIndex]
    const questionCount = intakeCategory.questions.length

    function handleAnswer(value: boolean | string) {
      const newAnswers = { ...intakeAnswers, [question.stateKey]: value }
      setIntakeAnswers(newAnswers)

      const isLast = intakeQIndex >= questionCount - 1
      if (isLast) {
        const outcomeId = resolveRoute(intakeCategory!, newAnswers)
        setSelectedOutcomes([outcomeId])
        setStep('guide')
      } else {
        setIntakeQIndex(intakeQIndex + 1)
      }
    }

    function handleBack() {
      if (intakeQIndex === 0) {
        setIntakeCategory(null)
      } else {
        setIntakeQIndex(intakeQIndex - 1)
      }
    }

    return (
      <div className="pb-24">
        <ProgressBar stepIndex={stepIndex} />

        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-mono text-ani-muted">{intakeCategory.label}</span>
          {questionCount > 1 && (
            <span className="text-xs font-mono text-ani-muted">
              {intakeQIndex + 1} / {questionCount}
            </span>
          )}
        </div>

        <h1 className="font-mono text-2xl font-bold text-ani-white mb-8">
          {question.text}
        </h1>

        {question.type === 'binary' && (
          <div className="flex flex-col sm:flex-row gap-3">
            {['Yes', 'No'].map((label) => (
              <button
                key={label}
                onClick={() => handleAnswer(label === 'Yes')}
                className="flex-1 border border-ani-border bg-ani-surface rounded-xl px-6 py-5 text-left hover:border-ani-copper-mid hover:bg-ani-copper-dim transition-colors group"
              >
                <p className="text-sm font-mono font-medium text-ani-white">{label}</p>
              </button>
            ))}
          </div>
        )}

        {question.type === 'select' && (
          <div className="space-y-3">
            {question.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                className="w-full text-left border border-ani-border bg-ani-surface rounded-xl px-5 py-4 hover:border-ani-copper-mid hover:bg-ani-copper-dim transition-colors group"
              >
                <div className="flex justify-between items-center gap-4">
                  <p className="text-sm font-mono font-medium text-ani-white">{opt.label}</p>
                  <span className="text-ani-muted group-hover:text-ani-white transition-colors text-lg leading-none">›</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <BottomBar
          totalCredits={0}
          canProceed={false}
          onProceed={null}
          onBack={handleBack}
          ctaLabel="Select an option"
        />
      </div>
    )
  }

  // ── Step: Guide ─────────────────────────────────────────────────────
  if (step === 'guide') {
    return (
      <div className="pb-24">
        <ProgressBar stepIndex={stepIndex} />
        <h1 className="font-mono text-2xl font-bold text-ani-white mb-2">Before you export</h1>
        <p className="text-sm text-ani-muted mb-8">
          Make sure your export includes these columns. The names don&apos;t have to match
          exactly — we&apos;ll help you match them up after you upload.
        </p>
        <p className="text-xs font-mono text-ani-muted uppercase tracking-wide mb-3">Here&apos;s what Ani will look at for you:</p>
        <div className="border border-ani-border rounded-xl divide-y divide-ani-border mb-6 bg-ani-surface overflow-hidden">
          {requiredConcepts.map((conceptId: ConceptId) => {
            const concept = CONCEPTS[conceptId]
            return (
              <div key={conceptId} className="px-5 py-4">
                <p className="text-sm font-medium text-ani-white">{concept.label}</p>
                <p className="text-xs text-ani-muted mt-0.5">{concept.description}</p>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-ani-muted mb-8">
          This analysis costs <span className="text-ani-white font-medium">{totalCredits} {totalCredits === 1 ? 'credit' : 'credits'}</span> from your balance. Once your export is ready, come back and upload it.
        </p>
        <BottomBar
          totalCredits={totalCredits}
          canProceed={true}
          onProceed={() => setStep('upload')}
          onBack={() => {
            setSelectedOutcomes([])
            setIntakeCategory(null)
            setIntakeAnswers({})
            setIntakeQIndex(0)
            setStep('select')
          }}
          ctaLabel="I have my file"
        />
      </div>
    )
  }

  // ── Step: Upload ────────────────────────────────────────────────────
  if (step === 'upload') {
    return (
      <div className="pb-24">
        <ProgressBar stepIndex={stepIndex} />
        <h1 className="font-mono text-2xl font-bold text-ani-white mb-2">Upload your export</h1>
        <p className="text-sm text-ani-muted mb-8">
          CSV or Excel. Any shipping platform works.
        </p>
        <div
          onDrop={async (e) => {
            e.preventDefault()
            setDragging(false)
            const f = e.dataTransfer.files[0]
            if (f) await processFile(f)
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors ${
            dragging
              ? 'border-ani-copper bg-ani-copper-dim'
              : 'border-ani-border bg-ani-surface hover:border-ani-muted'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-ani-surface2 border border-ani-border flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-ani-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-sm font-medium text-ani-white mb-1">Drop your file here</p>
          <p className="text-xs text-ani-muted">or click to browse · CSV, XLS, XLSX</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (f) await processFile(f)
            }}
          />
        </div>
        {fileError && (
          <p className="text-sm text-ani-red mt-4 bg-ani-red-dim px-4 py-3 rounded-lg">{fileError}</p>
        )}
        <BottomBar
          totalCredits={totalCredits}
          canProceed={false}
          onProceed={null}
          onBack={() => setStep('guide')}
          ctaLabel="Drop a file to continue"
        />
      </div>
    )
  }

  // ── Step: Map ───────────────────────────────────────────────────────
  if (step === 'map') {
    return (
      <div className="pb-24">
        <ProgressBar stepIndex={stepIndex} />
        <h1 className="font-mono text-2xl font-bold text-ani-white mb-2">Match your columns</h1>
        <p className="text-sm text-ani-muted mb-4">
          Help Ani find the right columns in your file. She&apos;ll do her best to match them automatically — just confirm or correct below.
        </p>
        {fileStats && file && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono text-ani-copper bg-ani-surface border border-ani-border rounded-lg px-3 py-1.5 truncate max-w-[200px]">
                {file.name}
              </span>
            </div>
            <p className="text-xs text-ani-muted">
              Looks good! Ani found <span className="text-ani-white">{fileStats.rows.toLocaleString()} shipment rows</span> across <span className="text-ani-white">{fileStats.cols} columns</span>. Here&apos;s what she&apos;ll work with.
            </p>
          </div>
        )}
        <div className="space-y-5 mb-8">
          {requiredConcepts.map((conceptId: ConceptId) => {
            const concept = CONCEPTS[conceptId]
            const value = columnMap[conceptId] ?? ''
            return (
              <div key={conceptId}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <label className="text-sm font-mono font-medium text-ani-white">
                    {concept.label}
                  </label>
                  <span className="text-xs text-ani-muted">{concept.description}</span>
                </div>
                <select
                  value={value}
                  onChange={(e) =>
                    setColumnMap((prev) => ({ ...prev, [conceptId]: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ani-copper bg-ani-surface2 text-ani-white ${
                    value ? 'border-ani-border' : 'border-ani-copper-mid'
                  }`}
                >
                  <option value="">— select a column —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
        <BottomBar
          totalCredits={totalCredits}
          canProceed={allMapped}
          onProceed={goToConfirm}
          onBack={() => { setFile(null); setFileStats(null); setHeaders([]); setStep('upload') }}
          ctaLabel="Looks right"
        />
      </div>
    )
  }

  // ── Step: Confirm ───────────────────────────────────────────────────
  if (step === 'confirm') {
    const chosen = OUTCOMES.filter((o) => selectedOutcomes.includes(o.id))
    return (
      <div className="pb-24">
        <ProgressBar stepIndex={stepIndex} />
        <h1 className="font-mono text-2xl font-bold text-ani-white mb-2">Ready to run</h1>
        <p className="text-sm text-ani-muted mb-6">
          {hasCredits
            ? "You're good to go. Ani's ready when you are."
            : "You're a little short for this one. No worries — grab a few more credits and you'll be all set."}
        </p>
        <div className="border border-ani-border rounded-xl p-5 mb-4 space-y-2 bg-ani-surface">
          {chosen.map((o) => (
            <div key={o.id} className="flex justify-between text-sm">
              <span className="text-ani-white">{o.name}</span>
              <span className="text-ani-muted font-mono">
                {o.credits} {o.credits === 1 ? 'credit' : 'credits'}
              </span>
            </div>
          ))}
          <div className="border-t border-ani-border pt-2 mt-2 flex justify-between text-sm font-medium">
            <span className="text-ani-white">This report will use</span>
            <span className="text-ani-copper font-mono">
              {totalCredits} {totalCredits === 1 ? 'credit' : 'credits'}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs text-ani-muted mb-6 px-1">
          <span>You currently have</span>
          <span className="font-mono">{effectiveBalance} {effectiveBalance === 1 ? 'credit' : 'credits'} available</span>
        </div>
        {submitError && (
          <p className="text-sm text-ani-red mb-4 bg-ani-red-dim px-4 py-3 rounded-lg">{submitError}</p>
        )}
        <BottomBar
          totalCredits={totalCredits}
          canProceed={hasCredits}
          onProceed={hasCredits ? handleConfirm : null}
          onBack={() => setStep('map')}
          ctaLabel={hasCredits ? 'Run analysis' : 'Top up credits'}
          buyLink={!hasCredits}
        />
      </div>
    )
  }

  // ── Step: Submitting ────────────────────────────────────────────────
  return (
    <div className="text-center py-24">
      <div className="inline-flex items-center gap-2 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-ani-copper animate-pulse" />
        <div className="w-1.5 h-1.5 rounded-full bg-ani-copper animate-pulse [animation-delay:150ms]" />
        <div className="w-1.5 h-1.5 rounded-full bg-ani-copper animate-pulse [animation-delay:300ms]" />
      </div>
      <p className="font-mono text-lg text-ani-white">Ani&apos;s on it.</p>
      <p className="text-sm text-ani-muted mt-2">Running your analysis…</p>
    </div>
  )
}

export default function UploadFlow(props: Props) {
  return (
    <Suspense>
      <UploadFlowInner {...props} />
    </Suspense>
  )
}
