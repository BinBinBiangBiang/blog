import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { code: 1, msg: '无效的退订链接' },
        { status: 400 }
      )
    }

    // 查找并更新订阅状态
    const subscriber = await prisma.subscriber.findUnique({
      where: { token }
    })

    if (!subscriber) {
      return NextResponse.json(
        { code: 1, msg: '无效的退订链接' },
        { status: 400 }
      )
    }

    if (!subscriber.active) {
      return NextResponse.json(
        { code: 1, msg: '该邮箱已经退订' },
        { status: 400 }
      )
    }

    // 更新订阅状态为非活跃
    await prisma.subscriber.update({
      where: { token },
      data: { active: false }
    })

    return NextResponse.json({ code: 0, msg: '退订成功' })
  } catch (error) {
    console.error('退订处理出错:', error)
    return NextResponse.json(
      { code: 1, msg: '退订失败，请稍后重试' },
      { status: 500 }
    )
  }
} 