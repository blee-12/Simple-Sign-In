export const WEBSITE_URL = import.meta.env.VITE_SERVER_URL;

if (!WEBSITE_URL) throw new Error("Missing environent variable SERVER_URL");