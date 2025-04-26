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
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href
      })
        .then(() => toast({ title: '分享成功', description: '文章链接已复制' }))
        .catch(() => {
          // 用户取消分享不需要提示错误
        })
    } else {
      // 如果不支持原生分享，则复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast({ title: '链接已复制', description: '可以分享给朋友了' }))
        .catch(() => toast({ 
          title: '复制失败', 
          description: '无法复制链接，请手动复制浏览器地址', 
          variant: 'destructive' 
        }))
    }
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