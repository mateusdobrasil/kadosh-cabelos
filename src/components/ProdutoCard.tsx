import Link from 'next/link'
import type { ProdutoCompleto } from '@/src/lib/types'
import { formatarReal } from '@/src/lib/format'

export default function ProdutoCard({ produto }: { produto: ProdutoCompleto }) {
  const precos = produto.variacoes
    .filter((v) => v.ativo)
    .map((v) => v.preco_promocional ?? v.preco)
  const menor = precos.length ? Math.min(...precos) : null

  const capa =
    produto.imagens.find((i) => i.principal)?.url ?? produto.imagens[0]?.url

  return (
    <Link href={`/produto/${produto.slug}`} className="group block">
      <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-[var(--cream-deep)]">
        {capa ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={capa}
            alt={produto.nome}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-[var(--muted)]">
            sem foto
          </div>
        )}
      </div>
      <h3 className="mt-3 font-display text-lg text-[var(--ink)]">{produto.nome}</h3>
      {menor !== null && (
        <p className="text-sm text-[var(--muted)]">
          a partir de <span className="text-[var(--plum)]">{formatarReal(menor)}</span>
        </p>
      )}
    </Link>
  )
}