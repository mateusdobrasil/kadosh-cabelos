import { criarClienteServer } from '@/src/lib/supabase/server'
import { formatarReal } from '@/src/lib/format'
import FormVenda from '@/src/components/admin/FormVenda'

export const dynamic = 'force-dynamic'

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function PaginaVendas() {
  const supabase = await criarClienteServer()

  const { data: vData } = await supabase
    .from('produto_variacoes')
    .select(
      'id, preco, preco_promocional, estoque, textura, cor, comprimento_cm, ativo, produto:produtos(nome, ativo)'
    )
    .order('produto_id')

  const variacoes = (vData ?? []) as any[]
  const disponiveis = variacoes.filter((v) => v.ativo && v.produto?.ativo && v.estoque > 0)

  const { data: pData } = await supabase
    .from('pedidos')
    .select('*, itens:pedido_itens(quantidade)')
    .order('criado_em', { ascending: false })
    .limit(15)

  const pedidos = (pData ?? []) as any[]

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--ink)]">Vendas</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Confirmou a venda no WhatsApp? Registre aqui — o estoque baixa e o valor entra no financeiro
        automaticamente.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* Formulário */}
        <FormVenda variacoes={disponiveis} />

        {/* Vendas recentes */}
        <div>
          <h2 className="font-display text-xl text-[var(--ink)]">Vendas recentes</h2>
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
                {pedidos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--muted)]">
                      Nenhuma venda registrada ainda.
                    </td>
                  </tr>
                ) : (
                  pedidos.map((p) => {
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
        </div>
      </div>
    </div>
  )
}