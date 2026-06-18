import { criarClienteServer } from '@/src/lib/supabase/server'
import { formatarReal } from '@/src/lib/format'
import FormVenda from '@/src/components/admin/FormVenda'
import AcoesPedido from '@/src/components/admin/AcoesPedido'

export const dynamic = 'force-dynamic'

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function PaginaVendas() {
  const supabase = await criarClienteServer()

  // variações para a venda direta (balcão)
  const { data: vData } = await supabase
    .from('produto_variacoes')
    .select(
      'id, preco, preco_promocional, estoque, textura, cor, comprimento_cm, ativo, produto:produtos(nome, ativo)'
    )
    .order('produto_id')
  const disponiveis = (vData ?? []).filter(
    (v: any) => v.ativo && v.produto?.ativo && v.estoque > 0
  ) as any[]

  // pedidos pendentes (vieram do WhatsApp)
  const { data: pendData } = await supabase
    .from('pedidos')
    .select('*, itens:pedido_itens(descricao, quantidade, preco_unitario, subtotal)')
    .eq('status', 'pendente')
    .order('criado_em', { ascending: true })
  const pendentes = (pendData ?? []) as any[]

  // vendas já confirmadas
  const { data: pagoData } = await supabase
    .from('pedidos')
    .select('*, itens:pedido_itens(quantidade)')
    .eq('status', 'pago')
    .order('criado_em', { ascending: false })
    .limit(15)
  const pagos = (pagoData ?? []) as any[]

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--ink)]">Vendas</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Os pedidos do WhatsApp chegam aqui como pendentes. Confira o pagamento e confirme — aí o
        estoque baixa e a receita entra no financeiro.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          {/* Pedidos pendentes */}
          <section>
            <h2 className="flex items-center gap-2 font-display text-xl text-[var(--ink)]">
              Aguardando confirmação
              {pendentes.length > 0 && (
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-amber-500 px-1.5 text-xs text-white">
                  {pendentes.length}
                </span>
              )}
            </h2>

            {pendentes.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-[var(--line)] px-6 py-10 text-center text-sm text-[var(--muted)]">
                Nenhum pedido pendente no momento.
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                {pendentes.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-amber-300 bg-amber-50/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-[var(--ink)]">
                          {p.cliente_nome || 'Cliente não identificado'}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          #{p.numero_pedido} · {new Date(p.criado_em).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <span className="font-display text-xl text-[var(--brand)]">
                        {formatarReal(Number(p.total))}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
                      {(p.itens ?? []).map((it: any, idx: number) => (
                        <li key={idx}>
                          {it.quantidade}× {it.descricao} — {formatarReal(Number(it.subtotal))}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex justify-end">
                      <AcoesPedido pedidoId={p.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Vendas confirmadas */}
          <section>
            <h2 className="font-display text-xl text-[var(--ink)]">Vendas confirmadas</h2>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--line)] text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nº</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Itens</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[var(--muted)]">
                        Nenhuma venda confirmada ainda.
                      </td>
                    </tr>
                  ) : (
                    pagos.map((p) => {
                      const qtdItens = (p.itens ?? []).reduce(
                        (s: number, i: any) => s + i.quantidade,
                        0
                      )
                      return (
                        <tr key={p.id} className="border-b border-[var(--line)] last:border-0">
                          <td className="px-4 py-3 text-[var(--muted)]">#{p.numero_pedido}</td>
                          <td className="px-4 py-3">{p.cliente_nome || '—'}</td>
                          <td className="px-4 py-3 text-[var(--muted)]">{qtdItens}</td>
                          <td className="px-4 py-3 text-right font-medium text-[var(--brand)]">
                            {formatarReal(Number(p.total))}
                          </td>
                          <td className="px-4 py-3 text-[var(--muted)]">
                            {new Date(p.criado_em).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Venda direta (balcão) */}
        <div>
          <FormVenda variacoes={disponiveis} />
        </div>
      </div>
    </div>
  )
}