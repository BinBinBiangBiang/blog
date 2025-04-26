import { sendJson } from '@/lib/utils'
import { prisma } from '@/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

// 获取文章的点赞状态
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId')
    
    if (!articleId) {
      return sendJson({ code: -1, msg: '文章ID不能为空' })
    }
    
    const session = await getServerSession(authOptions)
    let isLiked = false
    
    // 如果用户已登录，检查是否已点赞
    if (session?.user) {
      const userLike = await prisma.userLike.findUnique({
        where: {
          userId_articleId: {
            userId: session.user.id,
            articleId
          }
        }
      })
      
      isLiked = !!userLike
    }
    
    // 获取文章的点赞总数
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { likes: true }
    })
    
    return sendJson({ 
      data: { 
        isLiked,
        count: article?.likes || 0 
      } 
    })
  } catch (error) {
    console.error('获取点赞状态失败:', error)
    return sendJson({ code: -1, msg: `获取点赞状态失败: ${error}` })
  }
}

// 点赞或取消点赞
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return sendJson({ code: 401, msg: '请先登录' })
    }
    
    const { articleId } = await req.json()
    
    if (!articleId) {
      return sendJson({ code: -1, msg: '文章ID不能为空' })
    }
    
    // 查找文章
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    })
    
    if (!article) {
      return sendJson({ code: -1, msg: '文章不存在' })
    }
    
    // 检查用户是否已点赞
    const existingLike = await prisma.userLike.findUnique({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId
        }
      }
    })
    
    // 根据现有状态进行点赞或取消点赞
    if (existingLike) {
      // 如果已点赞，则取消点赞
      await prisma.userLike.delete({
        where: {
          id: existingLike.id
        }
      })
      
      // 更新文章点赞数
      await prisma.article.update({
        where: { id: articleId },
        data: {
          likes: {
            decrement: 1
          }
        }
      })
      
      return sendJson({ data: { isLiked: false, action: 'unlike' } })
    } else {
      // 如果未点赞，则添加点赞
      await prisma.userLike.create({
        data: {
          userId: session.user.id,
          articleId
        }
      })
      
      // 更新文章点赞数
      await prisma.article.update({
        where: { id: articleId },
        data: {
          likes: {
            increment: 1
          }
        }
      })
      
      return sendJson({ data: { isLiked: true, action: 'like' } })
    }
  } catch (error) {
    console.error('操作点赞失败:', error)
    return sendJson({ code: -1, msg: `操作点赞失败: ${error}` })
  }
} 