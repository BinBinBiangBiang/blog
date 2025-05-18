'use client'

import { useEffect, useState, use } from 'react'
import { toast } from '@/components/hooks/use-toast'
import { PublishDialog } from '@/app/(base)/articles/PublishDialog'
import { useRouter } from 'next/navigation'
import { BytemdEditor } from '@/components/bytemd/editor'
import { useImmer } from 'use-immer'
import { PublishArticleInfo } from '@/types'
import { HeaderComponent } from '@/app/(base)/articles/Header'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

export default function EditArticle(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [articleStatus, setArticleStatus] = useState<string>('01') // 默认为已发布状态

  const [articleInfo, updateArticleInfo] = useImmer<PublishArticleInfo>({
    id: params.id,
    title: '',
    content: '',
    classify: '',
    coverImg: '',
    summary: ''
  })

  useEffect(() => {
    async function getData() {
      const res = await fetch(`/api/articles/details?id=${params.id}`).then((res) => res.json())

      if (res.code !== 0) {
        toast({ variant: 'destructive', title: '警告', description: '获取文章详情失败!' })
        return
      }

      updateArticleInfo((draft) => {
        draft.title = res.data.title || ''
        draft.classify = res.data.classify || ''
        draft.coverImg = res.data.coverImg || ''
        draft.summary = res.data.summary || ''
      })

      // 保存当前文章状态
      setArticleStatus(res.data.status || '01')
      setContent(res.data.content)
    }
    getData()
  }, [params.id, updateArticleInfo])

  const router = useRouter()

  const [publishDialogShow, setPublishDialogShow] = useState<boolean>(false)

  // 发送通知给订阅者
  const sendNotificationToSubscribers = async (articleId: string) => {
    try {
      const res = await fetch('/api/articles/sendNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ articleId })
      }).then(res => res.json())

      if (res.code === 0) {
        toast({ 
          title: '通知发送成功', 
          description: `已向${res.data.sentCount}位订阅者发送通知` 
        })
      } else {
        console.error('发送通知失败:', res.msg)
      }
    } catch (error) {
      console.error('发送通知出错:', error)
    }
  }

  // 更新文章（无论是草稿还是发布状态）
  const handleSaveArticle = async (status?: string) => {
    if (!articleInfo.title) {
      toast({ title: '警告', description: '文章标题不能为空', variant: 'destructive' })
      return
    }

    if (!content) {
      toast({ title: '警告', description: '文章内容不能为空', variant: 'destructive' })
      return
    }

    // 使用传入的状态或保持当前状态不变
    const newStatus = status || articleStatus
    const wasPublished = articleStatus === '01'
    const willBePublished = newStatus === '01'

    setIsSaving(true)
    try {
      const res = await fetch('/api/articles/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...articleInfo, content, status: newStatus })
      }).then((res) => res.json())

      if (res.code === 0) {
        const actionText = status === '00' ? '保存为草稿' : (status === '01' ? '发布' : '更新');
        toast({ title: '成功', description: `文章已${actionText}!` })
        
        // 如果文章状态从非发布变为发布，发送邮件通知
        if (!wasPublished && willBePublished) {
          await sendNotificationToSubscribers(articleInfo.id)
        }
        
        router.push('/articles/list')
      } else {
        toast({ 
          title: '失败', 
          description: '编辑文章时出现错误: ' + (res.msg || '未知错误'), 
          variant: 'destructive' 
        })
      }
    } catch (error) {
      toast({ 
        title: '失败', 
        description: '编辑文章时出现错误', 
        variant: 'destructive' 
      })
    } finally {
      setIsSaving(false)
      if (status === '01') {
        setPublishDialogShow(false)
      }
    }
  }

  // 发布草稿文章
  const handlePublish = () => {
    if (!articleInfo.classify) {
      toast({ variant: 'destructive', title: '警告', description: '请在发布窗口中选择文章分类' })
      return setPublishDialogShow(true)
    }

    if (!articleInfo.summary?.trim()) {
      toast({ variant: 'destructive', title: '警告', description: '请在发布窗口中填写文章摘要' })
      return setPublishDialogShow(true)
    }

    handleSaveArticle('01')
  }

  // 保存为草稿
  const handleSaveAsDraft = () => {
    handleSaveArticle('00')
  }

  // 保存当前编辑
  const handleSaveChanges = () => {
    handleSaveArticle()
  }

  return (
    <div className="h-[100vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between border-b border-b-gray-200">
        <HeaderComponent
          title={articleInfo.title}
          updateArticleInfo={updateArticleInfo}
          setPublishDialogShow={setPublishDialogShow}
          butName={articleStatus === '00' ? '发布' : '更新'}
        />
        
        <div className="flex gap-2 mr-2">
          {articleStatus === '01' && (
            <Button 
              variant="outline" 
              onClick={handleSaveAsDraft}
              disabled={isSaving}
              className="flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              保存为草稿
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            保存更改
          </Button>
        </div>
      </div>

      <div className="flex-grow overflow-auto">
        <BytemdEditor content={content} setContent={(val) => setContent(val)} />
      </div>

      <PublishDialog
        articleInfo={articleInfo}
        updateArticleInfo={updateArticleInfo}
        isOpen={publishDialogShow}
        onClose={() => setPublishDialogShow(false)}
        onPublish={handlePublish}
      />
    </div>
  )
}
