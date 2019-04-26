import {
  Aborter,
  QueueURL,
  MessagesURL,
  ServiceURL,
  StorageURL,
  SharedKeyCredential,
  TokenCredential
} from "@azure/storage-queue";

async function newQueue() {
  const account = process.env.SA_NAME!;
  const accountKey = process.env.SA_KEY!;
  
  const sharedKeyCredential = new SharedKeyCredential(account, accountKey);
  
  const tokenCredential = new TokenCredential("token");
  tokenCredential.token = "renewedToken";
  
  const pipeline = StorageURL.newPipeline(sharedKeyCredential);
  
  const serviceURL = new ServiceURL(
    `https://${account}.queue.core.windows.net`,
    pipeline
  );

  // Create the queue
  const queueName = `queuetest${new Date().getTime()}`;
  const queueURL = QueueURL.fromServiceURL(serviceURL, queueName);
  const createQueueResponse = await queueURL.create(Aborter.none);
  console.log(`Create queue ${queueName} successfully, service assigned request Id: ${createQueueResponse.requestId}`);
    
  // Enqueue messages
  let totalDuration = 0;
  const messagesURL = MessagesURL.fromQueueURL(queueURL);
  for (let loopCtr = 1; loopCtr <= 20; ++loopCtr) {
    const data = JSON.stringify({"foo": "bar"});
    const start = Date.now();
    const enqueueQueueResponse = await messagesURL.enqueue(Aborter.none, data);
    const end = Date.now();
    const duration = end - start;
    totalDuration += duration;
    
    console.log(`publish: dur: ${duration}ms avg: ${totalDuration / loopCtr}ms`);
  }
    
  // Delete the queue.
  const deleteQueueResponse = await queueURL.delete(Aborter.none);
  console.log(`Delete queue successfully, service assigned request Id: ${deleteQueueResponse.requestId}`);
}
      
newQueue()
  .then(() => {
    console.log("Successfully executed sample.");
  })
  .catch(err => {
    console.log(err.message);
  });