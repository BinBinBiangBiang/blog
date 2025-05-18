'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/hooks/use-toast'
import { Download, RefreshCw } from 'lucide-react'
import Script from 'next/script'

// 为QRCode库声明全局类型
declare global {
  interface Window {
    QRCode: any;
  }
}

export default function QRGenerator() {
  const [text, setText] = useState('')
  const [qrSize, setQrSize] = useState('200')
  const [qrColor, setQrColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('text')
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [qrImage, setQrImage] = useState<string | null>(null)
  
  const qrContainerRef = useRef<HTMLDivElement>(null)

  const generateQRCode = () => {
    if (!text.trim()) {
      toast({ 
        title: '请输入内容', 
        description: '请输入需要生成二维码的文本或URL',
        variant: 'destructive'
      })
      return
    }

    if (!scriptLoaded || !window.QRCode) {
      toast({ 
        title: '加载中', 
        description: '二维码生成库正在加载，请稍后再试',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      // 创建临时容器
      const tempContainer = document.createElement('div')
      document.body.appendChild(tempContainer)
      
      // 在临时容器中创建QR码
      new window.QRCode(tempContainer, {
        text: text,
        width: parseInt(qrSize),
        height: parseInt(qrSize),
        colorDark: qrColor,
        colorLight: bgColor,
        correctLevel: window.QRCode.CorrectLevel.H
      })
      
      // 获取生成的Canvas并转换为图片URL
      const canvas = tempContainer.querySelector('canvas')
      if (canvas) {
        const imageUrl = canvas.toDataURL('image/png')
        setQrImage(imageUrl)
      }
      
      // 清理临时容器
      document.body.removeChild(tempContainer)
      
      setLoading(false)
    } catch (error) {
      console.error('生成二维码出错:', error)
      toast({ 
        title: '生成失败', 
        description: '生成二维码时出错，请重试',
        variant: 'destructive'
      })
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!qrImage) {
      toast({ 
        title: '无法下载', 
        description: '请先生成二维码',
        variant: 'destructive'
      })
      return
    }

    try {
      // 创建下载链接
      const link = document.createElement('a')
      link.download = `qrcode-${Date.now()}.png`
      link.href = qrImage
      link.click()

      toast({ 
        title: '下载成功', 
        description: '二维码已保存到您的设备'
      })
    } catch (error) {
      console.error('下载二维码出错:', error)
      toast({ 
        title: '下载失败', 
        description: '下载二维码时出错，请重试',
        variant: 'destructive'
      })
    }
  }

  // 重置生成的二维码
  const resetQRCode = () => {
    setQrImage(null)
  }

  // 当输入参数变化时重置二维码
  useEffect(() => {
    resetQRCode()
  }, [text, qrSize, qrColor, bgColor])

  return (
    <div className="container py-6">
      <Script 
        src="https://cdn.bootcdn.net/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"
        onLoad={() => setScriptLoaded(true)}
        strategy="afterInteractive"
      />

      <h1 className="text-2xl font-bold mb-6">二维码生成工具</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>生成二维码</CardTitle>
            <CardDescription>
              输入文本或URL生成二维码
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="text" value={tab} onValueChange={(value) => {
              setTab(value);
              resetQRCode();
            }} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">文本</TabsTrigger>
                <TabsTrigger value="url">网址</TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="text-input">文本内容</Label>
                  <Input
                    id="text-input"
                    placeholder="输入要转换为二维码的文本..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
              </TabsContent>
              <TabsContent value="url">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="url-input">网址</Label>
                  <Input
                    id="url-input"
                    placeholder="输入要转换为二维码的URL..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    type="url"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="qr-size">二维码尺寸</Label>
                <Select value={qrSize} onValueChange={setQrSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择尺寸" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100x100</SelectItem>
                    <SelectItem value="200">200x200</SelectItem>
                    <SelectItem value="300">300x300</SelectItem>
                    <SelectItem value="400">400x400</SelectItem>
                    <SelectItem value="500">500x500</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="qr-color">二维码颜色</Label>
                <div className="flex">
                  <Input
                    id="qr-color"
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="w-12 p-1 border-0"
                  />
                  <Input
                    type="text"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="flex-1 ml-2"
                  />
                </div>
              </div>
            </div>

            <div className="grid w-full items-center gap-1.5 mb-6">
              <Label htmlFor="bg-color">背景颜色</Label>
              <div className="flex">
                <Input
                  id="bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 p-1 border-0"
                />
                <Input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 ml-2"
                />
              </div>
            </div>

            <Button onClick={generateQRCode} disabled={loading || !scriptLoaded}>
              {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              生成二维码
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>二维码预览</CardTitle>
            <CardDescription>
              生成的二维码将显示在这里
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-md shadow mb-4 flex items-center justify-center w-full" style={{ minHeight: '200px' }}>
              {qrImage ? (
                <img 
                  src={qrImage} 
                  alt="生成的二维码" 
                  className="max-w-full" 
                />
              ) : (
                <div className="text-muted-foreground">
                  {!scriptLoaded ? "正在加载二维码生成库..." : "二维码将在这里显示"}
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={handleDownload}
              disabled={!qrImage}
            >
              <Download className="mr-2 h-4 w-4" />
              下载二维码
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 