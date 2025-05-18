import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== '00') {
      return NextResponse.json(
        { code: 1, msg: '无权限' },
        { status: 403 }
      )
    }

    const { id, status, ...data } = await req.json()

    if (!id) {
      return NextResponse.json(
        { code: 1, msg: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 获取文章当前状态
    const currentArticle = await prisma.article.findUnique({
      where: { id }
    })

    if (!currentArticle) {
      return NextResponse.json(
        { code: 1, msg: '文章不存在' },
        { status: 404 }
      )
    }

    // 更新文章
    const article = await prisma.article.update({
      where: { id },
      data: { status, ...data }
    })

    return NextResponse.json({ code: 0, msg: '更新成功', data: article })
  } catch (error) {
    console.error('更新文章出错:', error)
    return NextResponse.json(
      { code: 1, msg: '更新失败，请稍后重试' },
      { status: 500 }
    )
  }
}
