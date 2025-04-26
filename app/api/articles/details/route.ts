import { sendJson } from '@/lib/utils'
import { prisma } from '@/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id') // 从查询参数中获取 id

  try {
    if (!id) {
      return sendJson({ code: -1, msg: 'id 不存在' })
    }

    // 获取文章详情
    const article = await prisma.article.findUnique({
      where: { id: id }
    })

    if (!article) {
      return sendJson({ code: -1, msg: '文章不存在' })
    }

    // 更新文章访问量
    await prisma.article.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      }
    })

    return sendJson({ data: article })
  } catch (error) {
    console.error(error)
    return sendJson({ code: -1, msg: '获取文章详情失败!' })
  }
}
