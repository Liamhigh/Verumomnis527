import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    root: "apps/web",
    plugins: [react()],
    resolve: {
        alias: {
            "@verum/core": path.resolve(__dirname, "packages/core/src"),
        },
    },
    server: {
        fs: {
            allow: [path.resolve(__dirname)]
        }
    },
    define: {
        // forward your env if you need it client-side
        "process.env.API_KEY": JSON.stringify(process.env.VITE_API_KEY || ""),
    },
});
