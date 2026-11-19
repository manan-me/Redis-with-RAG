import express from "express";
import Redis from "ioredis";
import mongoose from "mongoose";

const app=express();
const redisClient=new Redis(process.env.REDIS_URL || "redis://localhost:6379");


app.get("/redis",async(req,res)=>{
    const reply=await redisClient.ping();
    res.json({ message:reply });
});


app.get("/mongo",async(req,res)=>{
    const url=process.env.MONGO_URL || "mongodb://localhost:27017/redis_mongo";

    if(mongoose.connection.readyState===0){
        await mongoose.connect(url);}

        res.json({ message:"MongoDB connected successfully",DBname:mongoose.connection.name });
})


app.listen(3000,()=>{
    console.log("Server is running on port 3000");
}   )
