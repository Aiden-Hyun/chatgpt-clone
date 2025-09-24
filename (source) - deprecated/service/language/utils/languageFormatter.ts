/**
 * Format a translation string by replacing variables
 * @param text The translation string with {variable} placeholders
 * @param variables Object containing variables to replace
 * @returns The formatted string
 */
export const formatTranslation = (
  text: string,
  variables: Record<string, string>
): string => {
  let formattedText = text;
  
  // Replace each variable placeholder with its value
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    formattedText = formattedText.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return formattedText;
};
