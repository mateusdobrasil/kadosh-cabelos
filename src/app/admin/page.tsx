import { criarClienteServer } from '@/src/lib/supabase/server'
import type { ProdutoCompleto } from '@/src/lib/types'
import { formatarReal } from '@/src/lib/format'

export const dynamic = 'force-dynamic'

export default async function PainelAdmin() {
  const supabase = await criarClienteServer()
  const { data } = await supabase
    .from('produtos')
    .select('*, variacoes:produto_variacoes(*)')
    .order('criado_em', { ascending: false })

  const produtos = (data ?? []) as unknown as ProdutoCompleto[]

  const variacoes = produtos.flatMap((p) =>
    p.variacoes.map((v) => ({ ...v, produtoNome: p.nome }))
  )
  const unidadesEmEstoque = variacoes.reduce((s, v) => s + v.estoque, 0)
  const baixoEstoque = variacoes.filter((v) => v.ativo && v.estoque <= v.estoque_minimo)

  const descreverVar = (v: (typeof variacoes)[number]) =>
    [v.textura, v.cor, v.comprimento_cm && `${v.comprimento_cm}cm`].filter(Boolean).join(' · ')

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--ink)]">Painel</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Visão geral do seu estoque.</p>

      {/* Resumo */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card titulo="Produtos" valor={produtos.length} />
        <Card titulo="Variações (SKUs)" valor={variacoes.length} />
        <Card titulo="Unidades em estoque" valor={unidadesEmEstoque} />
      </div>

      {/* Alerta de reposição */}
      {baixoEstoque.length > 0 && (
        <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <p className="font-medium text-amber-800">
            {baixoEstoque.length} {baixoEstoque.length === 1 ? 'item precisa' : 'itens precisam'} de reposição
          </p>
          <ul className="mt-3 space-y-1 text-sm text-amber-900">
            {baixoEstoque.map((v) => (
              <li key={v.id}>
                {v.produtoNome} — {descreverVar(v)}: <strong>{v.estoque}</strong> em estoque
                (mínimo {v.estoque_minimo})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Estoque atual */}
      <h2 className="mt-10 font-display text-xl text-[var(--ink)]">Estoque atual</h2>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Produto</th>
              <th className="px-4 py-3 font-medium">Variação</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Estoque</th>
            </tr>
          </thead>
          <tbody>
            {variacoes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--muted)]">
                  Nenhum produto cadastrado ainda.
                </td>
              </tr>
            ) : (
              variacoes.map((v) => (
                <tr key={v.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-4 py-3">{v.produtoNome}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{descreverVar(v)}</td>
                  <td className="px-4 py-3">{formatarReal(v.preco)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        v.estoque <= v.estoque_minimo ? 'font-semibold text-amber-600' : ''
                      }
                    >
                      {v.estoque}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Card({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <p className="text-sm text-[var(--muted)]">{titulo}</p>
      <p className="mt-1 font-display text-3xl text-[var(--brand)]">{valor}</p>
    </div>
  )
}