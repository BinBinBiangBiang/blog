'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Bookmark, Share2 } from 'lucide-react'
import { toast } from '@/components/hooks/use-toast'
import { useSession } from 'next-auth/react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ArticleInteractionsProps {
  articleId: string
}

export function ArticleInteractions({ articleId }: ArticleInteractionsProps) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [isLoadingLike, setIsLoadingLike] = useState(false)
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false)

  // 获取初始状态
  useEffect(() => {
    async function fetchLikeStatus() {
      try {
        const res = await fetch(`/api/articles/likes?articleId=${articleId}`).then(res => res.json())
        if (res.code === 0) {
          setIsLiked(res.data.isLiked)
          setLikeCount(res.data.count)
        }
      } catch (error) {
        console.error('获取点赞状态失败', error)
      }
    }

    async function fetchFavoriteStatus() {
      try {
        const res = await fetch(`/api/articles/favorites?articleId=${articleId}`).then(res => res.json())
        if (res.code === 0) {
          setIsFavorited(res.data.isFavorited)
          setFavoriteCount(res.data.count)
        }
      } catch (error) {
        console.error('获取收藏状态失败', error)
      }
    }

    fetchLikeStatus()
    fetchFavoriteStatus()
  }, [articleId])

  // 处理点赞
  const handleLike = async () => {
    if (!session) {
      toast({ 
        title: '提示', 
        description: '请先登录后再点赞', 
        variant: 'default' 
      })
      return
    }

    setIsLoadingLike(true)
    try {
      const res = await fetch('/api/articles/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ articleId })
      }).then(res => res.json())

      if (res.code === 0) {
        setIsLiked(res.data.isLiked)
        setLikeCount(prev => res.data.action === 'like' ? prev + 1 : prev - 1)
        
        const actionText = res.data.action === 'like' ? '点赞成功' : '已取消点赞'
        toast({ title: '提示', description: actionText })
      } else {
        toast({ 
          title: '操作失败', 
          description: res.msg || '点赞操作失败', 
          variant: 'destructive' 
        })
      }
    } catch (error) {
      toast({ 
        title: '操作失败', 
        description: '点赞操作失败，请稍后再试', 
        variant: 'destructive' 
      })
    } finally {
      setIsLoadingLike(false)
    }
  }

  // 处理收藏
  const handleFavorite = async () => {
    if (!session) {
      toast({ 
        title: '提示', 
        description: '请先登录后再收藏', 
        variant: 'default' 
      })
      return
    }

    setIsLoadingFavorite(true)
    try {
      const res = await fetch('/api/articles/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ articleId })
      }).then(res => res.json())

      if (res.code === 0) {
        setIsFavorited(res.data.isFavorited)
        setFavoriteCount(prev => res.data.action === 'favorite' ? prev + 1 : prev - 1)
        
        const actionText = res.data.action === 'favorite' ? '收藏成功' : '已取消收藏'
        toast({ title: '提示', description: actionText })
      } else {
        toast({ 
          title: '操作失败', 
          description: res.msg || '收藏操作失败', 
          variant: 'destructive' 
        })
      }
    } catch (error) {
      toast({ 
        title: '操作失败', 
        description: '收藏操作失败，请稍后再试', 
        variant: 'destructive' 
      })
    } finally {
      setIsLoadingFavorite(false)
    }
  }

  // 分享文章
  const handleShare = () => {
    const title = document.title
    const url = window.location.href
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    const imageUrl = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || ''

    // 创建分享菜单
    const shareMenu = document.createElement('div')
    shareMenu.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50'
    shareMenu.innerHTML = `
      <div class="bg-white rounded-lg p-4 max-w-sm w-full">
        <h3 class="text-lg font-semibold mb-4">分享到</h3>
        <div class="grid grid-cols-2 gap-4">
          <a href="https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&pics=${encodeURIComponent(imageUrl)}&summary=${encodeURIComponent(description)}" 
             target="_blank" 
             class="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
            <img src="https://qzonestyle.gtimg.cn/qzone/space_item/pre/0/66768.gif" alt="QQ" class="w-6 h-6"/>
            <span>QQ</span>
          </a>
          
          <a href="https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&pic=${encodeURIComponent(imageUrl)}" 
             target="_blank" 
             class="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
            <img src="https://www.weibo.com/favicon.ico" alt="微博" class="w-6 h-6"/>
            <span>微博</span>
          </a>
        </div>

        <div class="mt-4">
          <button 
            onclick="navigator.clipboard.writeText('${url}').then(() => alert('链接已复制到剪贴板'))" 
            class="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded w-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <span>复制链接</span>
          </button>
        </div>

        <button class="mt-4 w-full py-2 bg-gray-100 rounded hover:bg-gray-200" onclick="this.parentElement.parentElement.remove()">取消</button>
      </div>
    `
    document.body.appendChild(shareMenu)
  }

  return (
    <div className="fixed left-5 bottom-20 flex flex-col space-y-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full w-12 h-12 ${isLiked ? 'text-red-500 border-red-500 hover:text-red-600 hover:border-red-600' : ''}`}
              onClick={handleLike}
              disabled={isLoadingLike}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500' : ''}`} />
              <span className="sr-only">点赞</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isLiked ? '取消点赞' : '点赞'} ({likeCount})</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full w-12 h-12 ${isFavorited ? 'text-yellow-500 border-yellow-500 hover:text-yellow-600 hover:border-yellow-600' : ''}`}
              onClick={handleFavorite}
              disabled={isLoadingFavorite}
            >
              <Bookmark className={`h-5 w-5 ${isFavorited ? 'fill-yellow-500' : ''}`} />
              <span className="sr-only">收藏</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isFavorited ? '取消收藏' : '收藏'} ({favoriteCount})</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
              <span className="sr-only">分享</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>分享文章</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
} 