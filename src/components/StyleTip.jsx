import { Lightbulb } from 'lucide-react'
import { STYLE_TIPS } from '../data/ui'

const tipOfTheDay = () => {
  const day = Math.floor(Date.now() / 86400000)
  return STYLE_TIPS[day % STYLE_TIPS.length]
}

export default function StyleTip({ compact = false }) {
  const tip = tipOfTheDay()
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-gold-300/20 bg-gradient-to-br from-gold-300/15 via-blush-400/10 to-transparent ${compact ? 'p-4' : 'p-5 md:p-6'}`}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold-300/20 blur-2xl" />
      <div className="relative flex items-start gap-3">
        <div className={`grid shrink-0 place-items-center rounded-2xl bg-gold-300/20 ${compact ? 'h-8 w-8' : 'h-11 w-11'}`}>
          <Lightbulb className={`text-gold-300 ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
        </div>
        <div>
          <p className="eyebrow">Style tip of the day</p>
          <p className={`mt-1 font-display italic leading-snug ${compact ? 'text-base' : 'text-xl md:text-2xl'}`}>“{tip}”</p>
        </div>
      </div>
    </div>
  )
}
