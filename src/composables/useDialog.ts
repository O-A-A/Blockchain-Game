import { ref } from 'vue'
export interface DialogMessage {
  title: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

// 全局共享的状态
const dialogMessage = ref<DialogMessage | null>(null)
const showDialog = ref(false)

export function useDialog() {
  const show = (message: DialogMessage) => {
    dialogMessage.value = message
    showDialog.value = true
    
    // 自动关闭
    const duration = message.duration || 3000
    setTimeout(() => {
      close()
    }, duration)
  }

  const close = () => {
    showDialog.value = false
    setTimeout(() => {
      dialogMessage.value = null
    }, 300)
  }

  const success = (title: string, message?: string) => {
    show({
      title,
      message: message || '',
      type: 'success'
    })
  }

  const error = (title: string, message?: string) => {
    show({
      title,
      message: message || '',
      type: 'error'
    })
  }

  const info = (title: string, message?: string) => {
    show({
      title,
      message: message || '',
      type: 'info'
    })
  }

  const warning = (title: string, message?: string) => {
    show({
      title,
      message: message || '',
      type: 'warning'
    })
  }

  return {
    dialogMessage,
    showDialog,
    show,
    close,
    success,
    error,
    info,
    warning
  }
}

