'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/hooks/use-toast'
import { Copy, Check, Trash2 } from 'lucide-react'

export default function JsonFormatter() {
  const [inputJson, setInputJson] = useState('')
  const [formattedJson, setFormattedJson] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const formatJson = () => {
    try {
      if (!inputJson.trim()) {
        setError('请输入需要格式化的JSON字符串')
        setFormattedJson('')
        return
      }

      // 解析和格式化JSON
      const parsedJson = JSON.parse(inputJson)
      const formatted = JSON.stringify(parsedJson, null, 2)
      setFormattedJson(formatted)
      setError('')
    } catch (err) {
      setError('无效的JSON格式: ' + (err instanceof Error ? err.message : String(err)))
      setFormattedJson('')
    }
  }

  const clearAll = () => {
    setInputJson('')
    setFormattedJson('')
    setError('')
  }

  const copyToClipboard = () => {
    if (!formattedJson) return
    
    navigator.clipboard.writeText(formattedJson)
      .then(() => {
        setCopied(true)
        toast({ title: '复制成功', description: 'JSON已复制到剪贴板' })
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {
        toast({ 
          title: '复制失败', 
          description: '无法复制到剪贴板',
          variant: 'destructive'
        })
      })
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">JSON格式化工具</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>输入JSON</CardTitle>
            <CardDescription>
              粘贴需要格式化的JSON字符串
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="在这里粘贴JSON..." 
              className="min-h-[300px] font-mono"
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
            />
            <div className="flex justify-between mt-4">
              <Button onClick={formatJson}>格式化</Button>
              <Button variant="outline" onClick={clearAll}>
                <Trash2 className="mr-2 h-4 w-4" />
                清空
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>格式化结果</CardTitle>
            <CardDescription>
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : "格式化后的JSON将显示在这里"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-md p-4 min-h-[300px] font-mono whitespace-pre overflow-auto">
              {formattedJson}
            </div>
            {formattedJson && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? '已复制' : '复制'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 