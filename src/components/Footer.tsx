'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  // o rodapé da loja não aparece nas telas administrativas
  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) return null

  return (
    <footer className="mt-24 border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-[var(--muted)] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-lg text-[var(--plum)]">Kadosh Cabelos</p>
          <p className="mt-1">Msg Comércio e Serviços Ltda.</p>
          <p className="mt-4 text-xs">Atendimento e pedidos pelo WhatsApp.</p>
        </div>
        <Link href="/login" className="text-xs text-[var(--muted)] hover:text-[var(--brand)]">
          Acesso administrativo
        </Link>
      </div>
    </footer>
  )
}