import { sendJson } from '@/lib/utils'
import axios from 'axios'

export async function GET() {
  try {
    const userId = process.env.JUEJIN_USER_ID
    
    if (!userId) {
      return sendJson({ code: -1, msg: '掘金用户ID未配置' })
    }
    
    const response = await axios.get(
      `https://api.juejin.cn/user_api/v1/user/get?user_id=${userId}`
    )
    
    return sendJson({ data: response.data.data })
  } catch (error) {
    console.error('获取掘金用户信息失败:', error)
    return sendJson({ code: -1, msg: `获取掘金用户信息失败: ${error}` })
  }
}
