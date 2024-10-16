import {
  DistanceStrategy,
  PGVectorStore,
} from '@langchain/community/vectorstores/pgvector'
// @ts-ignore
import { PoolConfig } from 'pg'
import { getEmbeddings } from './embeddings'

const config = {
  postgresConnectionOptions: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  } as PoolConfig,
  tableName: 'knowledge_base',
  columns: {
    idColumnName: 'id',
    vectorColumnName: 'vector',
    contentColumnName: 'content',
    metadataColumnName: 'metadata',
  },
  collectionName: 'knowledge_base',
  collectionTableName: 'knowledge_base_collection',
  distanceStrategy: 'cosine' as DistanceStrategy
}

const vectorStoreCache: { [key: string]: PGVectorStore } = {}

export const initializeVectorStore = async (collectionName?: string) => {
  if (collectionName) {
    config.collectionName = collectionName
  }
  const vectorStore = await PGVectorStore.initialize(getEmbeddings(), config)
  vectorStoreCache[collectionName || config.collectionName] = vectorStore
  return vectorStore
}

export const getVectorStore = async (collectionName?: string) => {
  const cacheKey = collectionName || config.collectionName
  if (!vectorStoreCache[cacheKey]) {
    return await initializeVectorStore(collectionName)
  }
  return vectorStoreCache[cacheKey]
}

export const getRelevantDocs = async (
  query: string, collectionName?: string) => {
  const store = await getVectorStore(collectionName)
  return await store.similaritySearch(query)
}
