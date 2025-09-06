import { LogLevelString } from "../LogLevel";

import {
  getColoredLevel,
  getColoredText,
  getContextColor,
} from "./LogColorizer";
import { formatFilePath, formatTimeEST, truncateFilePath } from "./utils";

// Define column widths
const LINE_WIDTH = 4;
const LEVEL_WIDTH = 7;
const CONTEXT_WIDTH = 25;
const FILE_WIDTH = 90; // Increased from 35 to 50
const TIME_WIDTH = 15;

/**
 * Truncate message if too long (now with more generous width)
 */
const truncateMessage = (message: string): string => {
  const MAX_MESSAGE_WIDTH = 150; // Increased from 100 to 120 for even wider messages
  if (message.length > MAX_MESSAGE_WIDTH) {
    return message.substring(0, MAX_MESSAGE_WIDTH - 3) + "...";
  }
  return message;
};

/**
 * Format log message with two-row layout for better readability
 * Row 1: line number | full-width message
 * Row 2: level | context | filepath | timestamp
 */
export const formatMessage = (
  level: LogLevelString,
  message: string,
  lineNumber: number,
  logLineNumber: number,
  context?: string,
  filePath?: string
): string => {
  const timeStr = formatTimeEST(new Date());
  const contextStr = context || "";

  let fileStr = "";
  if (filePath && lineNumber) {
    const formattedPath = formatFilePath(filePath);
    fileStr = `${formattedPath}:${lineNumber}`;
  }

  const truncatedMessage = truncateMessage(message);
  const truncatedFilePath = truncateFilePath(fileStr, FILE_WIDTH);

  // Get consistent color for this context
  const contextColor = getContextColor(contextStr);

  // Row 1: Line number | Full-width message
  const lineCol = getColoredText(
    logLineNumber.toString().padStart(LINE_WIDTH),
    "gray"
  );
  const messageCol = getColoredText(truncatedMessage, contextColor);
  const row1 = `${lineCol} | ${messageCol}`;

  // Row 2: Level | Context | File | Time
  const levelCol = getColoredLevel(level, LEVEL_WIDTH);
  const contextCol = getColoredText(
    contextStr.padEnd(CONTEXT_WIDTH),
    contextColor
  );
  const fileCol = getColoredText(truncatedFilePath.padEnd(FILE_WIDTH), "blue");
  const timeCol = getColoredText(timeStr.padEnd(TIME_WIDTH), "gray");

  const row2 = `${levelCol} | ${contextCol} | ${fileCol} | ${timeCol}`;

  return `${row1}\n${row2}`;
};
