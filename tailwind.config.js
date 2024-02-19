module.exports = {
    purge: ["./src/**/*.{js,jsx,ts,tsx}", "./dist/popup.html"],
    content: ["./src/**/*.{html,js,tsx}"],
    theme: {
        extend: {
            colors: {
                setting1: "#910A67",
                setting2: "#720455",
                setting3: "#3C0753",
                setting4: "#030637",
            },
            animation: {
                "fade-in": "fadeIn 0.4s ease-out",
                "fade-out": "fadeOut 0.4s ease-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                fadeOut: {
                    "0%": { opacity: "1" },
                    "100%": { opacity: "0.9" },
                },
            },
        },
    },
    plugins: [],
};
