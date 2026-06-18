import { criarClienteServer } from '@/src/lib/supabase/server'
import { formatarReal } from '@/src/lib/format'
import AjusteEstoque from '@/src/components/admin/AjusteEstoque'

export const dynamic = 'force-dynamic'

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function PaginaEstoque() {
  const supabase = await criarClienteServer()

  const { data: vData } = await supabase
    .from('produto_variacoes')
    .select('*, produto:produtos(nome)')
    .order('produto_id')

  const variacoes = (vData ?? []) as any[]

  const { data: mData } = await supabase
    .from('movimentacoes_estoque')
    .select('*, variacao:produto_variacoes(cor, comprimento_cm, textura, produto:produtos(nome))')
    .order('criado_em', { ascending: false })
    .limit(20)

  const movimentos = (mData ?? []) as any[]

  const descrever = (v: any) =>
    [v?.textura, v?.cor, v?.comprimento_cm && `${v.comprimento_cm}cm`]
      .filter(Boolean)
      .join(' · ') || '—'

  const rotuloTipo: Record<string, string> = {
    entrada: 'Entrada',
    saida: 'Saída',
    ajuste: 'Ajuste',
    venda: 'Venda',
    devolucao: 'Devolução',
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--ink)]">Estoque</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Dê entrada ou saída de unidades em cada variação.
      </p>

      {/* Lista de variações com ajuste */}
      <div className="mt-6 space-y-3">
        {variacoes.length === 0 ? (
          <p className="text-[var(--muted)]">Nenhuma variação cadastrada ainda.</p>
        ) : (
          variacoes.map((v) => (
            <div
              key={v.id}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-[var(--ink)]">{v.produto?.nome}</p>
                <p className="text-sm text-[var(--muted)]">
                  {descrever(v)} · {formatarReal(v.preco)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-[var(--muted)]">em estoque</p>
                  <p
                    className={`font-display text-2xl ${
                      v.estoque <= v.estoque_minimo ? 'text-amber-600' : 'text-[var(--brand)]'
                    }`}
                  >
                    {v.estoque}
                  </p>
                </div>
                <AjusteEstoque variacaoId={v.id} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Histórico */}
      <h2 className="mt-10 font-display text-xl text-[var(--ink)]">Últimas movimentações</h2>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Quando</th>
              <th className="px-4 py-3 font-medium">Produto</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Qtd</th>
            </tr>
          </thead>
          <tbody>
            {movimentos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--muted)]">
                  Sem movimentações ainda.
                </td>
              </tr>
            ) : (
              movimentos.map((m) => (
                <tr key={m.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {new Date(m.criado_em).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    {m.variacao?.produto?.nome}{' '}
                    <span className="text-[var(--muted)]">· {descrever(m.variacao)}</span>
                  </td>
                  <td className="px-4 py-3">{rotuloTipo[m.tipo] ?? m.tipo}</td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      m.quantidade > 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {m.quantidade > 0 ? `+${m.quantidade}` : m.quantidade}
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