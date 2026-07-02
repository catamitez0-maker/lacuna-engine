import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "../../packages/ui-kit/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111318",
        paper: "#f7f5ef",
        rule: "#d9d4ca",
        signal: "#2563eb",
        ember: "#b45309",
        moss: "#3f6212",
      },
    },
  },
  plugins: [],
};

export default config;
