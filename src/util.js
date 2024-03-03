export const replaceWithRomanNumerals = inputString => {
  return inputString.replace(/[1-5]/g, digit => ['I', 'II', 'III', 'IV', 'V'][digit - 1] || digit);
};

export const getColorMix = (baseColor, fullColor, percentageFull) => {
    // Ensure percentageFull is within the range [0, 100]
    percentageFull = Math.min(100, Math.max(0, percentageFull));

    // Convert percentageFull to a value between 0 and 1
    const percentage = percentageFull / 100;

    // Extract RGB values of baseColor and fullColor
    const [baseRed, baseGreen, baseBlue] = baseColor;
    const [fullRed, fullGreen, fullBlue] = fullColor;

    // Calculate the intermediate color values
    const mixedRed = Math.round(baseRed + (fullRed - baseRed) * percentage);
    const mixedGreen = Math.round(baseGreen + (fullGreen - baseGreen) * percentage);
    const mixedBlue = Math.round(baseBlue + (fullBlue - baseBlue) * percentage);

    // Return the mixed color
    return [mixedRed, mixedGreen, mixedBlue];
};

export const dummy = () => {
    // nothing
};
