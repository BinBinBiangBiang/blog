import { NextResponse } from 'next/server'
import { prisma } from '@/prisma'
import { sendSubscriptionConfirmation } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { code: 1, msg: '请输入邮箱地址' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { code: 1, msg: '邮箱格式不正确' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已订阅
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email }
    })

    if (existingSubscriber) {
      if (existingSubscriber.deletedAt) {
        return NextResponse.json(
          { code: 1, msg: '该邮箱已订阅' },
          { status: 400 }
        )
      } else {
        // 如果之前取消订阅了，重新激活
        await prisma.subscriber.update({
          where: { email },
          data: { active: true }
        })
      }
    } else {
      // 创建新订阅
      await prisma.subscriber.create({
        data: { email }
      })
    }

    // 发送订阅确认邮件
    await sendSubscriptionConfirmation(email)

    return NextResponse.json({ code: 0, msg: '订阅成功' })
  } catch (error) {
    console.error('订阅处理出错:', error)
    return NextResponse.json(
      { code: 1, msg: '订阅失败，请稍后重试' },
      { status: 500 }
    )
  }
} 