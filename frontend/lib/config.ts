export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    timeout: 30000,
  },
  websocket: {
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
    reconnectAttempts: 5,
    reconnectInterval: 5000,
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Stock Management',
    version: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
  }
}
