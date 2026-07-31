const RESULT_TTL_SECONDS = 2700;

const ATS_SCHEMA = `{
  "score": 0,
  "verdict": "string",
  "role": "string",
  "experienceLevel": "string",
  "summary": "string",
  "scoreBreakdown": [{ "label": "string", "score": 0, "max": 100, "note": "string" }],
  "strengths": ["string"],
  "priorityActions": [{ "priority": "High|Medium|Low", "title": "string", "detail": "string" }],
  "keywords": { "matched": ["string"], "missing": ["string"], "duplicates": [{ "keyword": "string", "count": 0, "replacement": "string" }] },
  "grammarIssues": [{ "original": "string", "suggestion": "string", "reason": "string" }],
  "timeline": [{ "role": "string", "company": "string", "duration": "string", "impact": "string" }],
  "atsTips": ["string"]
}`;

function getKeys(...names) {
    for (const name of names) {
        const value = process.env[name]?.trim().replace(/^['"]|['"]$/g, '');
        if (!value) continue;
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
        } catch {
            // Comma/newline-separated environment variables are also supported.
        }
        const keys = value.split(/[\s,]+/).map((key) => key.trim()).filter(Boolean);
        if (keys.length) return keys;
    }
    return [];
}

export function hasConfiguredAIProvider() {
    return getKeys('GEMINI_API_KEYS', 'GEMINI_API_KEY').length > 0 ||
        getKeys('GPT_API_KEYS', 'OPENAI_API_KEYS', 'OPENAI_API_KEY').length > 0;
}

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function extractJson(value) {
    if (typeof value !== "string") return value;
    const cleaned = value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start === -1 || end <= start) throw new Error('AI returned invalid JSON');
        return JSON.parse(cleaned.slice(start, end + 1));
    }
}

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function parseRetryAfter(value) {
    if (!value) return 0;
    const seconds = Number(value);
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? Math.max(0, timestamp - Date.now()) : 0;
}

function parseRateLimitReset(value) {
    if (!value) return 0;
    const match = String(value).trim().match(/^(\d+(?:\.\d+)?)(ms|s|m|h)?$/i);
    if (!match) return 0;
    const amount = Number(match[1]);
    const multiplier = { ms: 1, s: 1000, m: 60000, h: 3600000 }[(match[2] || 'ms').toLowerCase()] || 1;
    return amount * multiplier;
}

function openAIModel() {
    return process.env.GPT_MODEL || 'gpt-5.4-mini';
}

function openAIErrorMessage(status, body, requestId) {
    const providerError = body?.error;
    const type = providerError?.type || providerError?.code || 'unknown_error';
    const detail = providerError?.message || 'No additional details were returned by OpenAI.';
    const requestSuffix = requestId ? ` Request ID: ${requestId}.` : '';
    return `OpenAI request failed (${status}, ${type}): ${detail}${requestSuffix}`;
}

async function waitForOpenAIRateLimit(cache, model) {
    if (!cache) return;

    // A Redis lock spaces requests across hot-reloaded listeners and app instances.
    // Override this when using a model with a different RPM limit.
    const defaultInterval = /(?:pro|sol|gpt-5\.5$|gpt-5\.4$)/i.test(model) ? 20000 : 6500;
    const interval = Math.max(1000, Number(process.env.GPT_REQUEST_INTERVAL_MS) || defaultInterval);
    const key = `ai:openai:request-slot:${model}`;

    while (true) {
        const acquired = await cache.set(key, String(Date.now()), 'PX', interval, 'NX');
        if (acquired === 'OK') return;
        await sleep(Math.min(1000, interval));
    }
}

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

function normalizeAnalysis(raw, resumeText, qualityData) {
    const analysis = raw && typeof raw === 'object' ? raw : {};
    const score = Math.max(0, Math.min(100, Number(analysis.score) || 0));
    return {
        score,
        verdict: String(analysis.verdict || (score >= 80 ? 'Strong ATS foundation' : 'Good foundation with room to improve')),
        role: String(analysis.role || 'General professional role'),
        experienceLevel: String(analysis.experienceLevel || 'Experienced professional'),
        summary: String(analysis.summary || 'Your resume has been reviewed for ATS readability, relevance, and impact.'),
        scoreBreakdown: asArray(analysis.scoreBreakdown),
        strengths: asArray(analysis.strengths),
        priorityActions: asArray(analysis.priorityActions),
        keywords: {
            matched: asArray(analysis.keywords?.matched),
            missing: asArray(analysis.keywords?.missing),
            duplicates: asArray(analysis.keywords?.duplicates),
        },
        grammarIssues: asArray(analysis.grammarIssues),
        timeline: asArray(analysis.timeline),
        atsTips: asArray(analysis.atsTips),
        meta: {
            analyzedAt: new Date().toISOString(),
            wordCount: qualityData?.wordCount || (resumeText.match(/\b\w+\b/g) || []).length,
            provider: analysis.meta?.provider || 'AI analysis',
        },
    };
}

