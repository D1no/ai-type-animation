import chalk from "npm:chalk@5.3.0";

/**
 * Key positions of a QWERTY keyboard layout.
 */
const keyboardLayout: { [key: string]: [number, number] } = {
	"a": [0, 0],
	"b": [4, 1],
	"c": [2, 1],
	"d": [2, 0],
	"e": [2, -1],
	"f": [3, 0],
	"g": [4, 0],
	"h": [5, 0],
	"i": [7, -1],
	"j": [6, 0],
	"k": [7, 0],
	"l": [8, 0],
	"m": [6, 1],
	"n": [5, 1],
	"o": [8, -1],
	"p": [9, -1],
	"q": [0, -1],
	"r": [3, -1],
	"s": [1, 0],
	"t": [4, -1],
	"u": [6, -1],
	"v": [3, 1],
	"w": [1, -1],
	"x": [1, 1],
	"y": [5, -1],
	"z": [0, 1],
	" ": [5, 2],
	".": [9, 1],
	",": [8, 1],
	"!": [10, -2],
	"?": [10, 1],
	"A": [0, 0],
	"B": [4, 1],
	"C": [2, 1],
	"D": [2, 0],
	"E": [2, -1],
	"F": [3, 0],
	"G": [4, 0],
	"H": [5, 0],
	"I": [7, -1],
	"J": [6, 0],
	"K": [7, 0],
	"L": [8, 0],
	"M": [6, 1],
	"N": [5, 1],
	"O": [8, -1],
	"P": [9, -1],
	"Q": [0, -1],
	"R": [3, -1],
	"S": [1, 0],
	"T": [4, -1],
	"U": [6, -1],
	"V": [3, 1],
	"W": [1, -1],
	"X": [1, 1],
	"Y": [5, -1],
	"Z": [0, 1],
	"0": [9, 2],
	"1": [0, 2],
	"2": [1, 2],
	"3": [2, 2],
	"4": [3, 2],
	"5": [4, 2],
	"6": [5, 2],
	"7": [6, 2],
	"8": [7, 2],
	"9": [8, 2],
	"@": [9, -2],
	"#": [10, -1],
	"$": [11, -1],
	"%": [12, -1],
	"^": [13, -1],
	"&": [14, -1],
	"*": [15, -1],
	"(": [16, -1],
	")": [17, -1],
	"-": [18, -1],
	"_": [19, -1],
	"=": [20, -1],
	"+": [21, -1],
	"[": [22, -1],
	"]": [23, -1],
	"{": [24, -1],
	"}": [25, -1],
	"|": [26, -1],
	"\\": [27, -1],
	";": [28, -1],
	":": [29, -1],
	"'": [30, -1],
	'"': [31, -1],
	"<": [32, -1],
	">": [33, -1],
	"/": [34, -1],
	"~": [35, -1],
	"`": [36, -1],
};

const similarBrailleMap: { [key: string]: string } = {
	"a": "⠁",
	"b": "⠃",
	"c": "⠉",
	"d": "⠙",
	"e": "⠑",
	"f": "⠋",
	"g": "⠛",
	"h": "⠓",
	"i": "⠇",
	"j": "⠚",
	"k": "⠅",
	"l": "⠇",
	"m": "⠍",
	"n": "⠝",
	"o": "⠕",
	"p": "⠏",
	"q": "⠟",
	"r": "⠗",
	"s": "⠎",
	"t": "⠞",
	"u": "⠥",
	"v": "⠧",
	"w": "⠺",
	"x": "⠭",
	"y": "⠽",
	"z": "⠵",
	"A": "⠁",
	"B": "⠃",
	"C": "⠉",
	"D": "⠙",
	"E": "⠑",
	"F": "⠋",
	"G": "⠛",
	"H": "⠓",
	"I": "⠇",
	"J": "⠚",
	"K": "⠅",
	"L": "⠇",
	"M": "⠍",
	"N": "⠝",
	"O": "⠕",
	"P": "⠏",
	"Q": "⠟",
	"R": "⠗",
	"S": "⠎",
	"T": "⠞",
	"U": "⠥",
	"V": "⠧",
	"W": "⠺",
	"X": "⠭",
	"Y": "⠽",
	"Z": "⠵",
	"0": "⠴",
	"1": "⠂",
	"2": "⠆",
	"3": "⠒",
	"4": "⠲",
	"5": "⠢",
	"6": "⠖",
	"7": "⠶",
	"8": "⠦",
	"9": "⠔",
	"@": "⠈",
	"#": "⠼",
	"$": "⠫",
	"%": "⠩",
	"^": "⠘",
	"&": "⠯",
	"*": "⠡",
	"(": "⠣",
	")": "⠜",
	"-": "⠤",
	"_": "⠌",
	"=": "⠿",
	"+": "⠬",
	"[": "⠷",
	"]": "⠾",
	"{": "⠮",
	"}": "⠻",
	"|": "⠳",
	"\\": "⠧",
	";": "⠌",
	":": "⠱",
	"'": "⠄",
	'"': "⠐",
	"<": "⠣",
	">": "⠜",
	"/": "⠸",
	"~": "⠼",
	"`": "⠂",
	".": "⠨",
	",": "⠠",
	"!": "⠖",
	"?": "⠦",
	" ": "⠿",
};

