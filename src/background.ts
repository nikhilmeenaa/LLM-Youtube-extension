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
    classifier = await pipeline(
      'text-classification', 
      'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
    );
  }
  return classifier;
}

const getResult = async () => {
  const classifier = await getClassifier();
  const result = await classifier("Hello we are gonna play now");
  console.log({result});
  return result;
};

async function doAsyncTask() {
  // Your async operations here
  // await someAsyncOperation();
  return "Task completed";
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === 'GREETINGS') {
    const message: string = `Hi ${
      sender.tab ? 'Con' : 'Pop'
    }, my name is Bac. I am from Background. It's great to hear from you.`;

    // Log message coming from the `request` parameter
    console.log(request.payload.message);
    // Send a response message
    // doAsyncTask().then((result) => {
    //   console.log({result})
    //   sendResponse({
    //     message,
    //   });
    // })
    // sendResponse(doAsyncTask());
    sendResponse(message);
    return true;
  }
});
