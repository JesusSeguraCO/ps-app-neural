import type { Config } from "tailwindcss";
import preset from "@ps/ui/tailwind.preset";

const config: Config = {
  presets: [preset],
  content: ["./app/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
};

export default config;
