import { ChatOpenAI } from '@langchain/openai'

const qwen = new ChatOpenAI({
  configuration: {
    baseURL: process.env.DASH_SCOPE_API_BASE_URL,
  },
  model: 'qwen-turbo',
  apiKey: process.env.DASH_SCOPE_API_KEY,
})

const deepseek = new ChatOpenAI({
  configuration: {
    baseURL: process.env.DEEP_SEEK_BASE_URL,
  },
  model: 'deepseek-chat',
  apiKey: process.env.DEEP_SEEK_API_KEY,
})

export const getLlm = () => deepseek
