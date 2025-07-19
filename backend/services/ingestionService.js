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
  
  console.log(`Embedding ${chunks.length} chunks for ${fileName}...`);
  const embeddings = await embeddingModel.batchEmbedContents({
    requests: chunks.map(chunk => ({
      content: { parts: [{ text: chunk }] },
      taskType: "RETRIEVAL_DOCUMENT"
    }))
  });

  const items = chunks.map((chunk, i) => ({
    vector: embeddings.embeddings[i].values,
    metadata: { text: chunk, file: fileName }
  }));

  console.log(`Upserting ${items.length} items into the index...`);
  for (const item of items) {
    await index.upsertItem(item);
  }
  console.log(`✅ ${fileName} processed successfully!`);
};

module.exports = { processAndEmbedFile };