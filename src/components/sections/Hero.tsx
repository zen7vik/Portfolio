import { ArrowDown, ArrowUpRight } from '@phosphor-icons/react/dist/ssr'
import Playground from '@/components/play/Playground'
import Reveal from '@/components/ui/Reveal'
import SplitWords from '@/components/ui/SplitWords'
import { site } from '@/lib/site'

export default function Hero() {
  return (
    <section
      id="top"
      className="mx-auto grid min-h-[100dvh] max-w-[1320px] grid-cols-1 items-center gap-12 px-5 pb-16 pt-28 md:px-10 lg:grid-cols-12 lg:gap-10 lg:pb-20"
    >
      <div className="lg:col-span-7">
        <Reveal immediate delay={0.1}>
          <p className="text-[0.95rem] text-fg-2">
            Satvik Singh, fullstack AI engineer at Safe Security
          </p>
        </Reveal>
        <SplitWords
          as="h1"
          immediate
          delay={0.2}
          text="I build systems that stay up."
          accent={['up']}
          className="display mt-6 text-[clamp(2.9rem,5.3vw,4.85rem)] text-fg"
        />
        <Reveal immediate delay={0.75}>
          <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-fg-2 md:text-xl md:leading-relaxed">
            {site.intro}
          </p>
        </Reveal>
        <Reveal immediate delay={0.9}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#work"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-[0.95rem] font-semibold text-on-accent transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
            >
              See the work
              <ArrowDown size={16} weight="bold" className="transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>
            <a
              href={`mailto:${site.email}`}
              className="group inline-flex h-12 items-center gap-2 rounded-full border border-fg/20 px-6 text-[0.95rem] font-medium text-fg transition-colors duration-200 hover:border-fg/50"
            >
              Email me
              <ArrowUpRight
                size={16}
                weight="bold"
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </Reveal>
      </div>
      <Reveal immediate delay={0.5} y={30} className="h-[460px] lg:col-span-5 lg:h-[540px]">
        <Playground />
      </Reveal>
    </section>
  )
}
