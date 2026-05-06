'use client'

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import {
  detectColumns,
  getRequiredConcepts,
  CONCEPTS,
  type ConceptId,
  type ColumnMap,
} from '@/lib/column-detection'
import { OUTCOMES, type Outcome } from '@/lib/outcomes'
import Link from 'next/link'

type Step = 'select' | 'guide' | 'upload' | 'map' | 'confirm' | 'submitting'

interface Props {
  creditBalance: number
}

export default function UploadFlow({ creditBalance }: Props) {
  const [step, setStep] = useState<Step>('select')
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([])
  const [columnMap, setColumnMap] = useState<ColumnMap>({})
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalCredits = OUTCOMES
    .filter((o) => selectedOutcomes.includes(o.id))
    .reduce((sum, o) => sum + o.credits, 0)

  const canAfford = creditBalance >= totalCredits
  const requiredConcepts = getRequiredConcepts(selectedOutcomes)

  function toggleOutcome(id: string) {
    setSelectedOutcomes((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    )
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

    const res = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: 'Something went wrong.' }))
      setSubmitError(msg ?? 'Something went wrong.')
      setStep('confirm')
      return
    }

    const { reportId } = await res.json()
    window.location.href = `/reports/${reportId}`
  }

  // ── Step: Select outcomes ───────────────────────────────────────
  if (step === 'select') {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">What do you want to know?</h1>
        <p className="text-sm text-gray-500 mb-8">
          Pick one or more. We&apos;ll tell you exactly what to export before you upload.
        </p>

        <div className="space-y-3 mb-8">
          {OUTCOMES.map((outcome: Outcome) => {
            const selected = selectedOutcomes.includes(outcome.id)
            return (
              <button
                key={outcome.id}
                onClick={() => toggleOutcome(outcome.id)}
                className={`w-full text-left border rounded-xl p-4 transition-colors ${
                  selected
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{outcome.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{outcome.description}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                    {outcome.credits} {outcome.credits === 1 ? 'credit' : 'credits'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setStep('guide')}
          disabled={selectedOutcomes.length === 0}
          className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          Continue
        </button>
      </div>
    )
  }

  // ── Step: Export guide ──────────────────────────────────────────
  if (step === 'guide') {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Before you export</h1>
        <p className="text-sm text-gray-500 mb-8">
          Make sure your export includes these columns. The names don&apos;t have to match
          exactly — we&apos;ll help you match them up after you upload.
        </p>

        <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 mb-8">
          {requiredConcepts.map((conceptId: ConceptId) => {
            const concept = CONCEPTS[conceptId]
            return (
              <div key={conceptId} className="px-5 py-4">
                <p className="text-sm font-medium text-gray-900">{concept.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{concept.description}</p>
              </div>
            )
          })}
        </div>

        <p className="text-xs text-gray-400 mb-8">
          Once your export is ready, come back and upload it below.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep('upload')}
            className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            I have my file
          </button>
          <button
            onClick={() => setStep('select')}
            className="text-gray-500 px-5 py-2 rounded-lg text-sm hover:text-gray-900 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  // ── Step: Upload ────────────────────────────────────────────────
  if (step === 'upload') {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Upload your export</h1>
        <p className="text-sm text-gray-500 mb-8">
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
            dragging ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
          }`}
        >
          <p className="text-sm font-medium text-gray-700 mb-1">Drop your file here</p>
          <p className="text-xs text-gray-400">or click to browse</p>
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

        {fileError && <p className="text-sm text-red-600 mt-4">{fileError}</p>}

        <button
          onClick={() => setStep('guide')}
          className="text-gray-500 px-0 py-2 mt-4 text-sm hover:text-gray-900 transition-colors"
        >
          ← Back
        </button>
      </div>
    )
  }

  // ── Step: Column mapping ────────────────────────────────────────
  if (step === 'map') {
    const allMapped = requiredConcepts.every((c) => columnMap[c])

    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Match your columns</h1>
        <p className="text-sm text-gray-500 mb-8">
          We pre-filled what we could. Make sure everything looks right before continuing.
        </p>

        <div className="space-y-5 mb-8">
          {requiredConcepts.map((conceptId: ConceptId) => {
            const concept = CONCEPTS[conceptId]
            const value = columnMap[conceptId] ?? ''

            return (
              <div key={conceptId}>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="text-sm font-medium text-gray-900">
                    {concept.label}
                  </label>
                  <span className="text-xs text-gray-400">{concept.description}</span>
                </div>
                <select
                  value={value}
                  onChange={(e) =>
                    setColumnMap((prev) => ({ ...prev, [conceptId]: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white ${
                    value ? 'border-gray-300 text-gray-900' : 'border-amber-300 text-gray-500'
                  }`}
                >
                  <option value="">— select a column —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep('confirm')}
            disabled={!allMapped}
            className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            Looks right
          </button>
          <button
            onClick={() => { setFile(null); setHeaders([]); setStep('upload') }}
            className="text-gray-500 px-5 py-2 rounded-lg text-sm hover:text-gray-900 transition-colors"
          >
            Upload a different file
          </button>
        </div>
      </div>
    )
  }

  // ── Step: Confirm ───────────────────────────────────────────────
  if (step === 'confirm') {
    const chosen = OUTCOMES.filter((o) => selectedOutcomes.includes(o.id))
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Ready to run</h1>

        <div className="border border-gray-200 rounded-xl p-5 mb-6 space-y-2">
          {chosen.map((o) => (
            <div key={o.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{o.name}</span>
              <span className="text-gray-500">
                {o.credits} {o.credits === 1 ? 'credit' : 'credits'}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between text-sm font-medium">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">
              {totalCredits} {totalCredits === 1 ? 'credit' : 'credits'}
            </span>
          </div>
        </div>

        {submitError && <p className="text-sm text-red-600 mb-4">{submitError}</p>}

        <div className="flex items-center gap-3">
          {canAfford ? (
            <button
              onClick={handleConfirm}
              className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Run analysis
            </button>
          ) : (
            <Link
              href="/buy"
              className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Get more credits
            </Link>
          )}
          <button
            onClick={() => setStep('map')}
            className="text-gray-500 px-5 py-2 rounded-lg text-sm hover:text-gray-900 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  // ── Step: Submitting ────────────────────────────────────────────
  return (
    <div className="text-center py-16">
      <p className="text-sm text-gray-500">Running your analysis…</p>
    </div>
  )
}
