import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import './styles/sf.css'
import './styles/base.css'
import './styles/themes/whatsapp/index.css'
import './styles/themes/imessage/index.css'
import './styles/sidebar.css'
import './styles/chat.css'
import './styles/animations.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChatProvider>
      <App />
    </ChatProvider>
  </StrictMode>,
)
