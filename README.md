# uniserve-frontend

## Scripts
- `yarn dev` - local development server (`http://localhost:3000`)
- `yarn build` - production build
- `yarn lint` - lint check
- `yarn test` - placeholder test command

## How to debug HomePage
1. `yarn dev` ni ishga tushiring.
2. Browserda `http://localhost:3000` oching.
3. DevTools `Console` bo'limida quyidagi loglarni tekshiring:
- `HOME_RAW`: API'dan kelgan xom javoblar.
- `HOME_NORMALIZED`: `NormalizedListing[]` ko'rinishiga keltirilgan listlar.
- `HOME_RENDER_IDS`: renderga kirayotgan `id/kind/href` juftliklari.
4. Card linklarida `product -> /products/:id`, `service -> /services/:id` ekanini tekshiring.
5. Kartalarni yonma-yon solishtirish uchun dev rejimida `http://localhost:3000/?compareCards=1` dan foydalaning.

Eslatma: bu loglar faqat development muhitida ishlaydi (`NODE_ENV !== "production"`).
