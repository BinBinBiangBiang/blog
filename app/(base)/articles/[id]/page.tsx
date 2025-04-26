'use client'

import { useEffect, useState, use } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/components/hooks/use-toast'
import { getReadingTime } from '@/lib/getReadingTime'
import { Anchor } from './anchor/index'
import { Article } from '@/types/juejin'
import { BytemdViewer } from '@/components/bytemd/viewer'
import { Icon } from '@iconify/react'
import { ArticleInteractions } from './ArticleInteractions'
import { CommentSection } from './CommentSection'

export default function Component(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const [article, setArticle] = useState<Article>()
  const [readingTime, setReadingTime] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchArticleDetails() {
      const res = await fetch(`/api/articles/details?id=${params.id}`).then((res) => res.json())
      if (res.code !== 0) {
        toast({ variant: 'destructive', title: '警告', description: '获取文章详情失败!' })
        return null
      }
      return res.data
    }

    async function getData() {
      setIsLoading(true)
      try {
        const articleData = await fetchArticleDetails()
        if (!articleData) return

        setArticle(articleData)
        setReadingTime(getReadingTime(articleData.content).minutes)
      } catch (error) {
        console.error('获取文章详情失败:', error)
        toast({ variant: 'destructive', title: '警告', description: '获取文章详情失败!' })
      } finally {
        setIsLoading(false)
      }
    }

    getData()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto my-10 text-center">
        <p className="text-gray-500">正在加载文章内容...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto my-10 text-center">
        <h2 className="text-xl font-bold text-red-500">文章不存在或已被删除</h2>
        <p className="mt-2 text-gray-500">请检查链接是否正确，或返回首页查看其他文章</p>
      </div>
    );
  }

  return (
    <div className="relative max-w-4xl mx-auto my-2">
      <div className="space-y-4 border-b pb-4">
        <h1 className="text-2xl font-bold">{article.title}</h1>
        <div className="text-gray-500 flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <Icon icon="ri:time-line" className="mr-1" /> 阅读时间: {readingTime} 分钟
          </div>
          <div className="flex items-center">
            <Icon icon="ri:calendar-line" className="mr-1" /> 发布时间: {new Date(article.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <Icon icon="ri:eye-line" className="mr-1" /> 阅读: {article.views}
          </div>
          <div className="flex items-center">
            <Icon icon="ri:file-list-line" className="mr-1" /> 分类: {article.classify || '未分类'}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-4 bg-black/10 dark:bg-white/10 p-2 rounded-md">
          <h2 className="text-lg mb-2 text-gray-600 dark:text-gray-300">导读:</h2>
          <p className="text-gray-500 dark:text-gray-400">{article.summary}</p>
        </div>

        <BytemdViewer content={article.content ?? ''} />
      </div>

      {/* 文章交互组件 */}
      <ArticleInteractions articleId={article.id} />

      {/* 文章评论区 */}
      <CommentSection articleId={article.id} />

      <Card className="absolute -right-64 top-0 w-64 hidden xl:block">
        <CardContent className="p-2">
          <h3 className="text-lg font-semibold mb-4">章节</h3>
          <Anchor content={article.content || ''}></Anchor>
        </CardContent>
      </Card>
    </div>
  )
}
