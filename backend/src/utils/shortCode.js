import crypto from "crypto";

export const generateShortCode = () => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let shortenedCode = "";
  for (let i = 0; i < 7; i++) {
    const randomIndex = crypto.randomInt(characters.length);
    shortenedCode += characters[randomIndex];
  }
  return shortenedCode;
};
