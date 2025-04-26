'use client'

import { useState } from 'react'
import { toast } from '@/components/hooks/use-toast'
import { PublishDialog } from '@/app/(base)/articles/PublishDialog'
import { useRouter } from 'next/navigation'
import { BytemdEditor } from '@/components/bytemd/editor'
import { useImmer } from 'use-immer'
import { PublishArticleInfo } from '@/types'
import { HeaderComponent } from '@/app/(base)/articles/Header'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

export default function PublishArticle() {
  const router = useRouter()

  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [articleInfo, updateArticleInfo] = useImmer<PublishArticleInfo>({
    id: '',
    title: '',
    content: '',
    classify: '',
    coverImg: '',
    summary: ''
  })

  const [publishDialogShow, setPublishDialogShow] = useState<boolean>(false)

  // 发布文章（包括草稿和正式发布）
  const handleSaveArticle = async (status: '00' | '01') => {
    if (!articleInfo.title) {
      toast({ title: '警告', description: '文章标题不能为空', variant: 'destructive' })
      return
    }

    if (!content) {
      toast({ title: '警告', description: '文章内容不能为空', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/articles/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          ...articleInfo, 
          content,
          status // 00=草稿，01=已发布
        })
      }).then((res) => res.json())

      if (res.code === 0) {
        const statusText = status === '00' ? '保存草稿' : '发布文章';
        toast({ title: '成功', description: `${statusText}成功!` })
        
        // 跳转到文章列表管理页面
        router.push('/articles/list')
      } else {
        toast({ 
          title: '失败', 
          description: '操作失败: ' + (res.msg || '未知错误'), 
          variant: 'destructive' 
        })
      }
    } catch (error) {
      toast({ 
        title: '失败', 
        description: '保存文章时出现错误', 
        variant: 'destructive' 
      })
    } finally {
      setIsSaving(false)
      if (status === '01') {
        setPublishDialogShow(false)
      }
    }
  }

  // 正式发布按钮触发
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

  // 保存草稿按钮点击
  const handleSaveDraft = () => {
    handleSaveArticle('00')
  }

  return (
    <div className="h-[100vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between border-b border-b-gray-200">
        <HeaderComponent
          title={articleInfo.title}
          updateArticleInfo={updateArticleInfo}
          setPublishDialogShow={setPublishDialogShow}
          butName="发布"
        />
        
        <Button 
          variant="outline" 
          onClick={handleSaveDraft}
          disabled={isSaving}
          className="flex items-center gap-1 mr-2"
        >
          <Save className="h-4 w-4" />
          保存草稿
        </Button>
      </div>

      <div className="flex-grow overflow-auto">
        <BytemdEditor content={content} setContent={setContent} />
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
