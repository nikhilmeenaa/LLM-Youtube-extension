const ctx: Worker = self as any;
import { pipeline } from '@xenova/transformers';

let classifier: any = null;

// Initialize the model (lazy load)
async function getClassifier() {
  if (!classifier) {
    classifier =  await pipeline('zero-shot-classification', 'Xenova/nli-deberta-v3-small');
  }
  return classifier;
}

const getResult = async () => {
  const classifier = await getClassifier();
  const post = `We're looking for a senior frontend engineer to join our team in Berlin. Apply now!`;
  const result = await classifier(post, ['hiring', 'not hiring']);

  console.log({result});
  return result;
};

async function doAsyncTask() {
  return "Task completed";
}

// Worker message handler
ctx.onmessage = async (e) => {
  console.log('[Worker] Received message:', e.data);
  
  if (e.data.type === 'TEST_REQUEST') {
    // Process the request
    const processedData = {
      original: e.data.payload,
      processed: `Processed at ${Date.now()}`,
      length: e.data.payload.length
    };

    const response = await doAsyncTask();
    processedData.processed = response;
    
    // Send response back
    ctx.postMessage({
      type: 'TEST_RESPONSE',
      payload: processedData,
      requestId: e.data.requestId
    });
  }
  
  if (e.data.type === 'PING') {
    console.log("Worker pinged")
    const response = await getResult();
    ctx.postMessage({
      type: 'PONG',
      timestamp: Date.now(),
      data: response
    });
  }
};

// Export for TypeScript
export default null as any;