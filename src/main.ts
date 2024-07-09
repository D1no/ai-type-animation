/**
 * Typing Effect with Braille Loading Animation
 *
 * Author:
 * Dino Scheidt <github@din.ooo>
 * and ChatGPT
 *
 * Description:
 * This code creates a typing effect in the terminal with a unique Braille character loading animation.
 * It simulates the appearance of text being typed out character by character, while also displaying
 * a stream of Braille characters ahead of the current typing position. These Braille characters give
 * the impression of loading or resolving into the final text.
 *
 * The effect is designed to be visually appealing and dynamic, incorporating random delays and varying
 * intensities for the Braille characters to make the animation more natural and engaging.
 *
 * How It Works:
 * 1. The text to be displayed is split into lines based on the terminal width, ensuring that words are not
 *    broken apart by finding the last space character within the line width.
 * 2. For each line, the typing effect is applied character by character, with a random number of Braille
 *    characters displayed ahead of the current typing position.
 * 3. The speed of the typing effect varies over the course of the text, with an acceleration factor that
 *    increases speed in the middle of the text and slows down at the beginning and end.
 * 4. An overshoot animation is applied at the end of the text, where extra Braille characters are displayed
 *    and then removed one by one.
 * 5. The terminal cursor is hidden during the animation and shown again at the end.
 *
 * Use Case:
 * This code is ideal for creating visually engaging terminal presentations or demos where a dynamic
 * typing effect is needed. It can be used to display messages, simulate a typing experience, or create
 * interactive terminal animations.
 *
 * Critical Aspects:
 * 1. **Typing Speed Variation**: The typing speed is dynamically adjusted using a quadratic acceleration
 *    factor to create a natural variation in speed.
 * 2. **Braille Character Loading**: A random number of Braille characters are displayed ahead of the typing
 *    position with varying intensities to simulate a loading effect.
 * 3. **Overshoot Animation**: Extra Braille characters are displayed at the end of the text and then removed
 *    one by one to conceal the true length of the text until the very end.
 * 4. **Word Integrity**: The text is split into lines without breaking words, ensuring a clean and readable
 *    display.
 *
 * Limitations:
 * 1. The animation assumes a fixed-width terminal and may not adapt well to resizing during the animation.
 * 2. Very long texts may result in longer loading times due to the complexity of the animation.
 * 3. The code relies on specific terminal capabilities (e.g., cursor hiding and showing) that may not be
 *    supported in all environments.
 *
 * This implementation was developed iteratively through a series of conversations, refining the logic,
 * improving readability, and enhancing features to achieve the desired effect. The use of TypeScript types
 * and comments ensures that the code is maintainable and understandable, making it easier to extend or
 * modify in the future.
 */

import chalk from "npm:chalk@5.3.0";
import { getRandomBrailleCharacter, keyboardLayout, similarBrailleMap } from "./keyboard.ts";

/**
 * Represents the configuration options for the typing effect.
 */
interface TypingEffectConfig {
	/**
	 * Base delay in milliseconds for each key stroke.
	 */
	baseDelay: number;
	/**
	 * Jitter factor for randomizing the delay between key strokes.
	 */
	jitter: number;
	/**
	 * Influence of keyboard layout on typing speed; time it takes a finger to move from one key to another.
	 */
	keyboardInfluence: number;
	/**
	 * Delay per key distance in milliseconds the time it takes to move from one key to another.
	 */
	keyDelay: number;
	/**
	 * Maximum number of Braille characters that should be animated ahead of the current typing position.
	 */
	brailleAhead: number;
	/**
	 * Minimum number of Braille characters ahead of the current typing position.
	 */
	minBrailleAhead: number;
	/**
	 * Number of Braille characters to overshoot when the text is fully typed to hide the true length.
	 */
	overshoot: number;
	/**
	 * Minimum delay for the contraction phase in milliseconds removing each overshot braille character.
	 */
	minContractionDelay: number;
	/**
	 * Maximum delay for the contraction phase in milliseconds removing each overshot braille character.
	 */
	maxContractionDelay: number;
	/**
	 * Minimum acceleration multiplier over text length dependent on the position within the text and a polynomial function.
	 */
	minAccelerationMultiplier: number;
	/**
	 * Maximum acceleration multiplier over text length	dependent on the position within the text and a polynomial function.
	 */
	maxAccelerationMultiplier: number;
}

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
function normalizeKeyDistanceDelay(distance: number, delayPerKeyDistance: TypingEffectConfig["keyDelay"]): number {
	return distance * delayPerKeyDistance;
}

