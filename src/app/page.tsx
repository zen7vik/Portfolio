import SectionMorpher from '@/components/scene/SectionMorpher'
import About from '@/components/sections/About'
import Contact from '@/components/sections/Contact'
import Hero from '@/components/sections/Hero'
import Misc from '@/components/sections/Misc'
import Work from '@/components/sections/Work'
import Writing from '@/components/sections/Writing'
import { getAllCases } from '@/lib/content'
import { getPosts } from '@/lib/medium'

export default async function Home() {
  const cases = getAllCases()
  const posts = await getPosts()

  return (
    <main>
      <SectionMorpher />
      <Hero />
      <About />
      <Work cases={cases} />
      <Misc />
      <Writing posts={posts.slice(0, 6)} />
      <Contact />
    </main>
  )
}
