export const generateDeviceHash = (input = '') => {
  return Array.from(input)
    .reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0)
    .toString(16);
};
