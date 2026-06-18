'use client'
import { useState } from 'react'
import { useCarrinho } from '@/src/contexts/CarrinhoContext'
import { formatarReal } from '@/src/lib/format'
import { gerarLinkWhatsApp } from '@/src/lib/whatsapp'
import { criarClienteBrowser } from '@/src/lib/supabase/client'

export default function CarrinhoDrawer() {
  const { itens, aberto, fechar, total, alterarQtd, remover, limpar } = useCarrinho()
  const [nome, setNome] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function finalizar() {
    setEnviando(true)

    // 1. registra o pedido como "pendente" no sistema
    const supabase = criarClienteBrowser()
    const payload = itens.map((i) => ({
      variacao_id: i.variacaoId,
      quantidade: i.quantidade,
    }))
    try {
      await supabase.rpc('criar_pedido_pendente', {
        p_itens: payload,
        p_cliente: nome.trim() || null,
      })
    } catch {
      // se falhar, ainda assim leva o cliente ao WhatsApp
    }

    // 2. abre o WhatsApp com o pedido montado e esvazia a sacola
    const link = gerarLinkWhatsApp(itens, nome.trim() || undefined)
    limpar()
    window.location.href = link
  }

  return (
    <>
      {/* fundo escuro */}
      <div
        onClick={fechar}
        className={`fixed inset-0 z-50 bg-[var(--overlay)] transition-opacity ${
          aberto ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* painel deslizante */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[var(--cream)] shadow-2xl transition-transform duration-300 ${
          aberto ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <h2 className="font-display text-xl text-[var(--plum)]">Sua sacola</h2>
          <button onClick={fechar} className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
            Fechar
          </button>
        </div>

        {itens.length === 0 ? (
          <div className="grid flex-1 place-items-center px-6 text-center">
            <div>
              <p className="font-display text-lg text-[var(--plum)]">Sua sacola está vazia</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Escolha um cabelo para começar.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {itens.map((item) => (
                <div key={item.variacaoId} className="flex gap-3">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--cream-deep)]">
                    {item.imagemUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imagemUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--ink)]">{item.nomeProduto}</p>
                    <p className="text-xs text-[var(--muted)]">{item.descricaoVariacao}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-[var(--line)]">
                        <button
                          onClick={() => alterarQtd(item.variacaoId, item.quantidade - 1)}
                          className="px-2 text-[var(--muted)]"
                          aria-label="Diminuir"
                        >
                          –
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantidade}</span>
                        <button
                          onClick={() => alterarQtd(item.variacaoId, item.quantidade + 1)}
                          className="px-2 text-[var(--muted)]"
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remover(item.variacaoId)}
                        className="text-xs text-[var(--muted)] underline"
                      >
                        remover
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--plum)]">
                    {formatarReal(item.preco * item.quantidade)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--line)] px-5 py-5">
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome (ajuda no atendimento)"
                className="mb-3 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              />
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[var(--muted)]">Total</span>
                <span className="font-display text-2xl text-[var(--plum)]">
                  {formatarReal(total)}
                </span>
              </div>
              <button
                onClick={finalizar}
                disabled={enviando}
                className="block w-full rounded-full bg-[#1FA855] py-4 text-center font-medium text-white transition hover:bg-[#178a45] disabled:opacity-60"
              >
                {enviando ? 'Abrindo WhatsApp...' : 'Finalizar pelo WhatsApp'}
              </button>
              <button
                onClick={limpar}
                className="mt-3 w-full text-center text-xs text-[var(--muted)] underline"
              >
                esvaziar sacola
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}