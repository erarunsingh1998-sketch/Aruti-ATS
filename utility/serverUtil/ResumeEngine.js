export function isValidResume(parsedFileText){
    if (typeof parsedFileText !== "string") return false;

    const text = parsedFileText.trim();
    if (text.length < 50) return false;

    const words = text.match(/[a-zA-Z][a-zA-Z'-]*/g);
    if (!words || words.length < 10) return false;

    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    if (letters / text.length < 0.45) return false;

    const resumeSignals = [
        /\b(?:resume|curriculum vitae|cv)\b/i,
        /\b(?:experience|employment|work history|professional history)\b/i,
        /\b(?:education|academic|qualification)\b/i,
        /\b(?:skills|technical skills|competencies)\b/i,
        /\b(?:projects|certifications|achievements|references|objective|summary|profile)\b/i,
        /\b(?:email|phone|mobile|linkedin|github)\b/i,
    ];

    let signalCount = 0;
    for (const signal of resumeSignals) {
        if (signal.test(text)) signalCount++;
    }

    return signalCount >= 2;
}
