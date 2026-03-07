import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

type SocketStore = {
  socket: Socket | null
  connect: () => void
  disconnect: () => void
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  connect: () => {
    if (get().socket) return
    const socket = io({ withCredentials: true, transports: ['websocket'] })
    set({ socket })
  },
  disconnect: () => {
    get().socket?.disconnect()
    set({ socket: null })
  },
}))
