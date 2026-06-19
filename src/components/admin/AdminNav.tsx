'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BotaoSair from '@/src/components/admin/BotaoSair'

const links = [
  { href: '/admin', label: 'Painel' },
  { href: '/admin/produtos', label: 'Produtos' },
  { href: '/admin/estoque', label: 'Estoque' },
  { href: '/admin/vendas', label: 'Vendas' },
  { href: '/admin/clientes', label: 'Clientes' },
  { href: '/admin/financeiro', label: 'Financeiro' },
]

export default function AdminNav() {
  const [aberto, setAberto] = useState(false)
  const pathname = usePathname()

  return (
    <header className="border-b border-[var(--line)] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-display text-xl text-[var(--brand)]">
            Kadosh · Admin
          </Link>

          {/* Menu no computador */}
          <nav className="hidden items-center gap-5 text-sm text-[var(--ink)] md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`hover:text-[var(--brand)] ${
                  pathname === l.href ? 'text-[var(--brand)]' : ''
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="hidden text-sm text-[var(--muted)] hover:text-[var(--ink)] sm:block"
          >
            Ver loja
          </Link>
          <div className="hidden sm:block">
            <BotaoSair />
          </div>

          {/* Botão hambúrguer (celular) */}
          <button
            onClick={() => setAberto((v) => !v)}
            className="flex flex-col gap-1.5 p-1 md:hidden"
            aria-label="Abrir menu"
          >
            <span className="block h-0.5 w-6 bg-[var(--ink)]" />
            <span className="block h-0.5 w-6 bg-[var(--ink)]" />
            <span className="block h-0.5 w-6 bg-[var(--ink)]" />
          </button>
        </div>
      </div>

      {/* Menu aberto no celular */}
      {aberto && (
        <nav className="border-t border-[var(--line)] px-5 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setAberto(false)}
                className={`rounded-lg px-3 py-2 text-sm ${
                  pathname === l.href
                    ? 'bg-[var(--tint)] text-[var(--brand)]'
                    : 'text-[var(--ink)]'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setAberto(false)}
              className="rounded-lg px-3 py-2 text-sm text-[var(--muted)]"
            >
              Ver loja
            </Link>
            <div className="px-3 py-2">
              <BotaoSair />
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}