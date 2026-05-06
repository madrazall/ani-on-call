'use client'

import { useState, useRef, useCallback } from 'react'
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

type Step = 'upload' | 'select' | 'map' | 'confirm' | 'submitting'

interface Props {
  creditBalance: number
}

export default function UploadFlow({ creditBalance }: Props) {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([])
  const [columnMap, setColumnMap] = useState<ColumnMap>({})
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalCredits = OUTCOMES
    .filter((o) => selectedOutcomes.includes(o.id))
    .reduce((sum, o) => sum + o.credits, 0)

  const canAfford = creditBalance >= totalCredits

  async function processFile(f: File) {
    setError(null)

    if (!f.name.match(/\.(csv|xls|xlsx)$/i)) {
      setError('Please upload a CSV or Excel file (.csv, .xls, .xlsx).')
      return
    }

    try {
      const data = await f.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })

      if (rows.length < 2) {
        setError('This file looks empty — it needs at least a header row and one data row.')
        return
      }

      const fileHeaders = (rows[0] as string[]).filter(Boolean)

      if (fileHeaders.length < 3) {
        setError("This file doesn't have enough columns to work with.")
        return
      }

      setFile(f)
      setHeaders(fileHeaders)
      setStep('select')
    } catch {
      setError('We had trouble reading that file. Try saving it as CSV and uploading again.')
    }
  }

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) await processFile(f)
  }, [])

  function goToMap() {
    // Auto-detect columns and pre-fill the map
    const detected = detectColumns(headers)
    const required = getRequiredConcepts(selectedOutcomes)
    const initial: ColumnMap = {}
    for (const concept of required) {
      initial[concept] = detected[concept]?.column ?? ''
    }
    setColumnMap(initial)
    setStep('map')
  }

  function toggleOutcome(id: string) {
    setSelectedOutcomes((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    )
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
      setError(msg ?? 'Something went wrong.')
      setStep('confirm')
      return
    }

    const { reportId } = await res.json()
    window.location.href = `/reports/${reportId}`
  }

  // ── Step: Upload ────────────────────────────────────────────────
  if (step === 'upload') {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Upload your export</h1>
        <p className="text-sm text-gray-500 mb-8">
          CSV or Excel. Works with any shipping platform — ShipStation, Shopify, Pirateship,
          Magento, and more.
        </p>

        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors ${
            dragging ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
          }`}
        >
          <p className="text-sm font-medium text-gray-700 mb-1">Drop your file here</p>
          <p className="text-xs text-gray-400">or click to browse — CSV or Excel</p>
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

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>
    )
  }

  // ── Step: Select outcomes ───────────────────────────────────────
  if (step === 'select') {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">What do you want to know?</h1>
        <p className="text-sm text-gray-500 mb-8">
          Pick one or more. Credits are only deducted when you confirm.
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

        <div className="flex items-center gap-3">
          <button
            onClick={goToMap}
            disabled={selectedOutcomes.length === 0}
            className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            Continue
          </button>
          <button
            onClick={() => { setFile(null); setHeaders([]); setSelectedOutcomes([]); setStep('upload') }}
            className="text-gray-500 px-5 py-2 rounded-lg text-sm hover:text-gray-900 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  // ── Step: Column mapping ────────────────────────────────────────
  if (step === 'map') {
    const required = getRequiredConcepts(selectedOutcomes)
    const allMapped = required.every((c) => columnMap[c])

    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Match your columns</h1>
        <p className="text-sm text-gray-500 mb-8">
          We pre-filled what we could. Check that everything looks right — these are the
          columns we&apos;ll use to run your analysis.
        </p>

        <div className="space-y-4 mb-8">
          {required.map((conceptId) => {
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
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                    value ? 'border-gray-300 text-gray-900' : 'border-amber-300 text-gray-400'
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
            onClick={() => setStep('select')}
            className="text-gray-500 px-5 py-2 rounded-lg text-sm hover:text-gray-900 transition-colors"
          >
            Back
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

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

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
