'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCarrinho } from '@/src/contexts/CarrinhoContext'

export default function Header() {
  const pathname = usePathname()
  const { contagem, abrir } = useCarrinho()

  // o cabeçalho da loja não aparece nas telas administrativas
  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) return null

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--cream)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-display text-2xl tracking-tight text-[var(--plum)]">Kadosh</span>
          <span className="text-[0.6rem] uppercase tracking-[0.35em] text-[var(--gold)]">Cabelos</span>
        </Link>

        <button
          onClick={abrir}
          className="relative flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--ink)] transition hover:border-[var(--gold)]"
        >
          Sacola
          {contagem > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--plum)] px-1 text-xs text-[var(--cream)]">
              {contagem}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}