async function callGemini(key, prompt) {
    const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
    });
    if (!response.ok) throw new Error(`Gemini request failed (${response.status})`);
    const data = await response.json();
    return extractJson(data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join(''));
}

async function callOpenAI(key, prompt, cache) {
    const model = openAIModel();
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        await waitForOpenAIRateLimit(cache, model);
        const response = await fetch(process.env.GPT_API_URL || 'https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
            body: JSON.stringify({
                model,
                temperature: 0.2,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: 'You are an expert ATS resume reviewer. Return only valid JSON.' },
                    { role: 'user', content: prompt },
                ],
            }),
        });

        const rawBody = await response.text();
        let body;
        try {
            body = rawBody ? JSON.parse(rawBody) : null;
        } catch {
            body = null;
        }

        if (response.ok) return extractJson(body?.choices?.[0]?.message?.content);

        const errorType = body?.error?.type || body?.error?.code;
        const retryable = response.status === 429 && errorType !== 'insufficient_quota';
        if (!retryable || attempt === maxAttempts) {
            const error = new Error(openAIErrorMessage(response.status, body, response.headers.get('x-request-id')));
            error.status = response.status;
            error.code = errorType;
            throw error;
        }

        const retryAfter = parseRetryAfter(response.headers.get('retry-after')) ||
            parseRateLimitReset(response.headers.get('x-ratelimit-reset-requests')) ||
            Math.min(60000, 1000 * (2 ** attempt));
        console.warn(`[AI Engine] OpenAI rate limit hit; retrying in ${retryAfter}ms (attempt ${attempt}/${maxAttempts - 1}).`);
        await sleep(retryAfter);
    }
}

export async function procsessATSByAI(taskId, resumeText, qualityData, cache) {
    const resultKey = `task:result:${taskId}`;
    try {
        const prompt = `Analyze the resume below as an ATS specialist. Infer the most likely role and experience level from the resume itself. Identify duplicate action keywords and replacements, missing role-relevant keywords, specific grammatical issues, and a concise career timeline. Do not invent facts; use empty arrays when evidence is absent. Return JSON matching this schema exactly: ${ATS_SCHEMA}\n\nResume:\n${resumeText.slice(0, 30000)}`;
        const geminiKeys = getKeys('GEMINI_API_KEYS', 'GEMINI_API_KEY');
        const gptKeys = getKeys('GPT_API_KEYS', 'OPENAI_API_KEYS', 'OPENAI_API_KEY');
        const providers = [
            ...(geminiKeys.length ? [{ name: 'Gemini', key: randomItem(geminiKeys), call: callGemini }] : []),
            ...(gptKeys.length ? [{ name: 'GPT', key: randomItem(gptKeys), call: callOpenAI }] : []),
        ];

        if (!providers.length) {
            throw new Error('No AI provider API keys configured. Set GEMINI_API_KEYS or GPT_API_KEYS in .env and restart the server.');
        }

        const selected = randomItem(providers);
        const analysis = await selected.call(selected.key, prompt, cache);
        const provider = selected.name;

        const normalized = normalizeAnalysis({ ...(analysis || {}), meta: { ...(analysis?.meta || {}), provider } }, resumeText, qualityData);
        if (cache) {
            await cache.set(resultKey, JSON.stringify(normalized), 'EX', RESULT_TTL_SECONDS);
            await cache.set(`task:status:${taskId}`, 'READY', 'EX', RESULT_TTL_SECONDS);
        }
        return normalized;
    } catch (error) {
        console.error(`[AI Engine] Analysis failed for ${taskId}:`, error);
        if (cache) {
            await cache.set(`task:error:${taskId}`, error.message || 'AI analysis failed.', 'EX', RESULT_TTL_SECONDS);
            await cache.set(`task:status:${taskId}`, 'FAILED', 'EX', RESULT_TTL_SECONDS);
        }
        return null;
    }
}
