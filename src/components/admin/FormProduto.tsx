'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Categoria } from '@/src/lib/types'
import { criarClienteBrowser } from '@/src/lib/supabase/client'

// gera um slug (endereço do produto) a partir do nome
function gerarSlug(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface VariacaoForm {
  textura: string
  cor: string
  comprimento_cm: string
  peso_gramas: string
  preco: string
  preco_promocional: string
  estoque: string
  estoque_minimo: string
  sku: string
}

const variacaoVazia: VariacaoForm = {
  textura: '',
  cor: '',
  comprimento_cm: '',
  peso_gramas: '',
  preco: '',
  preco_promocional: '',
  estoque: '0',
  estoque_minimo: '0',
  sku: '',
}

const inputClass =
  'mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]'

export default function FormProduto({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEditado, setSlugEditado] = useState(false)
  const [descricao, setDescricao] = useState('')
  const [origem, setOrigem] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [variacoes, setVariacoes] = useState<VariacaoForm[]>([{ ...variacaoVazia }])
  const [arquivos, setArquivos] = useState<File[]>([])
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  function mudarNome(valor: string) {
    setNome(valor)
    if (!slugEditado) setSlug(gerarSlug(valor))
  }

  function atualizarVariacao(i: number, campo: keyof VariacaoForm, valor: string) {
    setVariacoes((atual) =>
      atual.map((v, idx) => (idx === i ? { ...v, [campo]: valor } : v))
    )
  }

  function adicionarVariacao() {
    setVariacoes((atual) => [...atual, { ...variacaoVazia }])
  }

  function removerVariacao(i: number) {
    setVariacoes((atual) => atual.filter((_, idx) => idx !== i))
  }

  function selecionarArquivos(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setArquivos(Array.from(e.target.files))
  }

  const num = (s: string) => (s.trim() === '' ? null : Number(s))

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!nome.trim()) return setErro('Dê um nome ao produto.')
    if (variacoes.length === 0) return setErro('Adicione ao menos uma variação.')
    if (variacoes.some((v) => v.preco.trim() === '' || Number(v.preco) <= 0))
      return setErro('Cada variação precisa de um preço maior que zero.')

    setEnviando(true)
    const supabase = criarClienteBrowser()

    // 1. cria o produto
    const { data: prod, error: e1 } = await supabase
      .from('produtos')
      .insert({
        nome: nome.trim(),
        slug: slug.trim(),
        descricao: descricao.trim() || null,
        origem: origem.trim() || null,
        categoria_id: categoriaId || null,
        ativo,
      })
      .select('id')
      .single()

    if (e1 || !prod) {
      setEnviando(false)
      if (e1?.code === '23505')
        return setErro('Já existe um produto com esse endereço (slug). Mude o campo “slug”.')
      return setErro('Não foi possível salvar o produto. Tente novamente.')
    }

    const produtoId = prod.id as string

    // 2. cria as variações
    const linhas = variacoes.map((v) => ({
      produto_id: produtoId,
      sku: v.sku.trim() || null,
      textura: v.textura || null,
      cor: v.cor.trim() || null,
      comprimento_cm: num(v.comprimento_cm),
      peso_gramas: num(v.peso_gramas),
      preco: Number(v.preco),
      preco_promocional: num(v.preco_promocional),
      estoque: Number(v.estoque || '0'),
      estoque_minimo: Number(v.estoque_minimo || '0'),
    }))

    const { error: e2 } = await supabase.from('produto_variacoes').insert(linhas)
    if (e2) {
      setEnviando(false)
      return setErro('Produto criado, mas houve erro nas variações. Verifique e tente editar.')
    }

    // 3. envia as imagens para o Storage e registra as URLs
    for (let i = 0; i < arquivos.length; i++) {
      const file = arquivos[i]
      const ext = file.name.split('.').pop()
      const caminho = `${produtoId}/${crypto.randomUUID()}.${ext}`
      const { error: up } = await supabase.storage.from('produtos').upload(caminho, file)
      if (up) continue
      const { data: pub } = supabase.storage.from('produtos').getPublicUrl(caminho)
      await supabase.from('produto_imagens').insert({
        produto_id: produtoId,
        url: pub.publicUrl,
        ordem: i,
        principal: i === 0,
      })
    }

    router.push('/admin/produtos')
    router.refresh()
  }

  return (
    <form onSubmit={salvar} className="mt-6 max-w-3xl space-y-8">
      {/* Dados do produto */}
      <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
        <h2 className="font-display text-lg text-[var(--ink)]">Dados do produto</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm text-[var(--muted)]">Nome</label>
            <input className={inputClass} value={nome} onChange={(e) => mudarNome(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-[var(--muted)]">Slug (endereço)</label>
              <input
                className={inputClass}
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugEditado(true)
                }}
              />
            </div>
            <div>
              <label className="text-sm text-[var(--muted)]">Categoria</label>
              <select
                className={inputClass}
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <option value="">(sem categoria)</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-[var(--muted)]">Origem (opcional)</label>
            <input
              className={inputClass}
              value={origem}
              placeholder="ex: cabelo natural brasileiro"
              onChange={(e) => setOrigem(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-[var(--muted)]">Descrição</label>
            <textarea
              className={inputClass}
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
            <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
            Visível na loja
          </label>
        </div>
      </section>

      {/* Variações */}
      <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-[var(--ink)]">Variações</h2>
          <button
            type="button"
            onClick={adicionarVariacao}
            className="text-sm text-[var(--brand)] hover:text-[var(--brand-deep)]"
          >
            + adicionar variação
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {variacoes.map((v, i) => (
            <div key={i} className="rounded-xl border border-[var(--line)] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--ink)]">Variação {i + 1}</span>
                {variacoes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removerVariacao(i)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    remover
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-[var(--muted)]">Textura</label>
                  <select
                    className={inputClass}
                    value={v.textura}
                    onChange={(e) => atualizarVariacao(i, 'textura', e.target.value)}
                  >
                    <option value="">—</option>
                    <option value="liso">Liso</option>
                    <option value="ondulado">Ondulado</option>
                    <option value="cacheado">Cacheado</option>
                    <option value="crespo">Crespo</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)]">Cor</label>
                  <input
                    className={inputClass}
                    value={v.cor}
                    placeholder="ex: Castanho escuro"
                    onChange={(e) => atualizarVariacao(i, 'cor', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)]">Comprimento (cm)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={v.comprimento_cm}
                    onChange={(e) => atualizarVariacao(i, 'comprimento_cm', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)]">Peso (g)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={v.peso_gramas}
                    onChange={(e) => atualizarVariacao(i, 'peso_gramas', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)]">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    value={v.preco}
                    onChange={(e) => atualizarVariacao(i, 'preco', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)]">Preço promocional (opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    value={v.preco_promocional}
                    onChange={(e) => atualizarVariacao(i, 'preco_promocional', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)]">Estoque inicial</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={v.estoque}
                    onChange={(e) => atualizarVariacao(i, 'estoque', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)]">Estoque mínimo (alerta)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={v.estoque_minimo}
                    onChange={(e) => atualizarVariacao(i, 'estoque_minimo', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-[var(--muted)]">SKU (código interno, opcional)</label>
                  <input
                    className={inputClass}
                    value={v.sku}
                    onChange={(e) => atualizarVariacao(i, 'sku', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Imagens */}
      <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
        <h2 className="font-display text-lg text-[var(--ink)]">Fotos</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">A primeira foto será a principal.</p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={selecionarArquivos}
          className="mt-3 block w-full text-sm text-[var(--muted)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand)] file:px-4 file:py-2 file:text-white"
        />
        {arquivos.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {arquivos.map((f, i) => (
              <div
                key={i}
                className="h-20 w-16 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </section>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-[var(--brand)] px-8 py-3 text-white transition hover:bg-[var(--brand-deep)] disabled:opacity-50"
        >
          {enviando ? 'Salvando...' : 'Salvar produto'}
        </button>
      </div>
    </form>
  )
}