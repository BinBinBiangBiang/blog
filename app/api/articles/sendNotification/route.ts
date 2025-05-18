import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNewArticleNotification } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { articleId } = await req.json()

    if (!articleId) {
      return NextResponse.json(
        { code: 1, msg: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 获取文章信息
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    })

    if (!article) {
      return NextResponse.json(
        { code: 1, msg: '文章不存在' },
        { status: 404 }
      )
    }

    // 获取所有活跃的订阅者
    const subscribers = await prisma.subscriber.findMany({
      where: { active: true }
    })

    if (subscribers.length === 0) {
      return NextResponse.json({ 
        code: 0, 
        msg: '没有活跃的订阅者',
        data: { sentCount: 0 } 
      })
    }

    // 发送通知邮件给所有订阅者
    let sentCount = 0
    const promises = subscribers.map(async (subscriber) => {
      try {
        await sendNewArticleNotification(
          subscriber.email,
          {
            title: article.title,
            description: article.summary,
            id: article.id
          },
          subscriber.token
        )
        sentCount++
      } catch (error) {
        console.error(`向 ${subscriber.email} 发送通知失败:`, error)
      }
    })

    await Promise.all(promises)

    return NextResponse.json({ 
      code: 0, 
      msg: `已成功发送 ${sentCount} 封通知邮件`, 
      data: { sentCount } 
    })
  } catch (error) {
    console.error('发送文章通知出错:', error)
    return NextResponse.json(
      { code: 1, msg: '发送通知失败，请稍后重试' },
      { status: 500 }
    )
  }
} 