import { sendJson } from '@/lib/utils'
import { prisma } from '@/prisma'

export async function GET() {
  try {
    let articles;

    articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log('articles', articles)

    if (!articles) {
      // 同步掘金文章
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/articles/syncJuejinArticles`, {
          headers: {
            'x-api-key': process.env.GITHUB_REPOSITORY_API_KEY
          }
      });

      articles = await prisma.article.findMany({
        orderBy: { createdAt: 'desc' }
      })
    }

    return sendJson({ data: articles })
  } catch (error) {
    return sendJson({ code: -1, msg: `获取所有文章失败: ${error}` })
  }
}
