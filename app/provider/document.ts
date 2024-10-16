import { pool } from '@/app/provider/pg'
import { randomUUID } from 'node:crypto'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import { JSONLoader } from 'langchain/document_loaders/fs/json'

export function getFileLoader (file: File) {
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
