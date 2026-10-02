import Contact from '@/components/sections/Contact'
import Experience from '@/components/sections/Experience'
import Hero from '@/components/sections/Hero'
import Nav from '@/components/sections/Nav'
import Projects from '@/components/sections/Projects'
import Proof from '@/components/sections/Proof'
import Work from '@/components/sections/Work'
import Writing from '@/components/sections/Writing'
import { getAllCases } from '@/lib/content'
import { getPosts } from '@/lib/medium'

export default async function Home() {
  const cases = getAllCases()
  const posts = await getPosts()

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Proof />
        <Work cases={cases} />
        <Experience />
        <Projects />
        <Writing posts={posts.slice(0, 6)} />
        <Contact />
      </main>
    </>
  )
}
