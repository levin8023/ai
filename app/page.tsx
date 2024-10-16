'use client'

import { useChat } from 'ai/react'
export default function Page () {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat({ keepLastMessageOnError: true })

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-4 flex justify-end">
        <button
          onClick={() => document.documentElement.classList.toggle('dark')}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white dark:bg-yellow-400 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Toggle Dark Mode
        </button>
      </div>
      <div className="flex-grow overflow-auto p-6">
        {messages.map(message => (
          <div key={message.id} className={`mb-4 p-3 rounded-lg max-w-[70%] ${
            message.role === 'user'
              ? 'bg-blue-100 ml-auto dark:bg-blue-800'
              : 'bg-white dark:bg-gray-800'
          }`}>
            <p className="font-semibold mb-1 text-gray-800 dark:text-gray-300">
              {message.role === 'user' ? 'You' : 'AI'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              {message.content}
            </p>
          </div>
        ))}
      </div>
      <div
        className="border-t bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
            name="prompt"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            Send
          </button>
          {isLoading && (
            <button
              type="button"
              onClick={stop}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Stop
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
