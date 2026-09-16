import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
    try {

        // user id or iot token can be used to identify the user

        const { success } = await ratelimit.limit("my-rate-limit"); // You can use a unique key for each user or IP address

        if (!success) {
            return res.status(429).json({ error: "Too many requests" });
        }

        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        console.error("Error in rate limiter middleware:", error);
        next(error);
    }
};

export default rateLimiter;