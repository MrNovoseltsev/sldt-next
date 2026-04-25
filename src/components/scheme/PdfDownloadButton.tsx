'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import type { SchemeRow, SchemeLineRow, ProjectRow } from '@/types/database'
import SchemePdf from '@/components/pdf/SchemePdf'
import { cn } from '@/lib/utils'

interface Props {
  scheme: SchemeRow
  lines: SchemeLineRow[]
  project: ProjectRow
}

export default function PdfDownloadButton({ scheme, lines, project }: Props) {
  const [busy, setBusy] = useState(false)

  const handleClick = async () => {
    setBusy(true)
    try {
      const blob = await pdf(<SchemePdf scheme={scheme} lines={lines} project={project} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${scheme.device_name ?? 'scheme'}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={cn(
        'flex items-center gap-[5px] border border-border text-muted-foreground rounded-[5px] px-[10px] py-[5px] text-xs bg-transparent whitespace-nowrap transition-colors duration-150',
        busy
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer hover:border-[var(--text-2)] hover:text-foreground',
      )}
    >
      {busy ? 'Генерация…' : 'PDF'}
    </button>
  )
}
