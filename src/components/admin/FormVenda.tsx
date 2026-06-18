'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarClienteBrowser } from '@/src/lib/supabase/client'
import { formatarReal } from '@/src/lib/format'

interface VarOpt {
  id: string
  preco: number
  preco_promocional: number | null
  estoque: number
  textura: string | null
  cor: string | null
  comprimento_cm: number | null
  produto: { nome: string } | null
}

interface ItemVenda {
  variacaoId: string
  rotulo: string
  preco: number
  quantidade: number
  estoque: number
}

const inputClass =
  'w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]'

export default function FormVenda({ variacoes }: { variacoes: VarOpt[] }) {
  const router = useRouter()
  const [selId, setSelId] = useState('')
  const [qtd, setQtd] = useState('1')
  const [itens, setItens] = useState<ItemVenda[]>([])
  const [cliente, setCliente] = useState('')
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState('')
  const [salvando, setSalvando] = useState(false)

  const descrever = (v: VarOpt) =>
    [v.textura, v.cor, v.comprimento_cm && `${v.comprimento_cm}cm`].filter(Boolean).join(' · ') || '—'

  const precoDe = (v: VarOpt) => v.preco_promocional ?? v.preco

  function adicionar() {
    setErro('')
    setOk('')
    const v = variacoes.find((x) => x.id === selId)
    if (!v) return setErro('Escolha um produto.')
    const n = Number(qtd)
    if (!n || n <= 0) return setErro('Quantidade inválida.')

    const jaTem = itens.find((i) => i.variacaoId === v.id)
    const totalQtd = (jaTem?.quantidade ?? 0) + n
    if (totalQtd > v.estoque) return setErro(`Estoque insuficiente (disponível: ${v.estoque}).`)

    if (jaTem) {
      setItens(itens.map((i) => (i.variacaoId === v.id ? { ...i, quantidade: totalQtd } : i)))
    } else {
      setItens([
        ...itens,
        {
          variacaoId: v.id,
          rotulo: `${v.produto?.nome} · ${descrever(v)}`,
          preco: precoDe(v),
          quantidade: n,
          estoque: v.estoque,
        },
      ])
    }
    setQtd('1')
  }

  function remover(id: string) {
    setItens(itens.filter((i) => i.variacaoId !== id))
  }

  const total = itens.reduce((s, i) => s + i.preco * i.quantidade, 0)

  async function confirmar() {
    setErro('')
    setOk('')
    if (itens.length === 0) return setErro('Adicione ao menos um item.')

    setSalvando(true)
    const supabase = criarClienteBrowser()
    const payload = itens.map((i) => ({
      variacao_id: i.variacaoId,
      quantidade: i.quantidade,
      preco: i.preco,
    }))

    const { error } = await supabase.rpc('registrar_venda', {
      p_itens: payload,
      p_cliente: cliente.trim() || null,
    })

    setSalvando(false)
    if (error) return setErro(error.message || 'Não foi possível registrar a venda.')

    setItens([])
    setCliente('')
    setOk('Venda registrada! Estoque e financeiro atualizados.')
    router.refresh()
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <h2 className="font-display text-lg text-[var(--ink)]">Registrar venda</h2>

      {variacoes.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">
          Nenhum produto com estoque disponível para vender.
        </p>
      ) : (
        <>
          {/* Adicionar item */}
          <div className="mt-4 space-y-2">
            <select
              value={selId}
              onChange={(e) => setSelId(e.target.value)}
              className={inputClass}
            >
              <option value="">Escolha um produto...</option>
              {variacoes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.produto?.nome} · {descrever(v)} — {formatarReal(precoDe(v))} (estoque {v.estoque})
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={qtd}
                onChange={(e) => setQtd(e.target.value)}
                className={`${inputClass} w-24`}
              />
              <button
                type="button"
                onClick={adicionar}
                className="flex-1 rounded-lg border border-[var(--brand)] py-2 text-sm text-[var(--brand)] transition hover:bg-[var(--tint)]"
              >
                Adicionar item
              </button>
            </div>
          </div>

          {/* Itens da venda */}
          {itens.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-[var(--line)] pt-4">
              {itens.map((i) => (
                <div key={i.variacaoId} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex-1">
                    <p className="text-[var(--ink)]">{i.rotulo}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {i.quantidade} × {formatarReal(i.preco)}
                    </p>
                  </div>
                  <span className="text-[var(--ink)]">{formatarReal(i.preco * i.quantidade)}</span>
                  <button
                    type="button"
                    onClick={() => remover(i.variacaoId)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    remover
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Cliente + total */}
          <div className="mt-4 space-y-3 border-t border-[var(--line)] pt-4">
            <input
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nome do cliente (opcional)"
              className={inputClass}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">Total</span>
              <span className="font-display text-2xl text-[var(--brand)]">{formatarReal(total)}</span>
            </div>
          </div>

          {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}
          {ok && <p className="mt-3 text-sm text-emerald-600">{ok}</p>}

          <button
            type="button"
            onClick={confirmar}
            disabled={salvando || itens.length === 0}
            className="mt-4 w-full rounded-full bg-[var(--brand)] py-3 text-white transition hover:bg-[var(--brand-deep)] disabled:opacity-50"
          >
            {salvando ? 'Registrando...' : 'Confirmar venda'}
          </button>
        </>
      )}
    </div>
  )
}