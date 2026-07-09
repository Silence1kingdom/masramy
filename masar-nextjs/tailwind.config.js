// ملاحظة: يتم استخدام Tailwind v4 مع @tailwindcss/postcss
// إعدادات Tailwind v4 تتم في ملف globals.css مباشرة
// هذا الملف محفوظ للتوافق ولكن الإعدادات الفعلية في app/globals.css

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'cairo': ['Cairo', 'sans-serif'],
      },
    },
  },
}
