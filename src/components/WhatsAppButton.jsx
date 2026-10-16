import { motion } from 'framer-motion'
import { WHATSAPP_NUMBER } from '../data/ui'

export default function WhatsAppButton() {
  const text = encodeURIComponent('Hi Glimmora! ✨ I’d like to place an order.')
  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`}
      target="_blank"
      rel="noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="group fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.6)] lg:bottom-6 lg:right-6"
      aria-label="Order on WhatsApp"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20" />
      <svg viewBox="0 0 24 24" className="relative h-6 w-6 fill-current" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 01-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 01-1.45-5.03c0-5.22 4.25-9.46 9.48-9.46a9.4 9.4 0 016.69 2.78 9.4 9.4 0 012.77 6.69c0 5.22-4.25 9.46-9.46 9.46zm8.05-17.52A11.32 11.32 0 0012.04.64C5.77.64.66 5.74.66 12.02c0 2 .52 3.96 1.52 5.69L.57 23.6l6.04-1.58a11.36 11.36 0 005.43 1.38h.01c6.27 0 11.38-5.1 11.38-11.38 0-3.04-1.18-5.9-3.34-8.04z" />
      </svg>
      <span className="relative hidden pr-1 text-sm font-semibold md:inline">Order on WhatsApp</span>
    </motion.a>
  )
}
