import type { Metadata } from 'next'
import { Fraunces, Mulish } from 'next/font/google'
import './globals.css'
import { CarrinhoProvider } from '@/src/contexts/CarrinhoContext'
import Header from '@/src/components/Header'
import Footer from '@/src/components/Footer'
import CarrinhoDrawer from '@/src/components/CarrinhoDrawer'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const mulish = Mulish({ subsets: ['latin'], variable: '--font-body', display: 'swap' })

export const metadata: Metadata = {
  title: 'Kadosh Cabelos — Mega Hair & Apliques Premium',
  description:
    'Cabelo natural selecionado a dedo. Monte seu pedido e finalize pelo WhatsApp com atendimento personalizado.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${mulish.variable}`}>
      <body>
        <CarrinhoProvider>
          <Header />
          <CarrinhoDrawer />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </CarrinhoProvider>
      </body>
    </html>
  )
}