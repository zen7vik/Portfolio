'use client'

import { openReader } from '@/components/reader/readerStore'
import { setState, useRide, type LandmarkId } from '@/components/ride/store'
import type { RideData } from '@/components/ride/types'
import { LANDMARKS } from '@/components/ride/world-config'

function date(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const KICKER: Record<LandmarkId, string> = {
  tower: 'Where I work now',
  paisabazaar: 'Where I started',
  nit: 'Where I studied',
  investiq: 'A thing I built for myself',
  library: 'Things I wrote down',
  postbox: 'Say hello',
}

function Body({ id, data }: { id: LandmarkId; data: RideData }) {
  const safe = data.roles[0]
  const pb = data.roles[1]
  switch (id) {
    case 'tower':
      return (
        <>
          <p className="ride-lede">
            {safe.title}, {safe.period}. I own the risk-scoring engine and the workflow platform here. Five systems,
            each with the problem, the design and what I would change. Tap one to read it here:
          </p>
          <ol className="ride-list">
            {data.cases.map((c, i) => (
              <li key={c.slug}>
                <a
                  href={`/work/${c.slug}`}
                  onClick={(e) => {
                    e.preventDefault()
                    openReader('case', c.slug)
                  }}
                >
                  <span className="ride-num">{i + 1}</span>
                  <span>
                    <strong>{c.title}</strong>
                    <em>{c.hook}</em>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </>
      )
    case 'paisabazaar':
      return (
        <>
          <p className="ride-lede">
            {pb.title}, {pb.period}, {pb.place}. {pb.blurb}
          </p>
          <ul className="ride-bullets">
            {pb.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </>
      )
    case 'nit':
      return (
        <>
          <p className="ride-lede">
            {data.education.school}. {data.education.degree}, {data.education.detail}, {data.education.period}.
          </p>
          <p className="ride-note">
            Four years in the hills, where the clouds sit lower than the campus. I studied electrical engineering and
            fell for software anyway.
          </p>
        </>
      )
    case 'investiq':
      return (
        <>
          <p className="ride-lede">
            My ET Money subscription lapsed, so I built the thing myself: stock scoring, an XGBoost and random-forest
            ensemble with walk-forward validation, FinBERT news sentiment, and an automated trading engine where every
            order passes six risk checks.
          </p>
          <div className="ride-links">
            <a href="https://github.com/zen7vik/InvestIQ" target="_blank" rel="noopener noreferrer">
              The code
            </a>
            <a
              href="https://medium.com/@satvik19nitm/my-et-money-subscription-lapsed-so-i-built-the-thing-myself-af0be8d6e98e"
              target="_blank"
              rel="noopener noreferrer"
            >
              The story
            </a>
          </div>
        </>
      )
    case 'library':
      return (
        <ul className="ride-list ride-posts">
          {data.posts.map((p) => (
            <li key={p.id}>
              <a
                href={p.onSite ? `/writing/${p.id}` : p.url}
                target={p.onSite ? undefined : '_blank'}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!p.onSite) return
                  e.preventDefault()
                  openReader('post', p.id)
                }}
              >
                <span>
                  <strong>{p.title}</strong>
                  <em>
                    {date(p.publishedAt)}, {p.readingMinutes} min read
                  </em>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )
    case 'postbox':
      return (
        <>
          <p className="ride-lede">Drop a letter. I read all of them, usually with chai.</p>
          <div className="ride-links ride-links-stack">
            <a href={`mailto:${data.links.email}`}>{data.links.email}</a>
            <a href={data.links.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={data.links.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href={data.links.medium} target="_blank" rel="noopener noreferrer">
              Medium
            </a>
            <a href={data.links.resume} download>
              Resume (PDF)
            </a>
          </div>
        </>
      )
  }
}

export default function Panel({ data }: { data: RideData }) {
  const active = useRide((s) => s.active)
  if (!active) return null
  const def = LANDMARKS.find((l) => l.id === active)!

  return (
    <aside key={active} className="ride-panel" style={{ ['--sign' as string]: def.color }} aria-live="polite">
      <header>
        <p>{KICKER[active]}</p>
        <h2 className="display">{def.name}</h2>
        <button type="button" aria-label="Close" onClick={() => setState({ active: null })}>
          Esc
        </button>
      </header>
      <div className="ride-panel-body">
        <Body id={active} data={data} />
      </div>
      <footer>Drive away or press Esc to close.</footer>
    </aside>
  )
}
