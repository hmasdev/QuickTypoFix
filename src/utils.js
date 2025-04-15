const MASK_THRESHOLD = 12; // 12 characters or less API keys are masked

function getApiKeyPreview(apiKey) {
    if (apiKey === undefined || apiKey === null) {
        return '(not set)';
    } else if (apiKey === '') {
        return '(empty string)';
    } else if (apiKey.length <= MASK_THRESHOLD) {
        // Mask short keys with * (only the number of characters is known)
        // NOTE: it may be safe because too short keys are invalid for API
        return '*'.repeat(apiKey.length);
    } else {
        // Show only the first and last 3 characters (the middle is omitted)
        return apiKey.slice(0, 3) + '...' + apiKey.slice(-3);
    }
}

module.exports = {
    getApiKeyPreview,
};
