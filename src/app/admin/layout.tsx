import { redirect } from 'next/navigation'
import Link from 'next/link'
import { criarClienteServer } from '@/src/lib/supabase/server'
import BotaoSair from '@/src/components/admin/BotaoSair'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await criarClienteServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // sem login → vai pro login
  if (!user) redirect('/login')

  // logado, mas não é admin → também bloqueia
  const { data: perfil } = await supabase
    .from('perfis')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!perfil?.is_admin) redirect('/login')

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-display text-xl text-[var(--brand)]">
              Kadosh · Admin
            </Link>
            <nav className="hidden items-center gap-5 text-sm text-[var(--ink)] sm:flex">
              <Link href="/admin" className="hover:text-[var(--brand)]">Painel</Link>
              <Link href="/admin/produtos" className="hover:text-[var(--brand)]">Produtos</Link>
              <Link href="/admin/estoque" className="hover:text-[var(--brand)]">Estoque</Link>
              <Link href="/admin/vendas" className="hover:text-[var(--brand)]">Vendas</Link>
              <Link href="/admin/financeiro" className="hover:text-[var(--brand)]">Financeiro</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
              Ver loja
            </Link>
            <BotaoSair />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  )
}