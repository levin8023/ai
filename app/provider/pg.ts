import { getVectorStore } from '@/app/provider/vector_store'
import { Pool } from 'pg'

let vectorStore = await getVectorStore()
let pool: Pool = vectorStore.pool

export { pool }
