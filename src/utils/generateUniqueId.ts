export default function generateUniqueId() {
  const randomHexadecimalValue = () => Math.random().toString(16).slice(2).padEnd(13, '0');

  return `${randomHexadecimalValue()}-${randomHexadecimalValue()}`;
}
