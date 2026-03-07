import { api } from './client'

export type ConversationUser = {
  id: number
  firstname: string
  lastname: string
  image: string | null
}

export type MessageItem = {
  id: number
  content: string
  sender_id: number
  receiver_id: number
  is_read: boolean
  created_at: string
  sender: ConversationUser
  receiver: ConversationUser
}

export type Conversation = {
  user: ConversationUser
  lastMessage: MessageItem
  unreadCount: number
}

export type ConversationDetail = {
  otherUser: ConversationUser
  messages: MessageItem[]
}

export const messagesApi = {
  getConversations: (): Promise<{ conversations: Conversation[] }> =>
    api.get('/api/messages'),

  getConversation: (userId: number): Promise<ConversationDetail> =>
    api.get(`/api/messages/${userId}`),

  sendMessage: (userId: number, content: string): Promise<{ message: MessageItem }> =>
    api.post(`/api/messages/${userId}`, { content }),
}
