// src/lib/types.ts
// Tipos que espelham as tabelas do banco (Kadosh Cabelos)

export type Textura = 'liso' | 'ondulado' | 'cacheado' | 'crespo'

export type StatusPedido =
  | 'pendente' | 'pago' | 'em_separacao' | 'enviado' | 'entregue' | 'cancelado'

export interface Categoria {
  id: string
  nome: string
  slug: string
  descricao: string | null
  ativo: boolean
}

export interface Produto {
  id: string
  categoria_id: string | null
  nome: string
  slug: string
  descricao: string | null
  origem: string | null
  ativo: boolean
  criado_em: string
}

export interface ProdutoVariacao {
  id: string
  produto_id: string
  sku: string | null
  textura: Textura | null
  cor: string | null
  comprimento_cm: number | null
  peso_gramas: number | null
  preco: number
  preco_promocional: number | null
  estoque: number
  estoque_minimo: number
  ativo: boolean
}

export interface ProdutoImagem {
  id: string
  produto_id: string
  url: string
  ordem: number
  principal: boolean
}

// Produto já com suas variações e imagens (usado nas telas da loja)
export interface ProdutoCompleto extends Produto {
  variacoes: ProdutoVariacao[]
  imagens: ProdutoImagem[]
  categoria?: Categoria | null
}

// Item dentro do carrinho (vive só no navegador até virar pedido no WhatsApp)
export interface ItemCarrinho {
  variacaoId: string
  nomeProduto: string
  descricaoVariacao: string   // ex: "Liso · Castanho · 50cm · 100g"
  preco: number
  quantidade: number
  imagemUrl?: string
}