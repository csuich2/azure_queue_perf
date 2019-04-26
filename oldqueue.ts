import * as azure from 'azure-storage';

async function oldQueue() {
  const account = process.env.SA_NAME!;
  const accountKey = process.env.SA_KEY!;
  
  var queueService = azure.createQueueService(account, accountKey);
  const queueName = `queuetest${new Date().getTime()}`;
  queueService.createQueueIfNotExists(queueName, async function(error: any) {
    if (!error) {
      console.log(`Create queue ${queueName} successfully`);
      
      let totalDuration = 0;
      // Enqueue messages
      for (let loopCtr = 1; loopCtr <= 20; ++loopCtr) {
        const data = JSON.stringify({"foo": "bar"});
        const start = Date.now();
        await new Promise((resolve, reject) => {
          queueService.createMessage(queueName, data, { useNagleAlgorithm: true, }, function(error: any) {
            if (!error) {
              resolve();
            } else {
              reject(error);
            }
          });
        });
        const end = Date.now();
        const duration = end - start;
        totalDuration += duration;
        
        console.log(`publish: dur: ${duration}ms avg: ${totalDuration / loopCtr}ms`);
      }
    } else {
      console.error(error);
    }
    
    // Delete the queue.
    queueService.deleteQueue(queueName, (error: any) => {
      if (!error) {
        console.log(`Delete queue successfully`);
      } else {
        console.error(error);
      }
    });
  });
}

oldQueue()
  .then(() => {
    console.log("Successfully executed sample.");
  })
  .catch(err => {
    console.log(err.message);
  });