'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarClienteBrowser } from '@/src/lib/supabase/client'

function gerarSlug(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const inputClass =
  'mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]'

export default function FormCategoria() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEditado, setSlugEditado] = useState(false)
  const [descricao, setDescricao] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  function mudarNome(valor: string) {
    setNome(valor)
    if (!slugEditado) setSlug(gerarSlug(valor))
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!nome.trim()) return setErro('Dê um nome à categoria.')

    setSalvando(true)
    const supabase = criarClienteBrowser()
    const { error } = await supabase.from('categorias').insert({
      nome: nome.trim(),
      slug: slug.trim() || gerarSlug(nome),
      descricao: descricao.trim() || null,
    })
    setSalvando(false)

    if (error) {
      return setErro(
        error.code === '23505'
          ? 'Já existe uma categoria com esse endereço (slug).'
          : 'Não foi possível salvar. Tente novamente.'
      )
    }

    setNome('')
    setSlug('')
    setSlugEditado(false)
    setDescricao('')
    router.refresh()
  }

  return (
    <form onSubmit={salvar} className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <h2 className="font-display text-lg text-[var(--ink)]">Nova categoria</h2>
      <div className="mt-4 space-y-4">
        <div>
          <label className="text-sm text-[var(--muted)]">Nome</label>
          <input
            className={inputClass}
            value={nome}
            placeholder="ex: Apliques"
            onChange={(e) => mudarNome(e.target.value)}
          />
        </div>
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
          <label className="text-sm text-[var(--muted)]">Descrição (opcional)</label>
          <textarea
            className={inputClass}
            rows={2}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm text-white transition hover:bg-[var(--brand-deep)] disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Adicionar categoria'}
        </button>
      </div>
    </form>
  )
}