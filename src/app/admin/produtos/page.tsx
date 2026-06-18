import Link from 'next/link'
import { criarClienteServer } from '@/src/lib/supabase/server'
import type { ProdutoCompleto } from '@/src/lib/types'

export const dynamic = 'force-dynamic'

export default async function ListaProdutos() {
  const supabase = await criarClienteServer()
  const { data } = await supabase
    .from('produtos')
    .select('*, variacoes:produto_variacoes(estoque), imagens:produto_imagens(url, principal)')
    .order('criado_em', { ascending: false })

  const produtos = (data ?? []) as unknown as ProdutoCompleto[]

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-[var(--ink)]">Produtos</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {produtos.length} {produtos.length === 1 ? 'cadastrado' : 'cadastrados'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/categorias"
            className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm text-[var(--ink)] transition hover:border-[var(--brand)]"
          >
            Categorias
          </Link>
          <Link
            href="/admin/produtos/novo"
            className="rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm text-white transition hover:bg-[var(--brand-deep)]"
          >
            Novo produto
          </Link>
        </div>
      </div>

      {produtos.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--line)] px-6 py-16 text-center">
          <p className="text-[var(--muted)]">Nenhum produto ainda. Clique em “Novo produto” para começar.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {produtos.map((p) => {
            const capa = p.imagens.find((i) => i.principal)?.url ?? p.imagens[0]?.url
            const estoqueTotal = p.variacoes.reduce((s, v) => s + (v.estoque ?? 0), 0)
            return (
              <div
                key={p.id}
                className="flex items-center gap-4 rounded-2xl border border-[var(--line)] bg-white p-3"
              >
                <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--surface)]">
                  {capa && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={capa} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--ink)]">{p.nome}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {p.variacoes.length} {p.variacoes.length === 1 ? 'variação' : 'variações'} ·{' '}
                    {estoqueTotal} em estoque
                  </p>
                </div>
                {!p.ativo && (
                  <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs text-[var(--muted)]">
                    inativo
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}