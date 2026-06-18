'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarClienteBrowser } from '@/src/lib/supabase/client'

const inputClass =
  'mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]'

export default function FormLancamento() {
  const router = useRouter()
  const hoje = new Date().toISOString().slice(0, 10)

  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [data, setData] = useState(hoje)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    const v = Number(valor)
    if (!v || v <= 0) return setErro('Informe um valor maior que zero.')

    setSalvando(true)
    const supabase = criarClienteBrowser()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('lancamentos_financeiros').insert({
      tipo,
      valor: v,
      descricao: descricao.trim() || null,
      categoria: categoria.trim() || null,
      data,
      usuario_id: user?.id ?? null,
    })

    setSalvando(false)
    if (error) return setErro('Não foi possível salvar. Tente novamente.')

    setValor('')
    setDescricao('')
    setCategoria('')
    router.refresh()
  }

  return (
    <form onSubmit={salvar} className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <h2 className="font-display text-lg text-[var(--ink)]">Novo lançamento</h2>

      {/* Tipo: entrada (receita) ou saída (despesa) */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setTipo('receita')}
          className={`rounded-lg border py-2 text-sm transition ${
            tipo === 'receita'
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
              : 'border-[var(--line)] text-[var(--muted)]'
          }`}
        >
          Entrada (venda)
        </button>
        <button
          type="button"
          onClick={() => setTipo('despesa')}
          className={`rounded-lg border py-2 text-sm transition ${
            tipo === 'despesa'
              ? 'border-red-400 bg-red-50 text-red-700'
              : 'border-[var(--line)] text-[var(--muted)]'
          }`}
        >
          Saída (compra/despesa)
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="text-sm text-[var(--muted)]">Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            className={inputClass}
            value={valor}
            placeholder="0.00"
            onChange={(e) => setValor(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-[var(--muted)]">Descrição</label>
          <input
            className={inputClass}
            value={descricao}
            placeholder={tipo === 'receita' ? 'ex: venda mega hair liso' : 'ex: compra de cabelo'}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-[var(--muted)]">Categoria (opcional)</label>
            <input
              className={inputClass}
              value={categoria}
              placeholder="ex: estoque"
              onChange={(e) => setCategoria(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-[var(--muted)]">Data</label>
            <input
              type="date"
              className={inputClass}
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="w-full rounded-full bg-[var(--brand)] py-2.5 text-sm text-white transition hover:bg-[var(--brand-deep)] disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Registrar lançamento'}
        </button>
      </div>
    </form>
  )
}