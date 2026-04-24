'use client'

import { useState, useEffect, useRef } from 'react'

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
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 24,
          width: 360,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>
          Название схемы
        </div>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: ЩС-1"
          style={{
            width: '100%',
            padding: '7px 10px',
            fontSize: 13,
            border: '1px solid var(--border)',
            borderRadius: 5,
            background: 'var(--bg)',
            color: 'var(--text-1)',
            fontFamily: 'inherit',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              fontSize: 12.5,
              border: '1px solid var(--border)',
              borderRadius: 5,
              background: 'none',
              color: 'var(--text-2)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: '6px 14px',
              fontSize: 12.5,
              border: 'none',
              borderRadius: 5,
              background: isPending ? 'var(--text-3)' : 'var(--accent)',
              color: '#fff',
              cursor: isPending ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              fontWeight: 500,
            }}
          >
            {isPending ? 'Создание…' : 'Создать'}
          </button>
        </div>
      </form>
    </div>
  )
}
