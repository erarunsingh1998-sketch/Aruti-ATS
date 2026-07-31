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
    return getKeys('GEMINI_API_KEYS', 'GEMINI_API_KEY').length > 0;
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

export async function procsessATSByAI(taskId, resumeText, qualityData, cache) {
    const resultKey = `task:result:${taskId}`;
    try {
        const prompt = `Analyze the resume below as an ATS specialist. Infer the most likely role and experience level from the resume itself. Identify duplicate action keywords and replacements, missing role-relevant keywords, specific grammatical issues, and a concise career timeline. Do not invent facts; use empty arrays when evidence is absent. Return JSON matching this schema exactly: ${ATS_SCHEMA}\n\nResume:\n${resumeText.slice(0, 30000)}`;
        const geminiKeys = getKeys('GEMINI_API_KEYS', 'GEMINI_API_KEY');
        if (!geminiKeys.length) {
            throw new Error('No Gemini API keys configured. Set GEMINI_API_KEYS in .env and restart the server.');
        }

        const analysis = await callGemini(randomItem(geminiKeys), prompt);
        const provider = 'Gemini';

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
