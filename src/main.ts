import chalk from "npm:chalk@5.3.0";
import { getRandomBrailleCharacter, keyboardLayout, similarBrailleMap } from "./keyboard.ts";

/**
 * Returns the Euclidean distance between two keys on the keyboard.
 */
function getKeyDistance(key1: string, key2: string): number {
	const pos1 = keyboardLayout[key1.toLowerCase()];
	const pos2 = keyboardLayout[key2.toLowerCase()];
	if (!pos1 || !pos2) return 1; // Default distance if key not found
	return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2));
}

/**
 * Normalizes the key distance to a delay factor.
 */
function normalizeKeyDistanceDelay(distance: number, delayPerKeyDistance: number): number {
	return distance * delayPerKeyDistance;
}

/**
 * Returns a random delay with jitter (variation).
 */
function getRandomDelay(baseDelay: number, jitter: number = 0.6): number {
	const variance = baseDelay * jitter;
	return baseDelay + Math.random() * variance - variance / 2;
}

/**
 * Fades the text to white based on the intensity.
 */
function fadeChar(text: string, intensity: number, minRange: number = 0, maxRange: number = 255): string {
	const from = minRange;
	const to = maxRange;
	const rgbValue = Math.floor(from + (to - from) * intensity);
	return chalk.rgb(rgbValue, rgbValue, rgbValue)(text);
}

/**
 * Hides the terminal cursor.
 */
function hideCursor(): void {
	Deno.stdout.writeSync(new TextEncoder().encode("\x1b[?25l"));
}

/**
 * Shows the terminal cursor.
 */
function showCursor(): void {
	Deno.stdout.writeSync(new TextEncoder().encode("\x1b[?25h"));
}

async function typingEffectWithBrailleLoading(
	text: string,
	baseDelay: number,
	jitter: number = 0.6,
	keyboardInfluence: number = 1,
	keyDelay: number = 10,
	brailleAhead: number = 10,
	minBrailleAhead: number = 6,
	overshoot: number = 5,
): Promise<void> {
	hideCursor();

	let previousChar = "";
	const brailleText = text.split("").map((char) => similarBrailleMap[char] || char);
	const displayText = Array(text.length + overshoot).fill(" ");
	const terminalWidth = Deno.consoleSize().columns;

	for (let i = 0; i < text.length + overshoot; i++) {
		if (i < text.length) {
			// Calculate the number of Braille characters ahead
			const ahead = Math.floor(Math.random() * (brailleAhead - minBrailleAhead + 1)) + minBrailleAhead;

			// Update the display text with Braille characters ahead with random fading
			for (let j = i + 1; j <= i + ahead && j < text.length + overshoot; j++) {
				if (j < text.length) {
					displayText[j] = fadeChar(brailleText[j], Math.random());
				} else {
					// Overshoot Braille characters beyond the text length
					displayText[j] = fadeChar(getRandomBrailleCharacter(), Math.random());
				}
			}

			// Typing effect for the current character
			const char = text[i];
			displayText[i] = char;
		} else {
			// Contract the overshoot characters
			displayText[text.length + overshoot - (i - text.length) - 1] = " ";
		}

		// Print the display text
		const output = `\r${displayText.join("")}`;
		Deno.stdout.writeSync(new TextEncoder().encode(output));

		if (i < text.length) {
			const distance = previousChar ? getKeyDistance(previousChar, text[i]) : 1;
			const keyDistanceDelay = normalizeKeyDistanceDelay(distance, keyDelay) * keyboardInfluence;
			const delay = getRandomDelay(baseDelay + keyDistanceDelay, jitter);
			previousChar = text[i];
			await new Promise((resolve) => setTimeout(resolve, delay));
		} else {
			await new Promise((resolve) => setTimeout(resolve, baseDelay));
		}
	}

	// Ensure the cursor is moved to the right edge and print the final text to ensure the last character is displayed correctly
	Deno.stdout.writeSync(new TextEncoder().encode(`\r${text.padEnd(terminalWidth)}\n`));
	showCursor();
}

async function main() {
	const text = "Hello, this is a typing effect demo!";
	const baseDelay = 20; // Base delay in milliseconds
	const jitter = 0.6; // Jitter factor
	const keyboardInfluence = 0.8; // How much the keyboard layout influences the typing speed
	const delayPerKeyDistance = 20; // Delay per key distance in milliseconds
	const brailleAhead = 16; // Maximum number of Braille characters ahead
	const minBrailleAhead = 2; // Minimum number of Braille characters ahead
	const overshoot = 20; // Number of Braille characters to overshoot

	await typingEffectWithBrailleLoading(
		text,
		baseDelay,
		jitter,
		keyboardInfluence,
		delayPerKeyDistance,
		brailleAhead,
		minBrailleAhead,
		overshoot,
	);
}

if (import.meta.main) {
	main();
}
