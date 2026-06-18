'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarClienteBrowser } from '@/src/lib/supabase/client'

export default function AjusteEstoque({ variacaoId }: { variacaoId: string }) {
  const router = useRouter()
  const [qtd, setQtd] = useState('1')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function mover(tipo: 'entrada' | 'saida') {
    setErro('')
    const n = Number(qtd)
    if (!n || n <= 0) {
      setErro('Qtd inválida')
      return
    }

    setSalvando(true)
    const supabase = criarClienteBrowser()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // entrada soma, saída subtrai
    const quantidade = tipo === 'entrada' ? n : -n

    const { error } = await supabase.from('movimentacoes_estoque').insert({
      variacao_id: variacaoId,
      tipo,
      quantidade,
      usuario_id: user?.id ?? null,
    })

    setSalvando(false)

    if (error) {
      // 23514 = violação da regra "estoque não pode ficar negativo"
      setErro(error.code === '23514' ? 'Estoque insuficiente' : 'Erro ao salvar')
      return
    }

    setQtd('1')
    router.refresh()
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          value={qtd}
          onChange={(e) => setQtd(e.target.value)}
          className="w-16 rounded-lg border border-[var(--line)] px-2 py-1.5 text-sm outline-none focus:border-[var(--brand)]"
        />
        <button
          type="button"
          disabled={salvando}
          onClick={() => mover('entrada')}
          className="rounded-full bg-[var(--brand)] px-3 py-1.5 text-sm text-white transition hover:bg-[var(--brand-deep)] disabled:opacity-50"
        >
          Entrada
        </button>
        <button
          type="button"
          disabled={salvando}
          onClick={() => mover('saida')}
          className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--ink)] transition hover:border-red-400 disabled:opacity-50"
        >
          Saída
        </button>
      </div>
      {erro && <p className="text-xs text-red-600">{erro}</p>}
    </div>
  )
}