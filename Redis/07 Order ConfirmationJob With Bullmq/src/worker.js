import {worker} from 'bullmq';
import {connection} from './queue.js';


const worker=new worker(
    "emailQueue",
    async(job)=>{
        console.log("Processing the job ....",job.id,job.name,job.data);
        (await new Promise((resolve)=>setTimeout(resolve,1500)))
        console.log("Job is completed ....",job.id,job.name,job.data);
        
    },
    connection
)

worker.on("completed",(job)=>{
    console.log(`Job with id ${job.id} has been completed`);
}
)

worker.on("failed",(job,err)=>{
    console.log(`Job with id ${job.id} has failed with error ${err.message}`);
})