const ctx: Worker = self as any;

// Worker message handler
ctx.onmessage = (e) => {
  console.log('[Worker] Received message:', e.data);
  
  if (e.data.type === 'TEST_REQUEST') {
    // Process the request
    const processedData = {
      original: e.data.payload,
      processed: `Processed at ${Date.now()}`,
      length: e.data.payload.length
    };
    
    // Send response back
    ctx.postMessage({
      type: 'TEST_RESPONSE',
      payload: processedData,
      requestId: e.data.requestId
    });
  }
  
  if (e.data.type === 'PING') {
    ctx.postMessage({
      type: 'PONG',
      timestamp: Date.now()
    });
  }
};

// Export for TypeScript
export default null as any;