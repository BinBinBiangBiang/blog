'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Edit, Trash2, Eye, Plus, FileEdit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { toast } from '@/components/hooks/use-toast'
import { useSession } from 'next-auth/react'

const STATUS_MAP = {
  '00': { label: '草稿', color: 'text-yellow-500' },
  '01': { label: '已发布', color: 'text-green-500' },
}

const SOURCE_MAP = {
  '00': '博客原创',
  '01': '掘金同步',
}

interface Article {
  id: string
  title: string
  status: string
  source: string
  classify?: string
  createdAt: string
  updatedAt?: string
}

export default function ArticlesList() {
  const { data: session } = useSession()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [classifyFilter, setClassifyFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [totalArticles, setTotalArticles] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10

  // 获取文章列表
  const fetchArticles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        searchTerm,
        status: statusFilter !== 'all' ? statusFilter : '',
        classify: classifyFilter !== 'all' ? classifyFilter : '',
        source: sourceFilter !== 'all' ? sourceFilter : '',
      })
      
      const res = await fetch(`/api/articles/list?${params}`).then(res => res.json())
      
      if (res.code === 0) {
        setArticles(res.data.articles)
        setTotalArticles(res.data.totalArticles)
        setTotalPages(res.data.totalPages)
      } else {
        toast({ 
          title: '获取失败', 
          description: res.msg || '获取文章列表失败', 
          variant: 'destructive' 
        })
      }
    } catch (error) {
      toast({ 
        title: '获取失败', 
        description: '获取文章列表时出错', 
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
    }
  }

  // 删除文章
  const handleDeleteArticle = async (id: string) => {
    try {
      const res = await fetch('/api/articles/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      }).then(res => res.json())

      if (res.code === 0) {
        toast({ title: '成功', description: '文章已成功删除' })
        fetchArticles() // 重新获取列表
      } else {
        toast({ 
          title: '删除失败', 
          description: res.msg || '删除文章失败', 
          variant: 'destructive' 
        })
      }
    } catch (error) {
      toast({ 
        title: '删除失败', 
        description: '删除文章时出错', 
        variant: 'destructive' 
      })
    }
  }

  // 更新文章状态
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/articles/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status })
      }).then(res => res.json())

      if (res.code === 0) {
        toast({ title: '成功', description: '文章状态已更新' })
        fetchArticles() // 重新获取列表
      } else {
        toast({ 
          title: '更新失败', 
          description: res.msg || '更新文章状态失败', 
          variant: 'destructive' 
        })
      }
    } catch (error) {
      toast({ 
        title: '更新失败', 
        description: '更新文章状态时出错', 
        variant: 'destructive' 
      })
    }
  }

  // 初始加载和条件变化时获取数据
  useEffect(() => {
    fetchArticles()
  }, [currentPage, statusFilter, classifyFilter, sourceFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // 重置到第一页
    fetchArticles()
  }

  // 分页导航
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">文章管理</h1>
        {session?.user?.role === '00' && (
          <Link href="/articles/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新建文章
            </Button>
          </Link>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>筛选</CardTitle>
          <CardDescription>
            查找和筛选你的文章
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="search">搜索标题</Label>
              <Input
                id="search"
                placeholder="搜索文章标题..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid max-w-sm items-center gap-1.5">
              <Label htmlFor="status">状态</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="00">草稿</SelectItem>
                  <SelectItem value="01">已发布</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid max-w-sm items-center gap-1.5">
              <Label htmlFor="classify">分类</Label>
              <Select
                value={classifyFilter}
                onValueChange={setClassifyFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  <SelectItem value="前端">前端</SelectItem>
                  <SelectItem value="后端">后端</SelectItem>
                  <SelectItem value="数据库">数据库</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid max-w-sm items-center gap-1.5">
              <Label htmlFor="source">来源</Label>
              <Select
                value={sourceFilter}
                onValueChange={setSourceFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择来源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部来源</SelectItem>
                  <SelectItem value="00">博客原创</SelectItem>
                  <SelectItem value="01">掘金同步</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">搜索</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-8">正在加载...</div>
          ) : articles.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标题</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>来源</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell>{article.classify || '-'}</TableCell>
                      <TableCell>
                        <span className={STATUS_MAP[article.status as keyof typeof STATUS_MAP]?.color || 'text-gray-500'}>
                          {STATUS_MAP[article.status as keyof typeof STATUS_MAP]?.label || article.status}
                        </span>
                      </TableCell>
                      <TableCell>{SOURCE_MAP[article.source as keyof typeof SOURCE_MAP] || article.source}</TableCell>
                      <TableCell>{new Date(article.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            asChild
                          >
                            <Link 
                              href={article.source === '01' ? `https://juejin.cn/post/${article.id}` : `/articles/${article.id}`} 
                              target="_blank"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          
                          {session?.user?.role === '00' && article.source === '00' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="icon"
                                asChild
                              >
                                <Link href={`/articles/edit/${article.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              
                              {article.status === '00' ? (
                                <Button 
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleUpdateStatus(article.id, '01')}
                                >
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleUpdateStatus(article.id, '00')}
                                >
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      确定要删除文章 "{article.title}" 吗？此操作无法撤销。
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteArticle(article.id)}>
                                      删除
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* 分页 */}
              <div className="flex items-center justify-between space-x-6 mt-6">
                <div className="text-sm text-muted-foreground">
                  共 {totalArticles} 篇文章，第 {currentPage} / {totalPages} 页
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">没有找到文章</p>
              {session?.user?.role === '00' && (
                <Link href="/articles/add">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    新建文章
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 