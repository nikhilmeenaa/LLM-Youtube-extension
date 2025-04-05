'use strict';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page

import { pipeline } from '@xenova/transformers';

let classifier: any = null;

// Initialize the model (lazy load)
async function getClassifier() {
  if (!classifier) {
    classifier = await pipeline(
      'text-classification', 
      'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
    );
  }
  return classifier;
}

const getResult = async () => {
  // const classifier = await getClassifier();
  // const result = await classifier("Hello we are gonna play now");
  // console.log({result});
  return "Hello we are gonna ";
};

getResult().then((data) => {
  console.log({data})
});



const pageTitle: string =
  document.head.getElementsByTagName('title')[0].innerHTML;
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

// Using promise-based approach
const sendMessage = async () => {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GREETINGS',
      payload: {
        message: 'Hello from ContentScript'
      }
    });
    
    console.log("Received response:", response);
  } catch (error) {
    console.error("Error in communication:", error);
  }
};

sendMessage();

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log(`Current count is ${request.payload.count}`);
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});


document.addEventListener("click", async () => {
  const repsonse = await getResult();
  console.log({repsonse})
})



// // In contentScript.ts
// const workerCode = `
//   importScripts('${chrome.runtime.getURL('classifierWorker.js')}');
// `;

// const blob = new Blob([workerCode], { type: 'application/javascript' });
// const workerUrl = URL.createObjectURL(blob);
// const worker = new Worker(workerUrl);

// // Clean up when done
// window.addEventListener('unload', () => {
//   worker.terminate();
//   URL.revokeObjectURL(workerUrl);
// });


class WorkerManager {
  private worker: Worker;
  private pendingRequests: Record<string, (response: any) => void> = {};
  
  constructor() {
    // Create worker using blob URL approach
    const workerCode = `
      importScripts('${chrome.runtime.getURL('classifierWorker.js')}');
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));
    
    // Setup message handler
    this.worker.onmessage = (e) => {
      console.log('[Content Script] Received worker message:', e.data);

      console.log(e)
      
      // Handle response
      if (e.data.requestId && this.pendingRequests[e.data.requestId]) {
        this.pendingRequests[e.data.requestId](e.data);
        delete this.pendingRequests[e.data.requestId];
      }
    };
    
    // Cleanup on page unload
    window.addEventListener('unload', () => {
      this.worker.terminate();
    });
  }
  
  // Send message with response handling
  public sendMessage(message: any): Promise<any> {
    const requestId = Math.random().toString(36).substring(2, 9);
    
    return new Promise((resolve) => {
      this.pendingRequests[requestId] = resolve;
      this.worker.postMessage({
        ...message,
        requestId
      });
    });
  }
  
  // Test methods
  public async ping(): Promise<number> {
    const response = await this.sendMessage({
      type: 'PING'
    });
    return response.timestamp;
  }
  
  public async processData(data: any): Promise<any> {
    return this.sendMessage({
      type: 'TEST_REQUEST',
      payload: data
    });
  }
}

// Initialize and test
const workerManager = new WorkerManager();

// Test communication
(async () => {
  try {
    // Simple ping test
    const pongTime = await workerManager.ping();
    console.log('Ping-Pong latency:', Date.now() - pongTime, 'ms');
    
    // Data processing test
    const testData = { sample: 'data', values: [1, 2, 3] };
    const result = await workerManager.processData(testData);
    console.log('Processed data:', result);
    
    // Multiple parallel requests
    const promises = [
      workerManager.processData('first'),
      workerManager.processData('second'),
      workerManager.processData('third')
    ];
    
    const allResults = await Promise.all(promises);
    console.log('All results:', allResults);
  } catch (error) {
    console.error('Worker communication error:', error);
  }
})();