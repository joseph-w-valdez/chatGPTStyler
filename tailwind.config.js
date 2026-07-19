module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./dist/popup.html"],
    theme: {
        extend: {
            colors: {
                surface: {
                    DEFAULT: "var(--surface)",
                    raised: "var(--surface-raised)",
                },
                edge: "var(--border)",
                ink: {
                    DEFAULT: "var(--text)",
                    muted: "var(--text-muted)",
                },
                accent: {
                    DEFAULT: "var(--accent)",
                    contrast: "var(--accent-contrast)",
                },
                danger: {
                    DEFAULT: "var(--danger)",
                    contrast: "var(--danger-contrast)",
                },
                success: "var(--success)",
            },
            animation: {
                "fade-in": "fadeIn 0.4s ease-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
            },
        },
    },
    plugins: [],
};
