import Redis from "ioredis";
import express from "express";

const subscriber = new Redis(process.env.REDIS_URL || "redis://localhost:6379");


subscriber.subscribe("notifications", (err) => {if (err) {
    console.error("Failed to subscribe: %s", err.message);
    return;
}
console.log("Subscribed to notifications channel");
}
)

subscriber.on("message", (channel, message) => {
    console.log(`Received message from ${channel}: ${message}`);
    // Here you can add logic to send the notification to the admin, e.g., via email or push notification
})