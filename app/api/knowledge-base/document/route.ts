import { TextLoader } from 'langchain/document_loaders/fs/text'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { getVectorStore } from '@/app/provider/vector_store'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import { JSONLoader } from 'langchain/document_loaders/fs/json'
import { pool } from '@/app/provider/pg'
import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'

function getFileLoader (file: File) {
  let name = file.name
  console.log('getFileLoader, file name: ', name)
  if (name.endsWith('.txt')) {
    return new TextLoader(file)
  }
  if (name.endsWith('.pdf')) {
    return new PDFLoader(file)
  }
  if (name.endsWith('.docx')) {
    return new DocxLoader(file)
  }
  if (name.endsWith('.csv')) {
    return new CSVLoader(file)
  }
  if (name.endsWith('.json')) {
    return new JSONLoader(file)
  }
  return new TextLoader(file)
}

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

export async function saveDocumentFile (file: File) {
  await createDocumentTable()
  const sql = 'INSERT INTO knowledge_base_document (id, name, type, content) ' +
    'VALUES ($1, $2, $3, $4) RETURNING id'
  const fileContent = await file.arrayBuffer()
  const buffer = Buffer.from(fileContent)
  const result = await pool.query(sql,
    [randomUUID(), file.name, file.type, buffer])
  return result.rows[0].id
}

async function createDocumentTable () {
  const sql = `
      CREATE TABLE IF NOT EXISTS knowledge_base_document
      (
          id         varchar(36) PRIMARY KEY,
          name       TEXT NOT NULL,
          type       TEXT NULL,
          content BYTEA NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
  `
  await pool.query(sql)
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

