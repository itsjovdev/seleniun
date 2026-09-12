import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssTypography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        brand: {
          blue: "hsl(var(--brand-blue))",
          purple: "hsl(var(--brand-purple))",
        },
        gradient: {
          foreground: "hsl(var(--gradient-foreground))",
        },
        ocean: {
          950: "#03045E",
          900: "#023E8A",
          700: "#0077B6",
          600: "#0096C7",
          500: "#00B4D8",
          400: "#48CAE4",
          300: "#90E0EF",
          200: "#ADE8F4",
          100: "#CAF0F8",
          50: "#E8F8FD",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        sans: ["Inter Variable", "Inter", "system-ui", "sans-serif"],
        heading: ["Poppins", "Inter Variable", "system-ui", "sans-serif"],
      },
      // ✅ Tailwind Typography con tipado TS safe
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": theme("colors.zinc.700"),
            "--tw-prose-headings": theme("colors.zinc.900"),
            "--tw-prose-links": theme("colors.blue.700"),
            "--tw-prose-bold": theme("colors.zinc.900"),
            "--tw-prose-counters": theme("colors.zinc.600"),
            "--tw-prose-bullets": theme("colors.zinc.400"),
            "--tw-prose-hr": theme("colors.zinc.200"),
            "--tw-prose-quotes": theme("colors.zinc.900"),
            "--tw-prose-quote-borders": theme("colors.zinc.200"),
            "--tw-prose-captions": theme("colors.zinc.500"),
          },
        },
        invert: {
          css: {
            "--tw-prose-body": theme("colors.zinc.300"),
            "--tw-prose-headings": theme("colors.white"),
            "--tw-prose-links": theme("colors.blue.400"),
            "--tw-prose-bold": theme("colors.white"),
            "--tw-prose-counters": theme("colors.zinc.400"),
            "--tw-prose-bullets": theme("colors.zinc.600"),
            "--tw-prose-hr": theme("colors.zinc.700"),
            "--tw-prose-quotes": theme("colors.zinc.100"),
            "--tw-prose-quote-borders": theme("colors.zinc.700"),
            "--tw-prose-captions": theme("colors.zinc.400"),
          },
        },
      }),
    },
  },
  plugins: [tailwindcssAnimate, tailwindcssTypography],
} satisfies Config;
