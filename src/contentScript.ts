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



// In contentScript.ts
const workerCode = `
  importScripts('${chrome.runtime.getURL('classifierWorker.js')}');
`;

const blob = new Blob([workerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(blob);
const worker = new Worker(workerUrl);

// Clean up when done
window.addEventListener('unload', () => {
  worker.terminate();
  URL.revokeObjectURL(workerUrl);
});