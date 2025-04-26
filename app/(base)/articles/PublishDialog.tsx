'use client'

import { ChangeEvent, memo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/hooks/use-toast'
import { PublishArticleInfo } from '@/types'
import { Updater } from 'use-immer'
import Image from 'next/image'
import { imagekitUploadFile } from '@/lib/imagekit'
import { Loader2 } from 'lucide-react'

const CATEGORIES = ['后端', '前端', 'Android', 'iOS', '人工智能', '阅读'] as const
type Category = (typeof CATEGORIES)[number]

interface ImageUploadProps {
  coverImg?: string
  onImageUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  isUploading: boolean
}

const ImageUpload = memo(({ coverImg, onImageUpload, isUploading }: ImageUploadProps) => (
  <div className="grid gap-2">
    <Label htmlFor="cover">文章封面:</Label>
    <div className="flex items-center justify-between border border-input rounded p-1 cursor-pointer overflow-hidden">
      <div className="w-[192px] h-[128px] border border-dashed rounded overflow-hidden flex items-center justify-center">
        {coverImg ? (
          <Image
            src={coverImg}
            alt="Cover"
            width={192}
            height={128}
            className="max-w-full h-auto"
            priority
          />
        ) : (
          <span className="text-muted-foreground text-sm">未设置封面图</span>
        )}
      </div>

      <div className="p-4 w-[200px] text-center">
        <label htmlFor="coverImgInput" className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
          <div>
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            ) : (
              <span className="block text-2xl mb-2">+</span>
            )}
            <span>{isUploading ? '正在上传...' : '点击添加封面'}</span>
          </div>
          <input
            id="coverImgInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageUpload}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
    <p className="text-sm text-gray-500 mt-1">建议尺寸: 192*128px (封面仅展示在首页信息流中)</p>
  </div>
))

// 当使用 React DevTools 调试应用时，它会显示组件的名称
// 当组件发生错误时，React 会在错误信息中包含组件名
ImageUpload.displayName = 'ImageUpload'

interface CategorySelectorProps {
  selectedCategory?: Category
  onCategorySelect: (category: Category) => void
}

const CategorySelector = memo(({ selectedCategory, onCategorySelect }: CategorySelectorProps) => (
  <div className="grid gap-2">
    <Label htmlFor="category">
      分类<span className="text-red-500">*</span>:
    </Label>
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <Button
          key={cat}
          variant={selectedCategory === cat ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategorySelect(cat)}
        >
          {cat}
        </Button>
      ))}
    </div>
  </div>
))

CategorySelector.displayName = 'CategorySelector'

interface PublishDialogProps {
  isOpen: boolean
  articleInfo: PublishArticleInfo
  updateArticleInfo: Updater<PublishArticleInfo>
  onClose: () => void
  onPublish: () => void
}

export function PublishDialog({
  isOpen,
  articleInfo,
  updateArticleInfo,
  onClose,
  onPublish
}: PublishDialogProps) {
  const [isUploading, setIsUploading] = useState(false)

  const validateForm = (): boolean => {
    if (!articleInfo.classify) {
      toast({ variant: 'destructive', title: '警告', description: '文章分类不能为空' })
      return false
    }

    if (!articleInfo.summary?.trim()) {
      toast({ variant: 'destructive', title: '警告', description: '文章简介不能为空' })
      return false
    }

    return true
  }

  const handlePublish = () => {
    if (validateForm()) {
      onPublish()
    }
  }

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      setIsUploading(true)
      const res = await imagekitUploadFile({ file, fileName: file.name })

      if (res?.code === 0 && res.data?.url) {
        updateArticleInfo((draft) => {
          draft.coverImg = res.data.url ?? ''
        })
        toast({
          title: '成功',
          description: '封面图片已上传'
        })
      } else {
        toast({
          variant: 'destructive',
          title: '警告',
          description: '图片上传失败了!'
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '警告',
        description: '图片上传失败，似乎遇到了一些什么问题!'
      })
    } finally {
      setIsUploading(false)
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const handleCategorySelect = (category: Category) => {
    updateArticleInfo((draft) => {
      draft.classify = category
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>发布文章</DialogTitle>
          <DialogDescription>请填写文章的必要信息以完成发布</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <CategorySelector
            selectedCategory={articleInfo.classify as Category}
            onCategorySelect={handleCategorySelect}
          />
          <ImageUpload 
            coverImg={articleInfo.coverImg} 
            onImageUpload={handleImageUpload} 
            isUploading={isUploading}
          />
          <div className="grid gap-2">
            <Label htmlFor="summary">
              文章摘要<span className="text-red-500">*</span>:
            </Label>
            <Textarea
              id="summary"
              value={articleInfo.summary}
              onChange={(e) =>
                updateArticleInfo((draft) => {
                  draft.summary = e.target.value
                })
              }
              placeholder="请输入文章摘要，简要描述文章内容"
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              摘要会显示在文章列表中，帮助读者了解文章内容
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handlePublish}>确定并发布</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