function KeyLoadingAsBraille(text: string): string {
	return text.split("").map((char) => similarBrailleMap[char] || char).join("");
}

function getKeyDistance(key1: string, key2: string): number {
	const pos1 = keyboardLayout[key1.toLowerCase()];
	const pos2 = keyboardLayout[key2.toLowerCase()];
	if (!pos1 || !pos2) return 1; // Default distance if key not found
	return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2));
}

function normalizeKeyDistanceDelay(distance: number, delayPerKeyDistance: number): number {
	return distance * delayPerKeyDistance;
}

function getRandomDelay(baseDelay: number, jitter: number = 0.6): number {
	const variance = baseDelay * jitter;
	return baseDelay + Math.random() * variance - variance / 2;
}

/**
 * Fades the text to white based on the intensity.
 */
function fadeChar(text: string, inensity: number, minRange: number = 0, maxRange: number = 255): string {
	const from = minRange;
	const to = maxRange;

	const rgbValue = Math.floor(from + (to - from) * inensity);

	return chalk.rgb(rgbValue, rgbValue, rgbValue)(text);
}

async function typingEffectWithBrailleLoading(
	text: string,
	baseDelay: number,
	jitter: number = 0.6,
	keyboardInfluence: number = 1,
	keyDelay: number = 10,
	brailleAhead: number = 10,
	minBrailleAhead: number = 6,
): Promise<void> {
	let previousChar = "";
	let brailleText = text.split("").map((char) => similarBrailleMap[char] || char);
	let displayText = Array(text.length).fill(" ");

	for (let i = 0; i < text.length; i++) {
		// Calculate the number of Braille characters ahead
		let ahead = Math.floor(Math.random() * (brailleAhead - minBrailleAhead + 1)) + minBrailleAhead;

		// Update the display text with Braille characters ahead with random fading
		for (let j = i + 1; j <= i + ahead && j < text.length; j++) {
			displayText[j] = fadeChar(brailleText[j], Math.random());
		}

		// Typing effect for the current character
		const char = text[i];
		displayText[i] = char;

		// Print the display text
		const output = `\r${displayText.join("")}`;
		Deno.stdout.writeSync(new TextEncoder().encode(output));

		const distance = previousChar ? getKeyDistance(previousChar, char) : 1;
		const keyDistanceDelay = normalizeKeyDistanceDelay(distance, keyDelay) * keyboardInfluence;
		const delay = getRandomDelay(baseDelay + keyDistanceDelay, jitter);
		previousChar = char;
		await new Promise((resolve) => setTimeout(resolve, delay));
	}

	// Print the final text to ensure the last character is displayed correctly
	Deno.stdout.writeSync(new TextEncoder().encode(`\r${text}\n`));
}

async function main() {
	const text = "Hello, this is a typing effect demo!";
	const baseDelay = 100; // Base delay in milliseconds
	const jitter = 0.6; // Jitter factor
	const keyboardInfluence = 0.8; // How much the keyboard layout influences the typing speed
	const delayPerKeyDistance = 30; // Delay per key distance in milliseconds
	const brailleAhead = 10; // Maximum number of Braille characters ahead
	const minBrailleAhead = 6; // Minimum number of Braille characters ahead

	await typingEffectWithBrailleLoading(
		text,
		baseDelay,
		jitter,
		keyboardInfluence,
		delayPerKeyDistance,
		brailleAhead,
		minBrailleAhead,
	);
}

if (import.meta.main) {
	main();
}
