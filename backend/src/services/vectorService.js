import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// A local in-memory vector mock store
const mockVectorStore = new Map();

export const chunkDocument = (text, chunkSize = 500, chunkOverlap = 50) => {
  const words = text.split(/\s+/);
  const chunks = [];
  let index = 0;

  while (index < words.length) {
    const chunkWords = words.slice(index, index + chunkSize);
    chunks.push(chunkWords.join(' '));
    index += (chunkSize - chunkOverlap);
  }

  return chunks;
};

export const indexDocumentChunks = async (documentId, text) => {
  const chunks = chunkDocument(text);
  logger.info(`Chunked document ${documentId} into ${chunks.length} segments.`);
  
  const indexedSegments = chunks.map((chunk, idx) => {
    const chunkId = `${documentId}_chunk_${idx}`;
    const mockVector = Array.from({ length: 1536 }, () => Math.random() - 0.5);
    
    // Store locally in memory
    mockVectorStore.set(chunkId, {
      documentId,
      text: chunk,
      vector: mockVector
    });

    return { chunkId, length: chunk.length };
  });

  return indexedSegments;
};

export const queryVectorDatabase = async (queryText, limit = 3) => {
  logger.info(`Searching database for semantic matches on: "${queryText}"`);
  
  const results = [];
  const queryWords = queryText.toLowerCase().split(/\s+/);

  for (const [id, value] of mockVectorStore.entries()) {
    // Perform simple TF-IDF keyword match scoring as a local mock semantic vector search
    let score = 0;
    queryWords.forEach(word => {
      if (value.text.toLowerCase().includes(word)) {
        score += 0.3;
      }
    });

    // Add noise to simulate real cosine similarity
    score += Math.random() * 0.1;

    results.push({
      id,
      text: value.text,
      score: Math.min(score, 1.0),
      documentId: value.documentId
    });
  }

  // Sort and select top results
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
};
