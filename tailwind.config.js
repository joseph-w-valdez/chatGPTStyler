module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./dist/popup.html"],
    theme: {
        extend: {
            colors: {
                surface: {
                    DEFAULT: "var(--surface)",
                    raised: "var(--surface-raised)",
                    elevated: "var(--surface-elevated)",
                },
                edge: "var(--border)",
                chrome: {
                    edge: "var(--chrome-border)",
                },
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
            boxShadow: {
                chrome: "var(--chrome-shadow)",
            },
            backgroundImage: {
                chrome: "var(--chrome)",
                brand: "var(--brand-gradient)",
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
