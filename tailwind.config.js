module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./dist/popup.html"],
    theme: {
        extend: {
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
