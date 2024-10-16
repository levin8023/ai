import { createOpenAI } from '@ai-sdk/openai'
import { convertToCoreMessages, StreamData, streamText } from 'ai'

//
export async function POST (req: Request) {
  const { messages } = await req.json()

  const data = new StreamData()
  data.append({ test: 'value' })

  const model = createOpenAI({
    baseURL: process.env.DEEP_SEEK_BASE_URL,
    apiKey: process.env.DEEP_SEEK_API_KEY,
  })

  const result = await streamText({
    model: model('deepseek-chat'),
    messages: convertToCoreMessages(messages),
    onFinish () {
      data.close()
    },
  })

  return result.toDataStreamResponse({ data })
}

