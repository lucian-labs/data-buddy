// `crypto` is a global in browsers (secure contexts) and in Node >= 19, but this
// package compiles against lib: ES2015 with no DOM types, so it is declared here.
declare const crypto:
  | { randomUUID?: () => string }
  | undefined;

const randomHex = (length: number): string => {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += Math.floor(Math.random() * 16).toString(16);
  }
  return out;
};

export const uuidGen = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // RFC 4122 v4 layout: the third group starts with the version nibble 4 and the
  // fourth group starts with one of the variant nibbles 8, 9, a or b.
  const variant = (8 + Math.floor(Math.random() * 4)).toString(16);

  return [
    randomHex(8),
    randomHex(4),
    "4" + randomHex(3),
    variant + randomHex(3),
    randomHex(12),
  ].join("-");
};
