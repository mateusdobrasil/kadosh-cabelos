import { notFound } from 'next/navigation'
import { criarClienteServer } from '@/src/lib/supabase/server'
import type { ProdutoCompleto } from '@/src/lib/types'
import ProdutoCompra from './ProdutoCompra'

export const revalidate = 60

export default async function PaginaProduto({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await criarClienteServer()

  const { data } = await supabase
    .from('produtos')
    .select('*, variacoes:produto_variacoes(*), imagens:produto_imagens(*)')
    .eq('slug', slug)
    .eq('ativo', true)
    .single()

  if (!data) notFound()

  const produto = data as unknown as ProdutoCompleto
  const imagens = [...produto.imagens].sort((a, b) => a.ordem - b.ordem)
  const capa = imagens.find((i) => i.principal)?.url ?? imagens[0]?.url

  return (
    <article className="mx-auto max-w-6xl px-5 py-10 md:py-16">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Galeria */}
        <div>
          <div className="aspect-[3/4] overflow-hidden rounded-3xl bg-[var(--cream-deep)]">
            {capa ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={capa} alt={produto.nome} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-[var(--muted)]">sem foto</div>
            )}
          </div>
          {imagens.length > 1 && (
            <div className="mt-3 flex gap-3">
              {imagens.slice(0, 4).map((img) => (
                <div
                  key={img.id}
                  className="aspect-square w-20 overflow-hidden rounded-xl bg-[var(--cream-deep)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compra */}
        <div className="md:pt-4">
          {produto.origem && (
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--gold)]">{produto.origem}</p>
          )}
          <h1 className="mt-2 font-display text-3xl text-[var(--plum)] md:text-4xl">
            {produto.nome}
          </h1>
          {produto.descricao && (
            <p className="mt-4 leading-relaxed text-[var(--muted)]">{produto.descricao}</p>
          )}
          <ProdutoCompra produto={produto} />
        </div>
      </div>
    </article>
  )
}