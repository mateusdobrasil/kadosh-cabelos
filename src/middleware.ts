// src/middleware.ts
import { type NextRequest } from 'next/server'
import { atualizarSessao } from '@/src/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await atualizarSessao(request)
}

export const config = {
  matcher: [
    // roda em tudo, menos arquivos estáticos e imagens
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}