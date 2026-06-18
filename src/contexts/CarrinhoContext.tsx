'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ItemCarrinho } from '@/src/lib/types'

interface CarrinhoCtx {
  itens: ItemCarrinho[]
  aberto: boolean
  total: number
  contagem: number
  adicionar: (item: ItemCarrinho) => void
  remover: (variacaoId: string) => void
  alterarQtd: (variacaoId: string, qtd: number) => void
  limpar: () => void
  abrir: () => void
  fechar: () => void
}

const Ctx = createContext<CarrinhoCtx | null>(null)
const CHAVE = 'kadosh_carrinho'

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([])
  const [aberto, setAberto] = useState(false)
  const [pronto, setPronto] = useState(false)

  // carrega a sacola salva uma vez, ao abrir o site
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE)
      if (salvo) setItens(JSON.parse(salvo))
    } catch {
      /* ignora */
    }
    setPronto(true)
  }, [])

  // salva sempre que a sacola muda
  useEffect(() => {
    if (pronto) localStorage.setItem(CHAVE, JSON.stringify(itens))
  }, [itens, pronto])

  const adicionar = useCallback((item: ItemCarrinho) => {
    setItens((atual) => {
      const existe = atual.find((i) => i.variacaoId === item.variacaoId)
      if (existe) {
        return atual.map((i) =>
          i.variacaoId === item.variacaoId
            ? { ...i, quantidade: i.quantidade + item.quantidade }
            : i
        )
      }
      return [...atual, item]
    })
  }, [])

  const remover = useCallback((variacaoId: string) => {
    setItens((atual) => atual.filter((i) => i.variacaoId !== variacaoId))
  }, [])

  const alterarQtd = useCallback((variacaoId: string, qtd: number) => {
    setItens((atual) =>
      atual
        .map((i) => (i.variacaoId === variacaoId ? { ...i, quantidade: qtd } : i))
        .filter((i) => i.quantidade > 0)
    )
  }, [])

  const limpar = useCallback(() => setItens([]), [])

  const total = itens.reduce((s, i) => s + i.preco * i.quantidade, 0)
  const contagem = itens.reduce((s, i) => s + i.quantidade, 0)

  return (
    <Ctx.Provider
      value={{
        itens,
        aberto,
        total,
        contagem,
        adicionar,
        remover,
        alterarQtd,
        limpar,
        abrir: () => setAberto(true),
        fechar: () => setAberto(false),
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useCarrinho() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCarrinho precisa estar dentro de CarrinhoProvider')
  return ctx
}