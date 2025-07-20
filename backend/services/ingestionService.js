const { LocalIndex } = require('vectra');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const fs = require('fs/promises');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
const index = new LocalIndex(path.join(__dirname, '../vectra_index'));

// This function will process a single file
const processAndEmbedFile = async (filePath, fileName) => {
  console.log(`Processing file: ${fileName}`);
  if (!(await index.isIndexCreated())) {
    console.log('Creating new index...');
    await index.createIndex();
  }
  
  const content = await fs.readFile(filePath, 'utf-8');
  
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });
  const chunks = await splitter.splitText(content);
  
  const BATCH_SIZE = 100; // Google's API limit
  console.log(`Document split into ${chunks.length} chunks. Processing in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batchChunks = chunks.slice(i, i + BATCH_SIZE);
    
    console.log(`Embedding batch starting at chunk ${i}...`);
    const embeddings = await embeddingModel.batchEmbedContents({
      requests: batchChunks.map(chunk => ({
        content: { parts: [{ text: chunk }] },
        taskType: "RETRIEVAL_DOCUMENT"
      }))
    });

    const items = batchChunks.map((chunk, j) => ({
      vector: embeddings.embeddings[j].values,
      metadata: { text: chunk, file: fileName }
    }));

    console.log(`Upserting ${items.length} items from this batch...`);
    for (const item of items) {
      await index.upsertItem(item);
    }
  }
  
  console.log(`✅ ${fileName} processed successfully!`);
};
module.exports = { processAndEmbedFile };