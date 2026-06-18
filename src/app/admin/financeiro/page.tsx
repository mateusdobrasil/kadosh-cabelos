import Link from 'next/link'
import { criarClienteServer } from '@/src/lib/supabase/server'
import { formatarReal } from '@/src/lib/format'
import FormLancamento from '@/src/components/admin/FormLancamento'

export const dynamic = 'force-dynamic'

const fmtMes = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function PaginaFinanceiro({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>
}) {
  const { mes } = await searchParams
  const hoje = new Date()
  const ref = mes ? new Date(`${mes}-01T00:00:00`) : new Date(hoje.getFullYear(), hoje.getMonth(), 1)

  const inicio = new Date(ref.getFullYear(), ref.getMonth(), 1)
  const fim = new Date(ref.getFullYear(), ref.getMonth() + 1, 1)
  const inicioStr = `${fmtMes(inicio)}-01`
  const fimStr = `${fmtMes(fim)}-01`

  const supabase = await criarClienteServer()
  const { data } = await supabase
    .from('lancamentos_financeiros')
    .select('*')
    .gte('data', inicioStr)
    .lt('data', fimStr)
    .order('data', { ascending: false })
    .order('criado_em', { ascending: false })

  const lancamentos = (data ?? []) as any[]
  const receitas = lancamentos
    .filter((l) => l.tipo === 'receita')
    .reduce((s, l) => s + Number(l.valor), 0)
  const despesas = lancamentos
    .filter((l) => l.tipo === 'despesa')
    .reduce((s, l) => s + Number(l.valor), 0)
  const saldo = receitas - despesas

  const mesPrev = fmtMes(new Date(ref.getFullYear(), ref.getMonth() - 1, 1))
  const mesNext = fmtMes(new Date(ref.getFullYear(), ref.getMonth() + 1, 1))
  const nomeMes = ref.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--ink)]">Financeiro</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Tudo que entra (vendas) e tudo que sai (compras e despesas).
      </p>

      {/* Navegação de mês */}
      <div className="mt-5 flex items-center gap-3">
        <Link
          href={`/admin/financeiro?mes=${mesPrev}`}
          className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] text-[var(--muted)] hover:border-[var(--brand)]"
        >
          ←
        </Link>
        <span className="min-w-44 text-center font-medium capitalize text-[var(--ink)]">
          {nomeMes}
        </span>
        <Link
          href={`/admin/financeiro?mes=${mesNext}`}
          className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] text-[var(--muted)] hover:border-[var(--brand)]"
        >
          →
        </Link>
      </div>

      {/* Cards do balanço */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardFin titulo="Entradas" valor={receitas} cor="text-emerald-600" />
        <CardFin titulo="Saídas" valor={despesas} cor="text-red-600" />
        <CardFin
          titulo="Saldo"
          valor={saldo}
          cor={saldo >= 0 ? 'text-[var(--brand)]' : 'text-red-600'}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Lista de lançamentos */}
        <div>
          <h2 className="font-display text-xl text-[var(--ink)]">Lançamentos do mês</h2>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--line)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {lancamentos.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-[var(--muted)]">
                      Nenhum lançamento neste mês.
                    </td>
                  </tr>
                ) : (
                  lancamentos.map((l) => (
                    <tr key={l.id} className="border-b border-[var(--line)] last:border-0">
                      <td className="px-4 py-3 text-[var(--muted)]">
                        {new Date(`${l.data}T00:00:00`).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        {l.descricao || <span className="text-[var(--muted)]">—</span>}
                        {l.categoria && (
                          <span className="ml-2 rounded-full bg-[var(--surface)] px-2 py-0.5 text-xs text-[var(--muted)]">
                            {l.categoria}
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          l.tipo === 'receita' ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {l.tipo === 'receita' ? '+' : '−'} {formatarReal(Number(l.valor))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulário */}
        <div>
          <FormLancamento />
        </div>
      </div>
    </div>
  )
}

function CardFin({ titulo, valor, cor }: { titulo: string; valor: number; cor: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <p className="text-sm text-[var(--muted)]">{titulo}</p>
      <p className={`mt-1 font-display text-2xl ${cor}`}>{formatarReal(valor)}</p>
    </div>
  )
}