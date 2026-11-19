import express from "express";
import redis from "ioredis";

const app=express();
app.use(express.json());




const redisClient=new redis(process.env.REDIS_URL || "redis://localhost:6379")

redisClient.on("error", (err) => {
  console.error("Redis error:", err.message);
});



const LEADERBOARD_KEY = "leaderboard:global";
const postViewsKey = (id) => `post:${id}:views`;

app.post("/post/:id/view",async(req,res)=>{
    try {
        const {id}=req.params;

    const views=await redisClient.incr(postViewsKey(id));
    res.json({msg:"Views updated succes fullly",id,views})
    } catch (error) {
        console.log("Error occured "+error)
    }
})


   app.post("/leaderboard/score", async (req, res) => {
  try {
    const { userId, points } = req.body ?? {};

    if (typeof userId !== "string" || !/^[a-zA-Z0-9_-]{1,50}$/.test(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    if (typeof points !== "number" || !Number.isFinite(points)) {
      return res.status(400).json({ error: "points must be a finite number" });
    }

    if (points < -1000 || points > 1000) {
      return res.status(400).json({ error: "points must be between -1000 and 1000" });
    }

    const score = await redisClient.zincrby(LEADERBOARD_KEY, points, userId);
    res.json({ userId, score: Number(score) });
  } catch (error) {
    console.error("zincrby failed:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/leaderboard", async (req, res) => { 
    try{
        const raw=await redisClient.zrevrange(LEADERBOARD_KEY, 0, 9, "WITHSCORES");
        const leaders=[];

        for(let i=0;i<raw.length;i+=2){
            leaders.push({userId:raw[i],score:Number(raw[i+1])})
        }
        res.json({ leaders });
    }
    catch (error) {
        console.error("Error fetching leaderboard:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }


})


app.get("/leaderboard/:userId/rank", async (req, res) => {  
    const {userId}=req.params;
    const position=await redisClient.zrevrank(LEADERBOARD_KEY,userId);
    if(position===null){
        return res.status(404).json({error:"User not found in leaderboard"})
    }   
    const score=await redisClient.zscore(LEADERBOARD_KEY,userId);
    res.json({userId,rank:position+1,score:Number(score)})
})



app.listen(3000,()=>{
    console.log("Server is running on port 3000");
});