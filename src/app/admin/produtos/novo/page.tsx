import Link from 'next/link'
import { criarClienteServer } from '@/src/lib/supabase/server'
import type { Categoria } from '@/src/lib/types'
import FormProduto from '@/src/components/admin/FormProduto'

export const dynamic = 'force-dynamic'

export default async function NovoProduto() {
  const supabase = await criarClienteServer()
  const { data } = await supabase.from('categorias').select('*').order('nome')
  const categorias = (data ?? []) as Categoria[]

  return (
    <div>
      <Link href="/admin/produtos" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
        ← voltar para produtos
      </Link>
      <h1 className="mt-2 font-display text-3xl text-[var(--ink)]">Novo produto</h1>
      <FormProduto categorias={categorias} />
    </div>
  )
}