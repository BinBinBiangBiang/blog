import { sendJson } from '@/lib/utils'
import { Octokit } from 'octokit'

export async function GET() {
  try {
    const username = process.env.NEXT_PUBLIC_GITHUB_USER_NAME
    
    if (!username) {
      return sendJson({ code: -1, msg: 'GitHub 用户名未配置' })
    }
    
    const octokit = new Octokit({
      auth: process.env.GITHUB_API_TOKEN
    })
    
    // 获取用户的仓库
    const { data: repos } = await octokit.request('GET /users/{username}/repos', {
      username,
      sort: 'updated',
      per_page: 6
    })
    
    return sendJson({ data: repos })
  } catch (error) {
    console.error('获取 GitHub 置顶仓库失败:', error)
    return sendJson({ code: -1, msg: `获取 GitHub 置顶仓库失败: ${error}` })
  }
}
