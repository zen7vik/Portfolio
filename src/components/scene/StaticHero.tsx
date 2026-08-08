export default function StaticHero() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 40%, #171a30 0%, #0a0a0f 70%)',
      }}
    />
  )
}
