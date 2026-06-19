import { redirect } from 'next/navigation'
import { criarClienteServer } from '@/src/lib/supabase/server'
import AdminNav from '@/src/components/admin/AdminNav'

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
      <AdminNav />
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  )
}