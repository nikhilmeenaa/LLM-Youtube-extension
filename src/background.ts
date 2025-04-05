'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

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
  const result = await classifier(post, {
    candidate_labels: ['hiring', 'not hiring'],
  });
  console.log({result});
  return result;
};

async function doAsyncTask() {
  return "Task completed";
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GREETINGS') {
    console.log(request.payload.message);
    
    // Immediately declare we'll respond asynchronously
    const keepAlive = true;
    
    // Perform async work
    getResult().then(result => {
      try {
        sendResponse({ success: true, data: result });
      } catch (error) {
        console.error("Failed to send response:", error);
      }
    }).catch(error => {
      try {
        sendResponse({ success: false, error: error.message });
      } catch (sendError) {
        console.error("Failed to send error response:", sendError);
      }
    });
    
    // Return true to keep the message port open
    return keepAlive;
  }
});