/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // REE Brand Colors - Green & Blue
                primary: {
                    50: '#e6f7f5',
                    100: '#b3e6df',
                    200: '#80d5c9',
                    300: '#4dc4b3',
                    400: '#1ab39d',
                    500: '#16a085',  // Main green
                    600: '#138d73',
                    700: '#107a61',
                    800: '#0d674f',
                    900: '#0a543d',
                },
                secondary: {
                    50: '#e3f2fd',
                    100: '#bbdefb',
                    200: '#90caf9',
                    300: '#64b5f6',
                    400: '#42a5f5',
                    500: '#2196f3',  // Main blue
                    600: '#1e88e5',
                    700: '#1976d2',
                    800: '#1565c0',
                    900: '#0d47a1',
                },
            },
        },
    },
    plugins: [],
}
