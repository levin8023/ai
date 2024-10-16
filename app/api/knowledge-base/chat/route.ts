import { getVectorStore } from '@/app/provider/vector_store'
import { getLlm } from '@/app/provider/llm'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import { PromptTemplate } from '@langchain/core/prompts'
import { LangChainAdapter } from 'ai'

export async function POST (request: Request) {
  const { messages } = await request.json()
  let vectorStore = await getVectorStore()
  const query = messages[messages.length - 1].content
  const docs = await vectorStore.similaritySearch(query)
  const prompt = PromptTemplate.fromTemplate(
    'You are an assistant for question-answering tasks. ' +
    'Only Use the following pieces of retrieved context to answer the question. ' +
    'If you don\'t know the answer, just say that you don\'t know.\n' +
    'Question: {question}\n' +
    'Context: {context}\n' +
    'Answer:',
  )

  const chain = await createStuffDocumentsChain({
    llm: getLlm(),
    outputParser: new StringOutputParser(),
    prompt,
  })
  const stream = await chain.stream({
    context: docs,
    question: query,
  })
  return LangChainAdapter.toDataStreamResponse(stream)
}

