import Link from 'next/link'
import { criarClienteServer } from '@/src/lib/supabase/server'
import type { Categoria } from '@/src/lib/types'
import FormCategoria from '@/src/components/admin/FormCategoria'

export const dynamic = 'force-dynamic'

export default async function PaginaCategorias() {
  const supabase = await criarClienteServer()
  const { data } = await supabase.from('categorias').select('*').order('nome')
  const categorias = (data ?? []) as Categoria[]

  return (
    <div>
      <Link href="/admin/produtos" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
        ← voltar para produtos
      </Link>
      <h1 className="mt-2 font-display text-3xl text-[var(--ink)]">Categorias</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Organize seus cabelos em grupos (ex: Mega Hair, Apliques, Perucas).
      </p>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        {/* Lista */}
        <div>
          {categorias.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--line)] px-6 py-12 text-center">
              <p className="text-[var(--muted)]">Nenhuma categoria ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categorias.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white p-4"
                >
                  <div>
                    <p className="font-medium text-[var(--ink)]">{c.nome}</p>
                    <p className="text-xs text-[var(--muted)]">/{c.slug}</p>
                  </div>
                  {!c.ativo && (
                    <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs text-[var(--muted)]">
                      inativa
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulário */}
        <div>
          <FormCategoria />
        </div>
      </div>
    </div>
  )
}