'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OUTCOMES } from '@/lib/outcomes'

export default function UploadPage() {
  const router = useRouter()
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'upload' | 'analyzing'>('select')

  const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5MB

  function validateAndSetFile(f: File) {
    if (f.size > MAX_FILE_BYTES) {
      setFileError('File is too large. Please upload a file under 5MB.')
      setFile(null)
      return
    }
    setFileError(null)
    setFile(f)
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  async function handleAnalyze() {
    if (!file || !selectedOutcome) return
    setStep('analyzing')
    // TODO: call your analysis API
    // router.push(`/results?outcome=${selectedOutcome}`)
  }

  if (step === 'analyzing') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-border border-t-foreground animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Running the numbers…</h2>
        <p className="text-sm text-muted-foreground">
          This usually takes about 30 seconds. We&apos;re looking for exactly what you asked for.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-10">
        <div className={`h-2 flex-1 rounded-full ${step === 'select' ? 'bg-foreground' : 'bg-foreground/20'}`} />
        <div className={`h-2 flex-1 rounded-full ${step === 'upload' ? 'bg-foreground' : 'bg-border'}`} />
        <div className="h-2 flex-1 rounded-full bg-border" />
      </div>

      {step === 'select' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">What do you want to know?</h1>
            <p className="text-muted-foreground">
              Pick one analysis. You can always run another later.
            </p>
          </div>

          <div className="grid gap-3">
            {OUTCOMES.map((outcome) => (
              <button
                key={outcome.id}
                onClick={() => setSelectedOutcome(outcome.id)}
                className={`text-left p-5 rounded-xl border transition-all ${
                  selectedOutcome === outcome.id
                    ? 'border-foreground bg-foreground/5'
                    : 'border-border hover:border-foreground/20 hover:bg-secondary/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground mb-1">{outcome.name}</h3>
                    <p className="text-sm text-muted-foreground">{outcome.description}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium bg-secondary text-foreground px-2.5 py-1 rounded-full">
                    {outcome.credits} {outcome.credits === 1 ? 'credit' : 'credits'}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep('upload')}
              disabled={!selectedOutcome}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 'upload' && (
        <div className="space-y-6">
          <div>
            <button
              onClick={() => setStep('select')}
              className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back
            </button>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">Upload your shipping export</h1>
            <p className="text-muted-foreground">
              We accept CSV or Excel files. Make sure it has tracking numbers, carrier names, and costs.
            </p>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive ? 'border-foreground bg-foreground/5' : 'border-border'
            } ${file ? 'bg-secondary/30 border-foreground/20' : ''}`}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>

            {file ? (
              <div>
                <p className="text-sm font-medium text-foreground mb-1">{file.name}</p>
                <p className="text-xs text-muted-foreground">Click or drag to replace</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Drag your file here, or click to browse</p>
                <p className="text-xs text-muted-foreground">CSV or Excel up to 5MB</p>
              </div>
            )}
          </div>

          {fileError && (
            <p className="text-sm text-red-500">{fileError}</p>
          )}

          {file && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleAnalyze}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Run analysis
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