/**
 * Returns a random delay with jitter (variation).
 */
function getRandomDelay(
	baseDelay: TypingEffectConfig["baseDelay"],
	jitter: TypingEffectConfig["jitter"] = 0.6,
): number {
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

/**
 * Handles the typing effect with Braille loading for a single line.
 */
async function typingLineEffectWithBrailleLoading(
	text: string,
	config: TypingEffectConfig,
	isLastLine: boolean,
	totalLength: number,
	lineStartPosition: number,
): Promise<void> {
	let previousChar = "";

	// Transform the text into Braille characters to display ahead of the typing position
	const brailleText = text.split("").map((char) => similarBrailleMap[char] || char);

	// Initialize the display text array with spaces and account for overshoot if it's the last line
	const displayText = Array(text.length + (isLastLine ? config.overshoot : 0)).fill(" ");

	// Get the terminal width to ensure the text fits within the terminal boundaries
	const terminalWidth = Deno.consoleSize().columns;

	for (let i = 0; i < text.length + (isLastLine ? config.overshoot : 0); i++) {
		const contractionDelay =
			Math.floor(Math.random() * (config.maxContractionDelay - config.minContractionDelay + 1)) +
			config.minContractionDelay;

		// Calculate the acceleration factor based on the position within the entire text
		const accelerationFactor = calculateAccelerationFactor(lineStartPosition + i, totalLength);

		let accelerationMultiplier = 0;

		if (config.minAccelerationMultiplier !== 0 && config.maxAccelerationMultiplier !== 0) {
			accelerationMultiplier =
				Math.floor(Math.random() * (config.maxAccelerationMultiplier - config.minAccelerationMultiplier + 1)) +
				config.minAccelerationMultiplier;
		}

		// Adjust the base delay using the acceleration factor and multiplier to vary the typing speed
		const adjustedBaseDelay = config.baseDelay * (1 - accelerationFactor * accelerationMultiplier);

		if (i < text.length) {
			// Calculate the number of Braille characters to display ahead of the current typing position
			const ahead = Math.floor(Math.random() * (config.brailleAhead - config.minBrailleAhead + 1)) +
				config.minBrailleAhead;

			// Update the display text with Braille characters ahead, applying random fading for a dynamic effect
			for (let j = i + 1; j <= i + ahead && j < text.length + (isLastLine ? config.overshoot : 0); j++) {
				if (j < text.length) {
					displayText[j] = fadeChar(brailleText[j], Math.random());
				} else {
					// Add overshoot Braille characters beyond the text length
					displayText[j] = fadeChar(getRandomBrailleCharacter(), Math.random());
				}
			}

			// Set the current character in the display text array
			const char = text[i];
			displayText[i] = char;
		} else if (isLastLine) {
			// Randomize the fade intensity for remaining overshot Braille characters during contraction
			for (let k = text.length; k < text.length + config.overshoot - (i - text.length); k++) {
				displayText[k] = fadeChar(getRandomBrailleCharacter(), Math.random());
			}

			// Print the updated display text
			const output = `\r${displayText.join("")}`;
			Deno.stdout.writeSync(new TextEncoder().encode(output));

			// Wait for the contraction delay before removing the next overshoot character
			await new Promise((resolve) => setTimeout(resolve, contractionDelay));

			// Remove the last overshoot character one by one
			displayText[text.length + config.overshoot - (i - text.length) - 1] = " ";
		}

		// Print the display text with the current state of the typing animation
		const output = `\r${displayText.join("")}`;
		Deno.stdout.writeSync(new TextEncoder().encode(output));

		if (i < text.length) {
			// Calculate the delay based on the distance between the current and previous character
			const distance = previousChar ? getKeyDistance(previousChar, text[i]) : 1;
			const keyDistanceDelay = normalizeKeyDistanceDelay(distance, config.keyDelay) * config.keyboardInfluence;
			const delay = getRandomDelay(adjustedBaseDelay + keyDistanceDelay, config.jitter);

			// Update the previous character to the current one
			previousChar = text[i];

			// Wait for the calculated delay before typing the next character
			await new Promise((resolve) => setTimeout(resolve, delay));
		} else if (isLastLine) {
			// Wait for the contraction delay after completing the text typing
			await new Promise((resolve) => setTimeout(resolve, contractionDelay));
		}
	}

	// Ensure the cursor is moved to the right edge and print the final text to ensure the last character is displayed correctly
	Deno.stdout.writeSync(new TextEncoder().encode(`\r${text.padEnd(terminalWidth)}\n`));
}

/**
 * Handles the typing effect with Braille loading for the entire text.
 */
async function typingEffectWithBrailleLoading(
	text: string,
	config: TypingEffectConfig,
	/**
	 * Clear the console on run to see only the animation.
	 */
	clearConsole: boolean = false,
): Promise<void> {
	// Hide the terminal cursor during the animation
	hideCursor();

	if (clearConsole) {
		console.clear();
	}

	// Get the terminal width to ensure the text fits within the terminal boundaries
	const terminalWidth = Deno.consoleSize().columns;
	const lines = [];

	// Split the text into lines without breaking words
	let start = 0;
	while (start < text.length) {
		// Determine the end of the current line, taking the terminal width and overshoot into account
		let end = Math.min(start + terminalWidth - config.overshoot, text.length);

		// Adjust the end position to the last space character to avoid breaking words
		if (end < text.length && text[end] !== " ") {
			const lastSpace = text.lastIndexOf(" ", end);
			if (lastSpace > start) {
				end = lastSpace;
			}
		}

		// Add the current line to the lines array
		lines.push(text.slice(start, end));

		// Move the start position to the next character after the current line
		start = end + 1;
	}

	// Apply the typing effect line by line
	for (let i = 0; i < lines.length; i++) {
		const isLastLine = i === lines.length - 1;
		const lineStartPosition = i * (terminalWidth - config.overshoot);

		// Execute the typing effect for the current line
		await typingLineEffectWithBrailleLoading(
			lines[i],
			config,
			isLastLine,
			text.length,
			lineStartPosition,
		);
	}

	// Show the terminal cursor after the animation is complete
	showCursor();
}

async function main() {
	const text =
		"Hello, this is a typing effect demo with a long text that should be resilient to line breaks and ensure that the animation works correctly. "
			.repeat(5).trim();

	const config: TypingEffectConfig = {
		baseDelay: 10, // Base delay in milliseconds
		jitter: 3, // Jitter factor
		keyboardInfluence: 0.3, // How much the keyboard layout influences the typing speed
		keyDelay: 30, // Delay per key distance in milliseconds
		brailleAhead: 16, // Maximum number of Braille characters ahead
		minBrailleAhead: 1, // Minimum number of Braille characters ahead
		overshoot: 7, // Number of Braille characters to overshoot
		minContractionDelay: 1, // Min Delay for the contraction phase in milliseconds
		maxContractionDelay: 20, // Max Delay for the contraction phase in milliseconds
		minAccelerationMultiplier: 0.1, // Min Acceleration multiplier over text length
		maxAccelerationMultiplier: 6, // Max Acceleration multiplier over text length
	};

	await typingEffectWithBrailleLoading(text, config, true);
}

if (import.meta.main) {
	main();
}
