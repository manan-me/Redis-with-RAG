import express from "express";
import Redis from "ioredis";


const app=express();
app.use(express.json());

const redisClient=new Redis(process.env.REDIS_URL || "redis://localhost:6379");

function otp(phone){
    return `otp:${phone}`;
}

app.post("/send-otp",async(req,res)=>{
    const {phone}=req.body;
    const otpCode=Math.floor(100000+Math.random()*900000);
    await redisClient.set(otp(phone),otpCode,"EX",30);

    res.json({message:`OTP sent to ${phone}`,otp:otpCode});
})

app.post("/verify-otp",async(req,res)=>{
    const {phone,otpCode}=req.body;
    const storedOtp=await redisClient.get(otp(phone));

    if(!storedOtp){
        return res.status(400).json({message:"OTP expired or not found"});
    }

    if(storedOtp===otpCode){
        await redisClient.del(otp(phone));
        res.json({message:"OTP verified successfully"});
    }else{
        res.status(400).json({message:"Invalid OTP"});
    }
})

app.get("/otp/:phone/ttl",async(req,res)=>{
    const ttl=await redisClient.ttl(otp(req.params.phone));
    res.json({ttl:ttl});    
})

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
});