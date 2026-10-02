import CountUp from '@/components/ui/CountUp'
import Reveal from '@/components/ui/Reveal'
import { site } from '@/lib/site'

export default function Proof() {
  return (
    <section aria-label="Production numbers" className="border-y border-line">
      <div className="mx-auto grid max-w-[1320px] grid-cols-2 lg:grid-cols-4">
        {site.proof.map((p, i) => (
          <Reveal
            key={p.label}
            delay={i * 0.08}
            className={`px-5 py-10 md:px-10 md:py-14 ${i % 2 ? 'border-l border-line' : ''} ${
              i > 1 ? 'border-t border-line lg:border-t-0' : ''
            } ${i === 2 ? 'lg:border-l' : ''}`}
          >
            <p className="display text-[clamp(2.6rem,5vw,4.25rem)] text-fg">
              <CountUp
                value={p.value}
                decimals={'decimals' in p ? p.decimals : 0}
                prefix={'prefix' in p ? p.prefix : ''}
                suffix={'suffix' in p ? p.suffix : ''}
              />
            </p>
            <p className="mt-4 text-[0.95rem] font-medium leading-snug text-fg">{p.label}</p>
            <p className="mt-1 text-sm leading-snug text-muted">{p.note}</p>
          </Reveal>
        ))}
      </div>
      <p className="mx-auto max-w-[1320px] border-t border-line px-5 py-3 text-xs text-muted md:px-10">
        Measured in production over 30 days to September 2026.
      </p>
    </section>
  )
}
