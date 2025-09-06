import { getColoredText } from "./LogColorizer";

const isDevelopment = __DEV__;
let headerPrinted = false;
let lineCounter = 0;

const printHeader = (): void => {
  if (!headerPrinted && isDevelopment) {
    const LINE_WIDTH = 4;
    const LEVEL_WIDTH = 7;
    const CONTEXT_WIDTH = 25;
    const FILE_WIDTH = 90; // Increased from 35 to 50
    const TIME_WIDTH = 15;

    // Row 1 header: LINE | MESSAGE
    const lineCol = getColoredText("LINE".padEnd(LINE_WIDTH), "gray");
    const messageCol = getColoredText("MESSAGE", "white");
    const row1Header = `${lineCol} | ${messageCol}`;

    // Row 2 header: LEVEL | CONTEXT | FILE:LINE | TIME
    const levelCol = getColoredText("LEVEL".padEnd(LEVEL_WIDTH), "white");
    const contextCol = getColoredText(
      "CONTEXT".padEnd(CONTEXT_WIDTH),
      "magenta"
    );
    const fileCol = getColoredText("FILE:LINE".padEnd(FILE_WIDTH), "blue");
    const timeCol = getColoredText("TIME".padEnd(TIME_WIDTH), "gray");
    const row2Header = `${levelCol} | ${contextCol} | ${fileCol} | ${timeCol}`;

    console.log("=".repeat(130));
    console.log(row1Header);
    console.log(row2Header);
    console.log("-".repeat(130));
    headerPrinted = true;
  }
};

export const write = (formattedMessage: string, data?: any): void => {
  printHeader();
  lineCounter++;

  // The formattedMessage now contains a newline, so we need to handle it properly
  if (data) {
    // Split the formatted message and add data to the first line
    const lines = formattedMessage.split("\n");
    console.log(lines[0], data);
    if (lines[1]) {
      console.log(lines[1]);
    }
  } else {
    console.log(formattedMessage);
  }

  console.log(""); // Add newline after each log entry
};

export const getLineCounter = (): number => lineCounter;
