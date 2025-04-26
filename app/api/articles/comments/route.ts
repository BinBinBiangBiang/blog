import { sendJson } from '@/lib/utils'
import { prisma } from '@/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

// 获取文章评论
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId')
    
    if (!articleId) {
      return sendJson({ code: -1, msg: '文章ID不能为空' })
    }
    
    // 获取文章的所有评论
    const comments = await prisma.comment.findMany({
      where: {
        articleId,
        isDeleted: 0
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })
    
    return sendJson({ data: comments })
  } catch (error) {
    console.error('获取评论失败:', error)
    return sendJson({ code: -1, msg: `获取评论失败: ${error}` })
  }
}

// 添加评论
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return sendJson({ code: 401, msg: '请先登录' })
    }
    
    const { articleId, content, parentId } = await req.json()
    
    if (!articleId || !content) {
      return sendJson({ code: -1, msg: '文章ID和评论内容不能为空' })
    }
    
    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        content,
        articleId,
        authorId: session.user.id,
        parentId: parentId || null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })
    
    return sendJson({ data: comment })
  } catch (error) {
    console.error('添加评论失败:', error)
    return sendJson({ code: -1, msg: `添加评论失败: ${error}` })
  }
}

// 删除评论
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return sendJson({ code: 401, msg: '请先登录' })
    }
    
    const { id } = await req.json()
    
    if (!id) {
      return sendJson({ code: -1, msg: '评论ID不能为空' })
    }
    
    // 获取评论信息
    const comment = await prisma.comment.findUnique({
      where: { id }
    })
    
    if (!comment) {
      return sendJson({ code: -1, msg: '评论不存在' })
    }
    
    // 检查是否是评论作者或管理员
    if (comment.authorId !== session.user.id && session.user.role !== '00') {
      return sendJson({ code: 403, msg: '无权删除此评论' })
    }
    
    // 软删除评论
    await prisma.comment.update({
      where: { id },
      data: {
        isDeleted: 1,
        deletedAt: new Date()
      }
    })
    
    return sendJson({ msg: '评论已删除' })
  } catch (error) {
    console.error('删除评论失败:', error)
    return sendJson({ code: -1, msg: `删除评论失败: ${error}` })
  }
} 