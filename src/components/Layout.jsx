import { useEffect } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Sidebar, MobileHeader, BottomNav } from './Navigation'
import { PageTransition } from './ui'
import WhatsAppButton from './WhatsAppButton'
import Footer from './Footer'

export default function Layout() {
  const { pathname } = useLocation()
  const outlet = useOutlet()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileHeader />
      <div className="lg:pl-[18rem]">
        <main className="mx-auto max-w-6xl px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-8">
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={pathname}>{outlet}</PageTransition>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
      <BottomNav />
      {!['/cart', '/gift-studio'].includes(pathname) && <WhatsAppButton />}
    </div>
  )
}
