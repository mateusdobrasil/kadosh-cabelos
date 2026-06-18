// src/lib/whatsapp.ts
// Monta a mensagem do pedido e gera o link que abre o WhatsApp da loja.
import type { ItemCarrinho } from '@/src/lib/types'

const real = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function calcularTotal(itens: ItemCarrinho[]): number {
  return itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0)
}

export function gerarLinkWhatsApp(itens: ItemCarrinho[], nome?: string): string {
  const numero = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO
  const total = calcularTotal(itens)

  const linhas = itens.map(
    (i) =>
      `• ${i.nomeProduto} (${i.descricaoVariacao}) — ${i.quantidade}x ${real(i.preco)}`
  )

  const saudacao = nome ? `Olá! Aqui é ${nome}. ` : 'Olá! '
  const mensagem =
    `${saudacao}Gostaria de fazer um pedido na *Kadosh Cabelos*:\n\n` +
    `${linhas.join('\n')}\n\n` +
    `*Total: ${real(total)}*\n\n` +
    `Pode me ajudar a finalizar?`

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
}