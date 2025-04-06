import { sendJson } from '@/lib/utils'
import { prisma } from '@/prisma'

export async function GET() {
  try {
    // 先同步掘金文章
    await fetch('/api/articles/syncJuejinArticles');
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return sendJson({ data: articles })
  } catch (error) {
    return sendJson({ code: -1, msg: `获取所有文章失败: ${error}` })
  }
}
