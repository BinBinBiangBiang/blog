import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    })
    console.log('邮件发送成功:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('邮件发送失败:', error)
    throw error
  }
}

// 发送新文章通知邮件
export async function sendNewArticleNotification(
  to: string,
  article: { title: string; description?: string | null; id: string },
  unsubscribeToken: string
) {
  const blogUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const articleUrl = `${blogUrl}/articles/${article.id}`
  const unsubscribeUrl = `${blogUrl}/api/subscribe/unsubscribe?token=${unsubscribeToken}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>新文章发布通知</h2>
      <p>您订阅的博客发布了新文章：</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">${article.title}</h3>
        ${article.description ? `<p style="margin: 0;">${article.description}</p>` : ''}
      </div>
      <p>
        <a href="${articleUrl}" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          阅读全文
        </a>
      </p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;" />
      <p style="color: #666; font-size: 12px;">
        如果您不想再收到此类通知，可以
        <a href="${unsubscribeUrl}" style="color: #666;">点击这里退订</a>
      </p>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `新文章：${article.title}`,
      html,
    })
    console.log(`向 ${to} 发送文章通知成功:`, info.messageId)
    return true
  } catch (error) {
    console.error(`向 ${to} 发送文章通知失败:`, error)
    return false
  }
}

// 发送订阅确认邮件
export async function sendSubscriptionConfirmation(to: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>订阅确认</h2>
      <p>感谢您订阅我的博客！</p>
      <p>您将在每次发布新文章时收到通知。</p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: '订阅确认',
      html,
    })
    return true
  } catch (error) {
    console.error('发送确认邮件失败:', error)
    return false
  }
} 