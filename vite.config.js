import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Project Pages live at https://imsumeet.github.io/Portfolio/
  base: command === "build" ? "/Portfolio/" : "/",
  plugins: [react()],
  assetsInclude: ["**/*.fbx", "**/*.glb"],
}));
