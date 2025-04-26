'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/hooks/use-toast'
import { useSession } from 'next-auth/react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface CommentAuthor {
  id: string
  name: string | null
  image: string | null
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: CommentAuthor
  authorId: string
}

interface CommentSectionProps {
  articleId: string
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [commentContent, setCommentContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 获取评论列表
  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/articles/comments?articleId=${articleId}`).then(res => res.json())
      if (res.code === 0) {
        setComments(res.data || [])
      } else {
        console.error('获取评论失败:', res.msg)
      }
    } catch (error) {
      console.error('获取评论失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 初始加载评论
  useEffect(() => {
    fetchComments()
  }, [articleId])

  // 提交评论
  const handleSubmitComment = async () => {
    if (!session) {
      toast({ 
        title: '提示', 
        description: '请先登录后再评论', 
        variant: 'default' 
      })
      return
    }

    if (!commentContent.trim()) {
      toast({ 
        title: '提示', 
        description: '评论内容不能为空', 
        variant: 'default' 
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/articles/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          articleId,
          content: commentContent
        })
      }).then(res => res.json())

      if (res.code === 0) {
        // 将新评论添加到列表顶部
        setComments(prev => [res.data, ...prev])
        setCommentContent('') // 清空输入框
        toast({ title: '成功', description: '评论已发布' })
      } else {
        toast({ 
          title: '评论失败', 
          description: res.msg || '发布评论失败', 
          variant: 'destructive' 
        })
      }
    } catch (error) {
      toast({ 
        title: '评论失败', 
        description: '发布评论时出错，请稍后再试', 
        variant: 'destructive' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 删除评论
  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch('/api/articles/comments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: commentId })
      }).then(res => res.json())

      if (res.code === 0) {
        // 从列表中移除已删除的评论
        setComments(prev => prev.filter(comment => comment.id !== commentId))
        toast({ title: '成功', description: '评论已删除' })
      } else {
        toast({ 
          title: '删除失败', 
          description: res.msg || '删除评论失败', 
          variant: 'destructive' 
        })
      }
    } catch (error) {
      toast({ 
        title: '删除失败', 
        description: '删除评论时出错，请稍后再试', 
        variant: 'destructive' 
      })
    }
  }

  // 格式化时间
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: zhCN
      })
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="mt-12 mb-8 max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 flex items-center">
        <MessageSquare className="mr-2 h-6 w-6" />
        评论 ({comments.length})
      </h3>
      
      <div className="mb-8">
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={session?.user?.image || ''} />
            <AvatarFallback>{session?.user?.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder={session ? "输入你的评论..." : "请先登录后再评论"}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="resize-none mb-2"
              rows={3}
              disabled={!session || isSubmitting}
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitComment} 
                disabled={!session || isSubmitting || !commentContent.trim()}
              >
                {isSubmitting ? '发布中...' : '发布评论'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />
      
      {isLoading ? (
        <div className="flex justify-center py-8 text-gray-500">加载评论中...</div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={comment.author.image || ''} />
                <AvatarFallback>{comment.author.name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{comment.author.name || '匿名用户'}</p>
                    <p className="text-sm text-gray-500">{formatTime(comment.createdAt)}</p>
                  </div>
                  
                  {(session?.user?.id === comment.authorId || session?.user?.role === '00') && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除</AlertDialogTitle>
                          <AlertDialogDescription>
                            确定要删除这条评论吗？此操作无法撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteComment(comment.id)}>
                            删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <div className="mt-2 text-gray-800 dark:text-gray-200">
                  {comment.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          暂无评论，成为第一个评论的人吧！
        </div>
      )}
    </div>
  )
} 