import React, { useState, useRef, useEffect } from 'react'

const App = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to ChatterSphere! ⚡ Where conversations spark and connections thrive! 🌟",
      sender: "System",
      timestamp: new Date(),
      isSystem: true,
      reactions: {},
      status: 'delivered'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [username, setUsername] = useState('')
  const [isUsernameSet, setIsUsernameSet] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [onlineUsers] = useState(['You', 'Alice', 'Bob', 'Charlie'])
  const [selectedAvatar, setSelectedAvatar] = useState('😊')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [userStatus, setUserStatus] = useState('online')
  const [theme, setTheme] = useState('blue')
  const [fontSize, setFontSize] = useState('medium')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [lastSeen, setLastSeen] = useState(new Date())
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Sound notification function
  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIcBjaHzPLNfS4HI3TC7+OZRA4QU6nm9a5gGAU9o+bv4qhyH0s9hs3z0oQ+CRdGmt/z1IY9BhJCjdb0')
    audio.play().catch(e => console.log('Could not play sound'))
  }

  // Format timestamp
  const formatTimestamp = (date) => {
    const now = new Date()
    const messageDate = new Date(date)
    const diffMs = now - messageDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return messageDate.toLocaleDateString()
  }

  // Filter messages based on search term
  const filteredMessages = messages.filter(message =>
    message.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Add reaction to message
  const addReaction = (messageId, emoji) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions }
        if (reactions[emoji]) {
          reactions[emoji] = reactions[emoji].includes(username)
            ? reactions[emoji].filter(u => u !== username)
            : [...reactions[emoji], username]
        } else {
          reactions[emoji] = [username]
        }
        if (reactions[emoji].length === 0) delete reactions[emoji]
        return { ...msg, reactions }
      }
      return msg
    }))
  }

  // Simulate typing indicator
  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    setIsTyping(true)
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  // Avatar options
  const avatarOptions = ['😊', '😎', '🤖', '🦄', '🐱', '🐶', '🦊', '🐻', '🐼', '🦁']
  
  // Emoji picker options
  const quickEmojis = ['😀', '😂', '😍', '🤔', '😎', '🔥', '👍', '❤️', '⚡', '🎉', '💯', '🌟']
  
  // Theme colors
  const themes = {
    blue: 'from-blue-500 to-purple-600',
    green: 'from-green-500 to-teal-600',
    orange: 'from-orange-500 to-red-600',
    pink: 'from-pink-500 to-rose-600',
    purple: 'from-purple-500 to-indigo-600'
  }
  
  // Font sizes
  const fontSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }
  
  // Status options
  const statusOptions = ['online', 'away', 'busy', 'invisible']
  
  // File upload handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newMessage = {
          id: Date.now(),
          text: `📎 Shared a file: ${file.name}`,
          sender: username,
          timestamp: new Date(),
          isSystem: false,
          reactions: {},
          status: 'sending',
          avatar: selectedAvatar,
          fileData: e.target.result,
          fileName: file.name,
          fileType: file.type
        }
        setMessages(prev => [...prev, newMessage])
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
          ))
          if (soundEnabled) playNotificationSound()
        }, 500)
      }
      reader.readAsDataURL(file)
    }
  }
  
  // Export chat history
  const exportChatHistory = () => {
    const chatData = {
      username,
      messages: messages.filter(msg => !msg.isSystem),
      exportDate: new Date(),
      messageCount: messageCount
    }
    const dataStr = JSON.stringify(chatData, null, 2)
    const dataBlob = new Blob([dataStr], {type: 'application/json'})
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ChatterSphere_${username}_${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (inputValue.trim() === '') return

    const newMessage = {
      id: Date.now(),
      text: inputValue,
      sender: username,
      timestamp: new Date(),
      isSystem: false,
      reactions: {},
      status: 'sending',
      avatar: selectedAvatar
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    setIsTyping(false)
    setMessageCount(prev => prev + 1)
    
    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      ))
      if (soundEnabled) playNotificationSound()
    }, 500)

    // Simulate bot responses with 80% chance
    if (Math.random() > 0.2) {
      setTimeout(() => {
        const responses = [
          "That's electrifying! ⚡",
          "Love the energy here! 🌟",
          "ChatterSphere vibes! ✨",
          "This conversation is sparking! 🔥",
          "Amazing connection! 💫",
          "The sphere is buzzing! 🎆",
          "Brilliant thoughts! 💡",
          "Conversation goals! 🎯",
          "Great point! 👍",
          "I totally agree! ✨",
          "Interesting perspective! 🤔",
          "Thanks for sharing! 🙏",
          "That made me smile! 😊",
          "Absolutely right! 💯",
          "Nice one! 🚀",
          "Keep it going! 💬",
          "So cool! 😎",
          "Mind blown! 🤯",
          "Love this chat! ❤️",
          "You're on fire! 🔥"
        ]
        const randomUser = ['Alice', 'Bob', 'Charlie'][Math.floor(Math.random() * 3)]
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        
        const botMessage = {
          id: Date.now() + Math.random(),
          text: randomResponse,
          sender: randomUser,
          timestamp: new Date(),
          isSystem: false,
          reactions: {},
          status: 'delivered',
          avatar: avatarOptions[Math.floor(Math.random() * avatarOptions.length)]
        }
        
        setMessages(prev => [...prev, botMessage])
        if (soundEnabled) playNotificationSound()
      }, 800 + Math.random() * 1500)
    }
  }

  const handleUsernameSubmit = (e) => {
    e.preventDefault()
    if (username.trim() === '') return
    setIsUsernameSet(true)
  }

  if (!isUsernameSet) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-500 to-purple-600'} flex items-center justify-center p-4 transition-all duration-300`}>
        <div className={`${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-xl shadow-2xl p-8 w-full max-w-md transform hover:scale-105 transition-all duration-300`}>
          <div className="text-center mb-6">
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
              ⚡ ChatterSphere
            </h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Where conversations come alive
            </p>
          </div>
          
          <form onSubmit={handleUsernameSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Choose your username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-3 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200`}
                placeholder="Enter your username..."
                maxLength={20}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Choose your avatar
              </label>
              <div className="grid grid-cols-5 gap-2">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`p-2 text-xl rounded-lg transition-all duration-200 ${
                      selectedAvatar === avatar
                        ? 'bg-blue-500 text-white scale-110'
                        : darkMode
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🚀 Join Chat
            </button>
          </form>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`mt-4 w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-sm py-2 px-4 rounded-lg transition-all duration-200`}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-all duration-300`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg border-b backdrop-blur-lg bg-opacity-95 sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} bg-gradient-to-r ${themes[theme]} bg-clip-text text-transparent`}>
                ⚡ ChatterSphere
              </h1>
              
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {onlineUsers.length} online
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Stats */}
              <div className="hidden md:flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                <span>💬 {messageCount}</span>
                <span>👥 {onlineUsers.length}</span>
              </div>
              
              {/* Search Button */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-all duration-200 text-sm sm:text-base`}
                title="Search messages"
              >
                🔍
              </button>
              
              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-all duration-200 text-sm sm:text-base`}
                title="Settings"
              >
                ⚙️
              </button>
              
              {/* User Profile */}
              <button
                onClick={() => setShowUserProfile(!showUserProfile)}
                className="flex items-center space-x-1 sm:space-x-2 bg-blue-100 dark:bg-blue-900 px-2 sm:px-3 py-1 rounded-full hover:scale-105 transition-all duration-200"
                title="User profile"
              >
                <span className="text-sm sm:text-xl">{selectedAvatar}</span>
                <span className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-600'} hidden sm:inline`}>
                  {username}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  userStatus === 'online' ? 'bg-green-500' :
                  userStatus === 'away' ? 'bg-yellow-500' :
                  userStatus === 'busy' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          {showSearch && (
            <div className="mt-3 animate-fadeIn">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search messages and users..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'} border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200`}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  🔍
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-2 sm:p-4 flex gap-2 sm:gap-4 relative">
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>⚙️ Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Theme Selection */}
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    🎨 Theme Color
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.keys(themes).map((themeKey) => (
                      <button
                        key={themeKey}
                        onClick={() => setTheme(themeKey)}
                        className={`h-8 rounded-lg bg-gradient-to-r ${themes[themeKey]} ${theme === themeKey ? 'ring-2 ring-gray-400' : ''}`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Font Size */}
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    📝 Font Size
                  </label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} border focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                
                {/* Status */}
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    🟢 Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => setUserStatus(status)}
                        className={`p-2 rounded-lg text-sm capitalize ${
                          userStatus === status
                            ? 'bg-blue-500 text-white'
                            : darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>🔊 Sound Notifications</span>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`w-12 h-6 rounded-full ${soundEnabled ? 'bg-blue-500' : 'bg-gray-300'} relative transition-colors`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>🌙 Dark Mode</span>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-12 h-6 rounded-full ${darkMode ? 'bg-blue-500' : 'bg-gray-300'} relative transition-colors`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={exportChatHistory}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    📥 Export Chat History
                  </button>
                  <button
                    onClick={() => {
                      setIsUsernameSet(false)
                      setUsername('')
                      setMessages([{
                        id: 1,
                        text: "Welcome to ChatterSphere! ⚡ Where conversations spark and connections thrive! 🌟",
                        sender: "System",
                        timestamp: new Date(),
                        isSystem: true,
                        reactions: {},
                        status: 'delivered'
                      }])
                      setMessageCount(0)
                      setShowSettings(false)
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    🚪 Switch User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Profile Modal */}
        {showUserProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-6 w-full max-w-sm`}>
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedAvatar}</div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>{username}</h3>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 capitalize`}>
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    userStatus === 'online' ? 'bg-green-500' :
                    userStatus === 'away' ? 'bg-yellow-500' :
                    userStatus === 'busy' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></span>
                  {userStatus}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                  Joined: {new Date().toLocaleDateString()}<br/>
                  Messages: {messageCount}<br/>
                  Last seen: {formatTimestamp(lastSeen)}
                </div>
                <button
                  onClick={() => setShowUserProfile(false)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Online Users Sidebar */}
        <div className={`${sidebarCollapsed ? 'hidden' : 'block'} lg:block w-full lg:w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 h-fit mb-4 lg:mb-0`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-base lg:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              🟢 Online Users
            </h3>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            {onlineUsers.map((user, index) => (
              <div key={user} className={`flex items-center space-x-3 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200 cursor-pointer`}>
                <div className={`w-2 h-2 rounded-full ${
                  index === 0 ? (userStatus === 'online' ? 'bg-green-500' : userStatus === 'away' ? 'bg-yellow-500' : userStatus === 'busy' ? 'bg-red-500' : 'bg-gray-500') : 'bg-green-500'
                }`}></div>
                <span className="text-lg">{avatarOptions[index]}</span>
                <div className="flex-1">
                  <div className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {user === 'You' ? `${username} (You)` : user}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {index === 0 ? userStatus : 'online'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Container */}
        <div className={`flex-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] flex flex-col`}>
          
          {/* Messages Area */}
          <div className={`flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 ${fontSizes[fontSize]}`}>
            {(searchTerm ? filteredMessages : messages).map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === username ? 'justify-end' : 'justify-start'} group animate-slideIn`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 sm:px-6 py-3 rounded-2xl relative ${
                    message.isSystem
                      ? darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                      : message.sender === username
                      ? `bg-gradient-to-r ${themes[theme]} text-white`
                      : darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                  } shadow-lg transform hover:scale-105 transition-all duration-200 message-bubble`}
                >
                  {!message.isSystem && (
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{message.avatar || '😊'}</span>
                      <span className="text-xs opacity-75 font-medium">
                        {message.sender}
                      </span>
                      {message.status === 'sending' && (
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-sm leading-relaxed break-words">{message.text}</div>
                  
                  {/* File preview */}
                  {message.fileData && (
                    <div className="mt-2 p-2 bg-black bg-opacity-20 rounded-lg">
                      {message.fileType?.startsWith('image/') ? (
                        <img src={message.fileData} alt={message.fileName} className="max-w-full h-auto rounded" />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>📎</span>
                          <span className="text-xs">{message.fileName}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs opacity-75">
                      {formatTimestamp(message.timestamp)}
                    </div>
                    {message.status === 'delivered' && message.sender === username && (
                      <div className="text-xs opacity-75">✓✓</div>
                    )}
                  </div>
                  
                  {/* Reactions */}
                  {Object.keys(message.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(message.reactions).map(([emoji, users]) => (
                        <button
                          key={emoji}
                          onClick={() => addReaction(message.id, emoji)}
                          className={`px-2 py-1 rounded-full text-xs ${
                            users.includes(username)
                              ? 'bg-blue-200 text-blue-800'
                              : darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                          } hover:scale-110 transition-all duration-200 reaction-btn`}
                        >
                          {emoji} {users.length}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Quick Reactions */}
                  <div className="absolute -bottom-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg border">
                      {['❤️', '😂', '👍', '😮', '😢'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => addReaction(message.id, emoji)}
                          className="hover:scale-125 transition-transform duration-200 p-1"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className={`px-4 py-2 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} max-w-md`}>
                  <div className="flex items-center space-x-2">
                    <div className="typing-dots">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                    <span className="text-xs text-gray-500">typing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-3`}>
              <div className="grid grid-cols-8 sm:grid-cols-12 gap-2">
                {quickEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setInputValue(prev => prev + emoji)
                      setShowEmojiPicker(false)
                    }}
                    className="text-lg hover:scale-125 transition-transform duration-200 p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-3 sm:p-6`}>
            <form onSubmit={handleSendMessage} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  className={`flex-1 px-4 py-3 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${fontSizes[fontSize]}`}
                  placeholder="Type your message..."
                  maxLength={500}
                />
                
                {/* Emoji Button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`px-3 py-3 rounded-xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all duration-200`}
                >
                  😊
                </button>
                
                {/* File Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-3 py-3 rounded-xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all duration-200`}
                >
                  📎
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </div>
              
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`bg-gradient-to-r ${themes[theme]} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg transform hover:scale-105 text-sm sm:text-base`}
              >
                <span className="hidden sm:inline">🚀 Send</span>
                <span className="sm:hidden">🚀</span>
              </button>
            </form>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 flex justify-between`}>
              <span>{inputValue.length}/500</span>
              <span className="hidden sm:inline">Press Enter to send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
