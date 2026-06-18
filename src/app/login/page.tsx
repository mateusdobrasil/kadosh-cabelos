'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { criarClienteBrowser } from '@/src/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const supabase = criarClienteBrowser()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro('E-mail ou senha incorretos.')
      setCarregando(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl text-[var(--brand)]">Kadosh</p>
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--muted)]">
            Painel administrativo
          </p>
        </div>

        <form
          onSubmit={entrar}
          className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6"
        >
          <div>
            <label className="text-sm text-[var(--muted)]">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--brand)]"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--muted)]">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--brand)]"
            />
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-full bg-[var(--brand)] py-3 text-white transition hover:bg-[var(--brand-deep)] disabled:opacity-50"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <Link href="/" className="mt-4 block text-center text-sm text-[var(--muted)] underline">
          voltar para a loja
        </Link>
      </div>
    </div>
  )
}