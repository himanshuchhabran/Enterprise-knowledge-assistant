const { LocalIndex } = require('vectra');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const { pool } = require('../config/db');

const index = new LocalIndex(path.join(__dirname, '../vectra_index'));
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
const generationModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const handleQuery = async (userQuery, userId) => {
  // 1. Embed user query
  const queryEmbedding = await embeddingModel.embedContent(userQuery, "RETRIEVAL_QUERY");

  // 2. Retrieve relevant documents from Vectra
  const results = await index.queryItems(queryEmbedding.embedding.values, 5);
  
  let context = '';
  if (results.length > 0) {
    context = results.map(result => result.item.metadata.text).join('\n---\n');
  } else {
    console.log('No results found from vector store.');
  }

  // 3. Generate response
  const prompt = `
    You are an Enterprise Knowledge Assistant for Nebula9.ai.
    Answer the user's question based ONLY on the provided context.
    If the context doesn't contain the answer, say "I do not have information on that topic based on the provided documents."

    Context:
    ${context}

    Question:
    ${userQuery}

    Answer:`;

  const result = await generationModel.generateContent(prompt);
  const answer = result.response.text();
  
  // 4. Save history to DB
  await pool.query(
    'INSERT INTO query_history (user_id, query, response) VALUES ($1, $2, $3)',
    [userId, userQuery, answer]
  );

  return answer;
};

module.exports = { handleQuery };