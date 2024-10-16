import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { getVectorStore } from '@/app/provider/vector_store'
import { pool } from '@/app/provider/pg'
import { NextResponse } from 'next/server'
import { getFileLoader, saveDocumentFile } from '@/app/provider/document'

export async function POST (request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new Response('No file provided', { status: 400 })
    }
    const loader = getFileLoader(file)
    const docs = await loader.load()
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    })
    const documents = await textSplitter.splitDocuments(docs)

    const vectorStore = await getVectorStore()
    const documentId = await saveDocumentFile(file)
    documents.forEach(d => {
      d.metadata.source = file.name
      d.metadata.documentId = documentId
    })
    await vectorStore.addDocuments(documents)
    return new Response('Documents added successfully', { status: 200 })
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export async function DELETE (request: Request) {
  let ids = await request.json()
  let vectorStore = await getVectorStore()
  for (const id of ids) {
    await vectorStore.delete({ filter: { documentId: id } })
  }
  await pool.query('DELETE FROM knowledge_base_document WHERE id = ANY($1)',
    [ids])
  return NextResponse.json({ message: 'Documents deleted successfully' },
    { status: 200 })
}

export async function GET (request: Request) {
  const sql = 'SELECT id, name, type, created_at  FROM knowledge_base_document'
  let res = await pool.query(sql)
  return NextResponse.json(res.rows)
}

