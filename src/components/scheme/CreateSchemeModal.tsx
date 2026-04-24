'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface CreateSchemeModalProps {
  onConfirm: (name: string) => void
  onClose: () => void
  isPending?: boolean
}

export default function CreateSchemeModal({ onConfirm, onClose, isPending }: CreateSchemeModalProps) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(name.trim())
  }

  return (
    <div
      className="fixed inset-0 bg-black/45 flex items-center justify-center z-[1000]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--surface)] border border-border rounded-lg p-6 w-[360px] flex flex-col gap-4"
      >
        <div className="text-sm font-medium text-foreground">
          Название схемы
        </div>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: ЩС-1"
          className="w-full px-[10px] py-[7px] text-[13px] border border-border rounded-[5px] bg-[var(--bg)] text-foreground font-[inherit] outline-none transition-colors focus:border-[var(--accent)]"
        />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-[14px] py-[6px] text-[12.5px] border border-border rounded-[5px] bg-transparent text-muted-foreground cursor-pointer font-[inherit]"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              'px-[14px] py-[6px] text-[12.5px] border-none rounded-[5px] text-white font-medium font-[inherit]',
              isPending ? 'bg-[var(--text-3)] cursor-not-allowed' : 'bg-[var(--accent)] cursor-pointer',
            )}
          >
            {isPending ? 'Создание…' : 'Создать'}
          </button>
        </div>
      </form>
    </div>
  )
}
