# Public Profile Sharing Architecture

## 1. Overview
The Public Profile Sharing module (PH-2.12) gives Promoters and Businesses the ability to quickly distribute their public `B2P Connect` footprint via standard links and custom QR Codes.

## 2. API Endpoints
- `GET /api/v1/share/profile`: Evaluates the current user's profile state and generates a static slug `(e.g., /b/nike or /p/alexa)` returning it alongside a fully assembled public URL string.

## 3. QR Code Strategy
- To reduce backend processing load and avoid storing thousands of tiny PNG files in our database, **QR Codes are generated entirely on the client side** using `qrcode.react`. 
- When a user downloads the QR code, the browser converts the `<svg>` object into a `<canvas>`, injects `B2P Connect` branding, and downloads it locally as a PNG.

## 4. Public Profile SEO
The frontend React architecture prepares public slugs `/p/{slug}` and `/b/{slug}`. Future deployments utilizing Next.js, SSR, or Cloudflare Workers can read these URLs and automatically inject `<meta property="og:title">` tags into the document head to render rich link previews on Twitter, iMessage, and LinkedIn.

## 5. Deployment Considerations
Because this is currently a Client-Side Rendered (CSR) Vite app, native SEO crawlers might not execute the JavaScript needed to fetch profile details. Transitioning the public profiles to Server-Side Rendering (SSR) is highly recommended for production launch.
