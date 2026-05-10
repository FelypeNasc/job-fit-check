const pad = (n: number) => String(n).padStart(2, '0');

const timestamp = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const logger = {
  info: (category: string, message: string) =>
    console.log(`[${timestamp()}] [${category}] ${message}`),
  warn: (category: string, message: string) =>
    console.warn(`[${timestamp()}] [WARN:${category}] ${message}`),
  error: (category: string, message: string) =>
    console.error(`[${timestamp()}] [ERROR:${category}] ${message}`),
};
