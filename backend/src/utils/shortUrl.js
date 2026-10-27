export const buildShortUrl = (shortCode) =>
  `${process.env.APP_BASE_URL}/${shortCode}`;
