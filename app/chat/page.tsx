'use client'

import React from 'react'
import { useChat } from 'ai/react'

export default function Chat () {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div
      className="flex flex-col h-screen w-full mx-auto p-4 bg-gray-100 dark:bg-gray-800">
      <h1
        className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
        Chat with AI
      </h1>

      <div
        className="flex-grow overflow-auto mb-4 bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
        {messages.map((m) => (
          <div key={m.id} className={`mb-4 ${m.role === 'user'
            ? 'text-right'
            : 'text-left'}`}>
            <div
              className={`inline-block max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                m.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
              }`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
          value={input}
          placeholder="Type your message..."
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        </button>
      </form>
    </div>
  )
}
