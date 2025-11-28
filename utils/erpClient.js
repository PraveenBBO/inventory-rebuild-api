// utils/erpClient.js (CommonJS)
const jwt = require('jsonwebtoken');

const ERP_BASE = process.env.ERP_BASE_URL;
const ERP_JWT_SECRET = process.env.JWT_SECRET;

let cachedToken = null;
let cachedExpTs = 0;

// Cache for order received data
let cachedOrderReceived = null;
let cachedOrderReceivedExpTs = 0;

function getServiceJwt() {
    const now = Math.floor(Date.now() / 1000);
    if (cachedToken && cachedExpTs - 30 > now) { // 30s safety buffer
        return cachedToken;
    }
    // Create a minimal service token; claims can be anything your ERP accepts
    const payload = { sub: 'inventory-service', role: 'system', iss: 'inventory' };
    const opts = { expiresIn: '10m' }; // short-lived
    const token = jwt.sign(payload, ERP_JWT_SECRET, opts);

    // Decode expiry for caching
    const { exp } = jwt.decode(token);
    cachedToken = token;
    cachedExpTs = exp || (now + 600);
    return token;
}

async function erpCreateProduct(payload, { idemKey }) {
    const url = `${ERP_BASE}/api/cms/product`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const res = await fetch(url, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getServiceJwt()}`,
                'Idempotency-Key': idemKey,
            },
            body: JSON.stringify(payload),
        });

        if (res.ok || res.status === 409) {
            clearTimeout(timeout);
            try { return await res.json(); } catch { return null; }
        }

        const bodyText = await res.text();
        const err = new Error(`ERP ${res.status}: ${bodyText}`);
        err.status = res.status;
        err.erpBody = bodyText;
        throw err;

    } finally {
        clearTimeout(timeout);
    }
}

module.exports = { erpCreateProduct };
