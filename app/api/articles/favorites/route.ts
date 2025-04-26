import { sendJson } from '@/lib/utils'
import { prisma } from '@/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

// 获取文章的收藏状态
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId')
    
    if (!articleId) {
      return sendJson({ code: -1, msg: '文章ID不能为空' })
    }
    
    const session = await getServerSession(authOptions)
    let isFavorited = false
    
    // 如果用户已登录，检查是否已收藏
    if (session?.user) {
      const userFavorite = await prisma.userFavorite.findUnique({
        where: {
          userId_articleId: {
            userId: session.user.id,
            articleId
          }
        }
      })
      
      isFavorited = !!userFavorite
    }
    
    // 获取文章的收藏总数
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { favorites: true }
    })
    
    return sendJson({ 
      data: { 
        isFavorited,
        count: article?.favorites || 0 
      } 
    })
  } catch (error) {
    console.error('获取收藏状态失败:', error)
    return sendJson({ code: -1, msg: `获取收藏状态失败: ${error}` })
  }
}

// 收藏或取消收藏
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
    
    // 检查用户是否已收藏
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId
        }
      }
    })
    
    // 根据现有状态进行收藏或取消收藏
    if (existingFavorite) {
      // 如果已收藏，则取消收藏
      await prisma.userFavorite.delete({
        where: {
          id: existingFavorite.id
        }
      })
      
      // 更新文章收藏数
      await prisma.article.update({
        where: { id: articleId },
        data: {
          favorites: {
            decrement: 1
          }
        }
      })
      
      return sendJson({ data: { isFavorited: false, action: 'unfavorite' } })
    } else {
      // 如果未收藏，则添加收藏
      await prisma.userFavorite.create({
        data: {
          userId: session.user.id,
          articleId
        }
      })
      
      // 更新文章收藏数
      await prisma.article.update({
        where: { id: articleId },
        data: {
          favorites: {
            increment: 1
          }
        }
      })
      
      return sendJson({ data: { isFavorited: true, action: 'favorite' } })
    }
  } catch (error) {
    console.error('操作收藏失败:', error)
    return sendJson({ code: -1, msg: `操作收藏失败: ${error}` })
  }
} 