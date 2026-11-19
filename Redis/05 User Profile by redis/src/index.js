// import express from "express";
// import Redis from "ioredis";

// const app=express();
// app.use(express.json());

// const redisClient=new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// app.post("/user/:id/json",async(req,res)=>{
//     await redisClient.set(`user:${req.params.id}:json`,JSON.stringify(req.body));
//     res.json({message:`User profile for ${req.params.id} saved successfully`});
// })

// app.get("/user/:id/json",async(req,res)=>{
//     const  raw=await redisClient.get(`user:${req.params.id}:json`);
//     if(!raw){
//         return res.status(404).json({message:`User profile for ${req.params.id} not found`});
//     }
//     const userProfile=JSON.parse(raw);
//     res.json({userProfile}); 
// })


// app.post("/user/:id/hash",async(req,res)=>{
//     await redisClient.hset(`user:${req.params.id}:hash`,req.body);
//     res.json({message:`User profile for ${req.params.id} saved successfully`});
// })

// app.get("/user/:id/hash",async(req,res)=>{
//     const userProfile=await redisClient.hgetall(`user:${req.params.id}:hash`);
//     res.json({userProfile}); 
// })


// app.listen(3000,()=>{
//     console.log("Server is running on port 3000");
// } )



import express from "express";
import Redis from "ioredis";

const app=express();
app.use(express.json());

const redisClient=new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const QUEUE_KEY="email:queue";

app.post("/email/enque",async(req,res)=>{
    const job={
        to:req.body.to,
        subject:req.body.subject,
        body:req.body.body,
        createdAt:new Date().toISOString()
    }
    await redisClient.lpush(QUEUE_KEY,JSON.stringify(job));
    res.json({message:"Email job enqueued successfully", job:job});

})
 app.get("/email/deque",async(req,res)=>{
    const job=await redisClient.rpop(QUEUE_KEY);
    if(!job){
        return res.status(404).json({message:"No email job found in the queue"});
    }   
    res.json({message:"Email job dequeued successfully", job:JSON.parse(job)});
})

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
});