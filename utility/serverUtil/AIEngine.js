const RESULT_TTL_SECONDS = 2700;

const RESUME_SCHEMA = `{
  "basics": {
    "name": "string",
    "headline": ["string"],
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "portfolio": "string",
    "summary": "string"
  },
  "experience": [
    {
      "role": "string",
      "company": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "major": "string",
      "school": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string"
    }
  ],
  "skills": [{
    "category": "string",
    "items": ["string"]
  }],
  "certifications": ["string"],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "bullets": ["string"],
      "link": "string"
    }
  ]
}`;

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

function ensureStringArray(value) {
    if (Array.isArray(value)) return value.filter((item) => typeof item === 'string');
    if (typeof value === 'string' && value.trim()) return [value.trim()];
    return [];
}

function normalizeResumeData(rawData) {
    if (!rawData || typeof rawData !== 'object') return {};

    const normalized = {};

    if (rawData.basics && typeof rawData.basics === 'object') {
        normalized.basics = {
            name: String(rawData.basics.name || '').trim() || undefined,
            headline: ensureStringArray(rawData.basics.headline),
            email: String(rawData.basics.email || '').trim() || undefined,
            phone: String(rawData.basics.phone || '').trim() || undefined,
            location: String(rawData.basics.location || '').trim() || undefined,
            linkedin: String(rawData.basics.linkedin || '').trim() || undefined,
            portfolio: String(rawData.basics.portfolio || '').trim() || undefined,
            summary: String(rawData.basics.summary || '').trim() || undefined,
        };
        Object.keys(normalized.basics).forEach((key) => normalized.basics[key] === undefined && delete normalized.basics[key]);
    }

    if (Array.isArray(rawData.experience)) {
        normalized.experience = rawData.experience
            .filter((item) => item && typeof item === 'object')
            .map((item) => ({
                role: String(item.role || '').trim(),
                company: String(item.company || '').trim(),
                location: String(item.location || '').trim(),
                startDate: String(item.startDate || '').trim(),
                endDate: String(item.endDate || '').trim(),
                bullets: ensureStringArray(item.bullets),
            }))
            .filter((item) => item.role || item.company || item.bullets.length);
    }

    if (Array.isArray(rawData.education)) {
        normalized.education = rawData.education
            .filter((item) => item && typeof item === 'object')
            .map((item) => ({
                degree: String(item.degree || '').trim(),
                major: String(item.major || '').trim(),
                school: String(item.school || '').trim(),
                location: String(item.location || '').trim(),
                startDate: String(item.startDate || '').trim(),
                endDate: String(item.endDate || '').trim(),
            }))
            .filter((item) => item.degree || item.school || item.location);
    }

    if (rawData.skills && typeof rawData.skills === 'object') {
        const skills = {};
        Object.entries(rawData.skills).forEach(([key, value]) => {
            const list = ensureStringArray(value);
            if (list.length) skills[key] = list;
        });
        if (Object.keys(skills).length) normalized.skills = skills;
    }

    if (Array.isArray(rawData.certifications)) {
        const certifications = ensureStringArray(rawData.certifications);
        if (certifications.length) normalized.certifications = certifications;
    }

    if (Array.isArray(rawData.projects)) {
        normalized.projects = rawData.projects
            .filter((item) => item && typeof item === 'object')
            .map((item) => ({
                name: String(item.name || '').trim(),
                description: String(item.description || '').trim(),
                bullets: ensureStringArray(item.bullets),
                link: String(item.link || '').trim() || undefined,
            }))
            .map((item) => {
                if (!item.link) delete item.link;
                return item;
            })
            .filter((item) => item.name || item.description || item.bullets.length);
    }

    Object.keys(normalized).forEach((key) => {
        if (Array.isArray(normalized[key]) && normalized[key].length === 0) delete normalized[key];
        if (typeof normalized[key] === 'object' && normalized[key] && Object.keys(normalized[key]).length === 0) delete normalized[key];
    });

    return normalized;
}

function normalizeAnalysis(raw, resumeText, qualityData) {
    const analysis = raw && typeof raw === 'object' ? raw : {};
    const ats = analysis.atsAnalysis || analysis;
    const score = Math.max(0, Math.min(100, Number(ats.score) || 0));

    const resumeData = normalizeResumeData(analysis.resumeData || analysis.resume || {});
    const atsAnalysis = {
        score,
        verdict: String(ats.verdict || (score >= 80 ? 'Strong ATS foundation' : 'Good foundation with room to improve')),
        role: String(ats.role || 'General professional role'),
        experienceLevel: String(ats.experienceLevel || 'Experienced professional'),
        summary: String(ats.summary || 'Your resume has been reviewed for ATS readability, relevance, and impact.'),
        scoreBreakdown: asArray(ats.scoreBreakdown),
        strengths: asArray(ats.strengths),
        priorityActions: asArray(ats.priorityActions),
        keywords: {
            matched: asArray(ats.keywords?.matched),
            missing: asArray(ats.keywords?.missing),
            duplicates: asArray(ats.keywords?.duplicates),
        },
        grammarIssues: asArray(ats.grammarIssues),
        timeline: asArray(ats.timeline),
        atsTips: asArray(ats.atsTips),
        meta: {
            analyzedAt: new Date().toISOString(),
            wordCount: qualityData?.wordCount || (resumeText.match(/\b\w+\b/g) || []).length,
            provider: ats.meta?.provider || 'AI analysis',
        },
    };

    return {
        resumeData,
        atsAnalysis,
        ...atsAnalysis,
    };
}

async function callGemini(key, prompt) {
    const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
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
        const safeResumeText = typeof resumeText === 'string' ? resumeText : resumeText != null ? String(resumeText) : '';
        const resumeBody = safeResumeText.slice(0, 30000);
        if (!resumeBody.trim()) {
            throw new Error('Empty resume text supplied to AI analysis.');
        }

        const prompt = `Analyze the resume below as an ATS specialist. Infer the most likely role and experience level from the resume itself. Identify duplicate action keywords and replacements, missing role-relevant keywords, specific grammatical issues, and a concise career timeline. Do not invent facts except bullets and skills; use empty arrays when evidence is absent and remove irrelevant content. Tailor resume to achieve High ATS level for the target role. Return JSON matching this schema exactly:
{
  "resumeData": ${RESUME_SCHEMA},
  "atsAnalysis": ${ATS_SCHEMA}
}
Only include fields that are present in the resume. Omit unavailable fields instead of returning null. For the skills section use dynamic category keys with arrays of strings.

Resume:
${resumeBody}`;
        const geminiKeys = getKeys('GEMINI_API_KEYS', 'GEMINI_API_KEY');
        if (!geminiKeys.length) {
            throw new Error('No Gemini API keys configured. Set GEMINI_API_KEYS in .env and restart the server.');
        }

        const analysis = await callGemini(randomItem(geminiKeys), prompt);
        const provider = 'Gemini';

        const normalized = normalizeAnalysis({ ...(analysis || {}), meta: { ...(analysis?.meta || {}), provider } }, resumeText, qualityData);
        if (cache) {
            const resumeDataKey = `task:resumeData:${taskId}`;
            await cache.set(resultKey, JSON.stringify(normalized), 'EX', RESULT_TTL_SECONDS);
            await cache.set(resumeDataKey, JSON.stringify(normalized.resumeData || {}), 'EX', RESULT_TTL_SECONDS);
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
