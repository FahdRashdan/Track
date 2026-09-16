import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import "dotenv/config";


const ratelimit = new Ratelimit({
    redis: new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
}),
    limiter: Ratelimit.slidingWindow(100, '60 s'), // 100 requests per minute
});

export default ratelimit;