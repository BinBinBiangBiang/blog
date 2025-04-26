import { randomUUID } from 'crypto'
import { sendJson } from '@/lib/utils'
import { prisma } from '@/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, content, classify, coverImg, summary, status = '01' } = body

    const newArticle = await prisma.article.create({
      data: {
        id: randomUUID().replaceAll('-', ''),
        title,
        content,
        classify,
        coverImg,
        summary,
        status, // 00=草稿 01=已发布
        source: '00', // 博客原创
        userId: 1 // 示例，通常从认证信息中获取用户ID
      }
    })
    return sendJson({ data: newArticle })
  } catch (error) {
    return sendJson({ code: -1, msg: `创建文章失败 ${error}` })
  }
}
