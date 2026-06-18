'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarClienteBrowser } from '@/src/lib/supabase/client'

export default function AcoesPedido({ pedidoId }: { pedidoId: string }) {
  const router = useRouter()
  const [carregando, setCarregando] = useState<'' | 'confirmar' | 'cancelar'>('')
  const [erro, setErro] = useState('')

  async function confirmar() {
    setErro('')
    setCarregando('confirmar')
    const supabase = criarClienteBrowser()
    const { error } = await supabase.rpc('confirmar_venda', { p_pedido_id: pedidoId })
    setCarregando('')
    if (error) return setErro(error.message || 'Erro ao confirmar.')
    router.refresh()
  }

  async function cancelar() {
    setErro('')
    setCarregando('cancelar')
    const supabase = criarClienteBrowser()
    const { error } = await supabase.rpc('cancelar_pedido', { p_pedido_id: pedidoId })
    setCarregando('')
    if (error) return setErro(error.message || 'Erro ao cancelar.')
    router.refresh()
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          onClick={confirmar}
          disabled={!!carregando}
          className="rounded-full bg-[var(--brand)] px-4 py-1.5 text-sm text-white transition hover:bg-[var(--brand-deep)] disabled:opacity-50"
        >
          {carregando === 'confirmar' ? 'Confirmando...' : 'Confirmar venda'}
        </button>
        <button
          onClick={cancelar}
          disabled={!!carregando}
          className="rounded-full border border-[var(--line)] px-4 py-1.5 text-sm text-[var(--muted)] transition hover:border-red-400 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
      {erro && <p className="text-xs text-red-600">{erro}</p>}
    </div>
  )
}