const { LocalIndex } = require('vectra');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const fs = require('fs/promises');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
const index = new LocalIndex(path.join(__dirname, '../vectra_index'));

const ingestData = async () => {
  try {
    console.log('Starting data ingestion...');
    
    if (!(await index.isIndexCreated())) {
        console.log('Creating new index...');
        await index.createIndex();
    }
    
    const dataDir = path.resolve(__dirname, '../data');
    const files = await fs.readdir(dataDir);
    
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    });
    
    for (const file of files) {
      console.log(`Processing file: ${file}`);
      const content = await fs.readFile(path.join(dataDir, file), 'utf-8');
      const chunks = await splitter.splitText(content);
      
      console.log(`Embedding ${chunks.length} chunks...`);
      const embeddings = await embeddingModel.batchEmbedContents({
        requests: chunks.map(chunk => ({
          content: { parts: [{ text: chunk }] }, // This line is the fix
          taskType: "RETRIEVAL_DOCUMENT"
        }))
      });

      const items = chunks.map((chunk, i) => ({
        vector: embeddings.embeddings[i].values,
        metadata: { text: chunk, file: file }
      }));
      
     console.log(`Upserting ${items.length} items into the index...`);
      for (const item of items) {
        await index.upsertItem(item);
      }
    }

    console.log('✅ Data ingestion complete!');
  } catch (error) {
    console.error('Error during ingestion:', error);
  }
};

ingestData();