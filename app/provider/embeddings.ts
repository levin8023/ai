import {
  AlibabaTongyiEmbeddings,
} from '@langchain/community/embeddings/alibaba_tongyi'

let embeddings = new AlibabaTongyiEmbeddings({
  apiKey: process.env.DASH_SCOPE_API_KEY,
})

export const getEmbeddings = () => embeddings
