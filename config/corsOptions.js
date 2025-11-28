const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://reinventory.bbopokertables.com",
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`Blocked by CORS: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true,
};

module.exports = corsOptions;
