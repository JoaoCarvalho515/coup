import { NextResponse } from 'next/server';

// Store recently used codes in memory (per server instance)
const recentCodes = new Set<string>();
const RECENT_CODES_LIMIT = 100;

function generateCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

export async function GET() {
    let attempts = 0;
    const maxAttempts = 50; // More attempts since we have 26^4 = 456,976 possible codes

    while (attempts < maxAttempts) {
        const code = generateCode();

        // Check if code was recently used
        if (!recentCodes.has(code)) {
            // Add to recent codes set
            recentCodes.add(code);

            // Limit the size of recent codes set
            if (recentCodes.size > RECENT_CODES_LIMIT) {
                const firstCode = recentCodes.values().next().value;
                if (firstCode) {
                    recentCodes.delete(firstCode);
                }
            }

            return NextResponse.json({ code });
        }

        attempts++;
    }

    // Fallback: generate a timestamp-based code with 4 characters
    const timestamp = Date.now().toString(36).toUpperCase();
    const fallbackCode = timestamp.slice(-4).padStart(4, 'A');

    return NextResponse.json({ code: fallbackCode });
}
