import { criarClienteServer } from '@/src/lib/supabase/server'
import type { ProdutoCompleto } from '@/src/lib/types'
import ProdutoCard from '@/src/components/ProdutoCard'

export const revalidate = 60

export default async function Home() {
  const supabase = await criarClienteServer()
  const { data } = await supabase
    .from('produtos')
    .select('*, variacoes:produto_variacoes(*), imagens:produto_imagens(*)')
    .eq('ativo', true)
    .order('criado_em', { ascending: false })

  const produtos = (data ?? []) as unknown as ProdutoCompleto[]

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-12 md:pt-24">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--gold)]">
          Cabelo natural selecionado
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] text-[var(--plum)] md:text-6xl">
          Cada mecha, escolhida a dedo.
        </h1>
        <p className="mt-5 max-w-md text-[var(--muted)]">
          Mega hair e apliques de cabelo natural, com atendimento próximo. Monte seu pedido e
          finalize pelo WhatsApp.
        </p>
      </section>

      {/* Vitrine */}
      <section className="mx-auto max-w-6xl px-5">
        <div className="mb-6 flex items-baseline justify-between border-b border-[var(--line)] pb-3">
          <h2 className="font-display text-2xl text-[var(--ink)]">Nossos cabelos</h2>
          <span className="text-sm text-[var(--muted)]">
            {produtos.length} {produtos.length === 1 ? 'modelo' : 'modelos'}
          </span>
        </div>

        {produtos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--line)] px-6 py-20 text-center">
            <p className="font-display text-xl text-[var(--plum)]">A vitrine está sendo preparada</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Assim que você cadastrar os cabelos no painel, eles aparecem aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 pb-10 md:grid-cols-3 lg:grid-cols-4">
            {produtos.map((p) => (
              <ProdutoCard key={p.id} produto={p} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}