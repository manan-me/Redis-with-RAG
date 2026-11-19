import express from "express";
import {emailQueue} from "./queue.js";

const app = express();
app.use(express.json());

app.post("/email-send", async (req, res) => {
  const job = await emailQueue.add(
    "sendEmail",
    {
      to: req.body.to,
      subject: req.body.subject,
    },
    {
      attempt: 3,
    },
  )
  
  res.json({ message: "Email job enqueued successfully", id: job.id, name: job.name, data: job.data  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
