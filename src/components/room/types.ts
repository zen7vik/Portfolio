export type RoomData = {
  posts: { id: string; title: string; href: string; external: boolean; date: string; minutes: number }[]
  cases: { slug: string; title: string; hook: string; stats: { value: string; label: string }[] }[]
}
