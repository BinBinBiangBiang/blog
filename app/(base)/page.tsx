import { JueJinArticles } from './home/JueJinArticles'
import { AiBot } from './home/AiBot'
import { GithubProject } from './home/GithubProject'
import { UserProfile } from './home/UserProfile'
import { TechnologyStack } from './home/TechnologyStack'

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-2 space-y-8">
      <AiBot />
      <UserProfile />

      <TechnologyStack></TechnologyStack>

      <JueJinArticles />

      <GithubProject />
    </div>
  )
}
