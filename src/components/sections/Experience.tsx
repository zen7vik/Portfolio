import Reveal from '@/components/ui/Reveal'
import SplitWords from '@/components/ui/SplitWords'
import { education, roles, stack } from '@/content/experience'

export default function Experience() {
  return (
    <section id="experience" className="border-t border-line">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-36">
        <SplitWords text="Where I've worked" className="display-tight text-[clamp(2.2rem,4.6vw,3.9rem)]" />

        <div className="mt-14 space-y-16 md:mt-20 md:space-y-24">
          {roles.map((r) => (
            <div key={r.company} className="grid gap-6 lg:grid-cols-12 lg:gap-14">
              <Reveal className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <h3 className="display-tight text-[1.9rem] text-fg">{r.company}</h3>
                  <p className="mt-2 text-[1rem] font-medium text-fg-2">{r.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {r.period}, {r.place}
                  </p>
                  <p className="mt-5 max-w-[22rem] text-[0.95rem] leading-relaxed text-muted">{r.blurb}</p>
                </div>
              </Reveal>
              <ul className="space-y-5 lg:col-span-8">
                {r.points.map((p, i) => (
                  <li key={i}>
                    <Reveal delay={i * 0.04} y={14} className="grid grid-cols-[1.5rem_1fr] gap-x-2">
                      <span aria-hidden className="mt-[0.8em] h-px w-3.5 bg-accent" />
                      <span className="text-[1.05rem] leading-relaxed text-fg-2 md:text-[1.1rem]">{p}</span>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 grid gap-10 border-t border-line pt-12 md:mt-28 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-4">
            <p className="text-sm text-muted">Education</p>
            <p className="mt-3 text-[1.05rem] font-medium leading-snug text-fg">{education.school}</p>
            <p className="mt-1 text-[0.95rem] text-fg-2">
              {education.degree}, {education.detail}
            </p>
            <p className="mt-1 text-sm text-muted">{education.period}</p>
          </Reveal>
          <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:col-span-8">
            {stack.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.05}>
                <dt className="text-sm text-muted">{s.label}</dt>
                <dd className="mt-2 text-[1rem] leading-relaxed text-fg">{s.items}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
