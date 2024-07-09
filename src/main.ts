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

/**
 * Calculates an acceleration factor based on the position within the text.
 */
function calculateAccelerationFactor(position: number, length: number): number {
	const normalizedPosition = position / length;
	const accelerationFactor = 1 - Math.pow(2 * normalizedPosition - 1, 2); // Quadratic function
	return accelerationFactor;
}

async function typingLineEffectWithBrailleLoading(
	text: string,
	baseDelay: number,
	jitter: number,
	keyboardInfluence: number,
	keyDelay: number,
	brailleAhead: number,
	minBrailleAhead: number,
	overshoot: number,
	minContractionDelay: number,
	maxContractionDelay: number,
	isLastLine: boolean,
	totalLength: number,
	lineStartPosition: number,
	minAccelerationMultiplier: number = 0,
	maxAccelerationMultiplier: number = 0,
): Promise<void> {
	let previousChar = "";
	const brailleText = text.split("").map((char) => similarBrailleMap[char] || char);
	const displayText = Array(text.length + (isLastLine ? overshoot : 0)).fill(" ");
	const terminalWidth = Deno.consoleSize().columns;

	for (let i = 0; i < text.length + (isLastLine ? overshoot : 0); i++) {
		const contractionDelay = Math.floor(Math.random() * (maxContractionDelay - minContractionDelay + 1)) +
			minContractionDelay;

		// Calculate the acceleration factor based on the position within the entire text
		const accelerationFactor = calculateAccelerationFactor(lineStartPosition + i, totalLength);

		let accelerationMultiplier = 0;

		if (minAccelerationMultiplier !== 0 && maxAccelerationMultiplier !== 0) {
			accelerationMultiplier =
				Math.floor(Math.random() * (maxAccelerationMultiplier - minAccelerationMultiplier + 1)) +
				minAccelerationMultiplier;
		}

		const adjustedBaseDelay = baseDelay * (1 - accelerationFactor * accelerationMultiplier);

		if (i < text.length) {
			// Calculate the number of Braille characters ahead
			const ahead = Math.floor(Math.random() * (brailleAhead - minBrailleAhead + 1)) + minBrailleAhead;

			// Update the display text with Braille characters ahead with random fading
			for (let j = i + 1; j <= i + ahead && j < text.length + (isLastLine ? overshoot : 0); j++) {
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
		} else if (isLastLine) {
			// Randomize the fade intensity for remaining overshot Braille characters
			for (let k = text.length; k < text.length + overshoot - (i - text.length); k++) {
				displayText[k] = fadeChar(getRandomBrailleCharacter(), Math.random());
			}

			// Print the updated display text
			const output = `\r${displayText.join("")}`;
			Deno.stdout.writeSync(new TextEncoder().encode(output));
			await new Promise((resolve) => setTimeout(resolve, contractionDelay));

			// Contract the overshoot characters one by one
			displayText[text.length + overshoot - (i - text.length) - 1] = " ";
		}

		// Print the display text
		const output = `\r${displayText.join("")}`;
		Deno.stdout.writeSync(new TextEncoder().encode(output));

		if (i < text.length) {
			const distance = previousChar ? getKeyDistance(previousChar, text[i]) : 1;
			const keyDistanceDelay = normalizeKeyDistanceDelay(distance, keyDelay) * keyboardInfluence;
			const delay = getRandomDelay(adjustedBaseDelay + keyDistanceDelay, jitter);
			previousChar = text[i];
			await new Promise((resolve) => setTimeout(resolve, delay));
		} else if (isLastLine) {
			await new Promise((resolve) => setTimeout(resolve, contractionDelay));
		}
	}

	// Ensure the cursor is moved to the right edge and print the final text to ensure the last character is displayed correctly
	Deno.stdout.writeSync(new TextEncoder().encode(`\r${text.padEnd(terminalWidth)}\n`));
}

async function typingEffectWithBrailleLoading(
	text: string,
	baseDelay: number,
	jitter: number,
	keyboardInfluence: number,
	keyDelay: number,
	brailleAhead: number,
	minBrailleAhead: number,
	overshoot: number,
	minContractionDelay: number,
	maxContractionDelay: number,
	minAccelerationMultiplier: number = 0,
	maxAccelerationMultiplier: number = 0,
): Promise<void> {
	hideCursor();
	const terminalWidth = Deno.consoleSize().columns;
	const lines = [];

	let start = 0;
	while (start < text.length) {
		let end = Math.min(start + terminalWidth - overshoot, text.length);
		if (end < text.length && text[end] !== " ") {
			const lastSpace = text.lastIndexOf(" ", end);
			if (lastSpace > start) {
				end = lastSpace;
			}
		}
		lines.push(text.slice(start, end));
		start = end + 1;
	}

	for (let i = 0; i < lines.length; i++) {
		const isLastLine = i === lines.length - 1;
		const lineStartPosition = i * (terminalWidth - overshoot);
		await typingLineEffectWithBrailleLoading(
			lines[i],
			baseDelay,
			jitter,
			keyboardInfluence,
			keyDelay,
			brailleAhead,
			minBrailleAhead,
			overshoot,
			minContractionDelay,
			maxContractionDelay,
			isLastLine,
			text.length,
			lineStartPosition,
			minAccelerationMultiplier,
			maxAccelerationMultiplier,
		);
	}
	showCursor();
}

async function main() {
	const text =
		"Hello, this is a typing effect demo with a long text that should be resilient to line breaks and ensure that the animation works correctly."
			.repeat(7);
	const baseDelay = 10; // Base delay in milliseconds
	const jitter = 3; // Jitter factor
	const keyboardInfluence = 0.3; // How much the keyboard layout influences the typing speed
	const delayPerKeyDistance = 30; // Delay per key distance in milliseconds
	const brailleAhead = 16; // Maximum number of Braille characters ahead
	const minBrailleAhead = 1; // Minimum number of Braille characters ahead
	const overshoot = 3; // Number of Braille characters to overshoot
	const minContractionDelay = 30; // Min Delay for the contraction phase in milliseconds
	const maxContractionDelay = 60; // Max Delay for the contraction phase in milliseconds
	const minAccelerationMultiplier = 0.1; // Min Acceleration multiplier over text length
	const maxAccelerationMultiplier = 6; // Max Acceleration multiplier over text length

	await typingEffectWithBrailleLoading(
		text,
		baseDelay,
		jitter,
		keyboardInfluence,
		delayPerKeyDistance,
		brailleAhead,
		minBrailleAhead,
		overshoot,
		minContractionDelay,
		maxContractionDelay,
		minAccelerationMultiplier,
		maxAccelerationMultiplier,
	);
}

if (import.meta.main) {
	main();
}
