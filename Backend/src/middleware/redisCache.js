const redis = require('redis');

// Initialize Redis Client
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
    if (process.env.NODE_ENV !== 'test') {
        console.log('Connected to Redis successfully');
    }
});

// Connect to Redis immediately (asynchronously)
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Failed to connect to Redis during startup', err);
    }
})();

// Caching Middleware
const cacheMiddleware = (duration = 3600) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = `__express__${req.originalUrl || req.url}`;
        
        try {
            const cachedResponse = await redisClient.get(key);
            
            if (cachedResponse) {
                if (process.env.NODE_ENV !== 'test') {
                    console.log(`[Cache Hit] Serving from Redis for ${key}`);
                }
                return res.json(JSON.parse(cachedResponse));
            } else {
                if (process.env.NODE_ENV !== 'test') {
                    console.log(`[Cache Miss] Proceeding to route handler for ${key}`);
                }
                
                // Override res.json to capture response data
                const originalSend = res.json;
                res.json = function (body) {
                    // Restore original send to avoid recursive calls
                    res.json = originalSend;
                    
                    // Only cache successful responses
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        redisClient.setEx(key, duration, JSON.stringify(body))
                            .catch(err => console.error('Redis caching error:', err));
                    }
                    
                    return originalSend.call(this, body);
                };
                
                next();
            }
        } catch (error) {
            console.error('Redis error in middleware:', error);
            next(); // Proceed without cache if Redis fails
        }
    };
};

module.exports = {
    redisClient,
    cacheMiddleware
};
