import { Message } from '@prisma/client'

declare global {
  // 扩展 fetch Response 字段
  interface Response {
    code?: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any
    msg?: string
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObject = Record<string, any>

export interface PublishArticleInfo {
  id?: string
  title: string
  content: string
  classify: string
  coverImg: string
  summary: string
}

// =================================== 留言板 ===================================
export interface GuestbookMessage {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  author: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
  authorId: string;
}
