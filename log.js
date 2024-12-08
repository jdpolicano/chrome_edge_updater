export const getLogger = (prefix) => {
  return (...msg) => console.log(`[${prefix}]`, ...msg);
};
