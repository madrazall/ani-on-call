'use client'

import * as XLSX from 'xlsx'
import type { AnalysisResult } from '@/lib/analyzers'
import type { Outcome } from '@/lib/outcomes'

interface Props {
  results: AnalysisResult[]
  outcomes: Outcome[]
  reportId: string
  createdAt: string
}

export default function DownloadButton({ results, outcomes, reportId, createdAt }: Props) {
  function handleDownload() {
    const wb = XLSX.utils.book_new()

    for (const result of results) {
      const outcome = outcomes.find((o) => o.id === result.outcomeId)
      const name = outcome?.name ?? result.outcomeId

      const rows: (string | number)[][] = [
        [name],
        [result.summary],
        [],
        ['Finding', 'Value'],
        ...result.findings.map((f) => [f.label, f.value]),
      ]

      const ws = XLSX.utils.aoa_to_sheet(rows)

      // Column widths
      ws['!cols'] = [{ wch: 40 }, { wch: 40 }]

      XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31))
    }

    const date = new Date(createdAt).toISOString().split('T')[0]
    XLSX.writeFile(wb, `ani-report-${date}-${reportId.slice(0, 8)}.xlsx`)
  }

  return (
    <button
      onClick={handleDownload}
      className="text-sm text-ani-muted hover:text-ani-white transition-colors flex items-center gap-1.5"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Download as spreadsheet
    </button>
  )
}
