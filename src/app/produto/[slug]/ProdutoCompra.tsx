'use client'
import { useState } from 'react'
import type { ProdutoCompleto, ProdutoVariacao } from '@/src/lib/types'
import { formatarReal } from '@/src/lib/format'
import { useCarrinho } from '@/src/contexts/CarrinhoContext'

function descreverVariacao(v: ProdutoVariacao) {
  const partes = [
    v.textura,
    v.cor,
    v.comprimento_cm ? `${v.comprimento_cm}cm` : null,
    v.peso_gramas ? `${v.peso_gramas}g` : null,
  ].filter(Boolean)
  return partes.join(' · ') || 'Padrão'
}

export default function ProdutoCompra({ produto }: { produto: ProdutoCompleto }) {
  const disponiveis = produto.variacoes.filter((v) => v.ativo)
  const [selecionadaId, setSelecionadaId] = useState(disponiveis[0]?.id ?? '')
  const { adicionar, abrir } = useCarrinho()

  const v = disponiveis.find((x) => x.id === selecionadaId)
  const preco = v ? v.preco_promocional ?? v.preco : 0
  const semEstoque = !v || v.estoque <= 0

  const capa = produto.imagens.find((i) => i.principal)?.url ?? produto.imagens[0]?.url

  function adicionarAoCarrinho() {
    if (!v) return
    adicionar({
      variacaoId: v.id,
      nomeProduto: produto.nome,
      descricaoVariacao: descreverVariacao(v),
      preco,
      quantidade: 1,
      imagemUrl: capa,
    })
    abrir()
  }

  return (
    <div className="mt-6">
      {disponiveis.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {disponiveis.map((opt) => {
            const ativa = opt.id === selecionadaId
            const esgotada = opt.estoque <= 0
            return (
              <button
                key={opt.id}
                onClick={() => setSelecionadaId(opt.id)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  ativa
                    ? 'border-[var(--plum)] bg-[var(--plum)] text-[var(--cream)]'
                    : 'border-[var(--line)] text-[var(--ink)] hover:border-[var(--gold)]'
                } ${esgotada ? 'opacity-40' : ''}`}
              >
                {descreverVariacao(opt)}
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-6 flex items-end gap-3">
        <span className="font-display text-3xl text-[var(--plum)]">{formatarReal(preco)}</span>
        {v?.preco_promocional && (
          <span className="mb-1 text-sm text-[var(--muted)] line-through">
            {formatarReal(v.preco)}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-[var(--muted)]">
        {semEstoque
          ? 'Indisponível no momento'
          : v!.estoque <= 5
          ? `Últimas ${v!.estoque} unidades`
          : 'Em estoque'}
      </p>

      <button
        onClick={adicionarAoCarrinho}
        disabled={semEstoque}
        className="mt-5 w-full rounded-full bg-[var(--plum)] py-4 text-[var(--cream)] transition hover:bg-[var(--plum-soft)] disabled:cursor-not-allowed disabled:opacity-40 md:w-auto md:px-10"
      >
        {semEstoque ? 'Esgotado' : 'Adicionar à sacola'}
      </button>
    </div>
  )
}