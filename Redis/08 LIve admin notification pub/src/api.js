import express from "express";
import redis from "ioredis";

const app = express();
app.use(express.json());


const punlisher = new redis(process.env.REDIS_URL || "redis://localhost:6379");

app.post("/notify", async (req, res) => {
    const { message } = req.body;
    await punlisher.publish("notifications", message);

})

app.listen(3000, () => {
  console.log("Server is running on port 3000");
})