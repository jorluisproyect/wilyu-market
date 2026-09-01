# Wilyu Market

Full-stack multi-category e-commerce platform built for a real reseller / on-demand sales business model.

**Live demo:** https://wilyu-market.netlify.app

## Overview

Wilyu Market was designed to let a reseller sell products from multiple suppliers without depending on a traditional inventory model. The platform combines a public storefront, customer accounts, guest checkout, multi-currency pricing, order tracking and a protected administration panel connected to Supabase.

## Main Features

- Responsive storefront for desktop, tablet and mobile
- Dynamic product catalog and categories
- Products available, by order, sold out or hidden
- Private product cost management
- Automatic 30% profit calculation or custom margin / final price
- Supplier management
- Product image upload with Supabase Storage
- USD base pricing with EUR, VES and USDT references
- Configurable payment methods
- Guest checkout
- Optional customer registration
- Email-confirmed accounts through Supabase Auth
- Saved customer profile data
- Purchase history
- Admin role validation
- Order management
- Public order tracking by unique `WY-...` code
- Visual delivery status route
- WhatsApp integration
- PDF-style order receipt workflow
- Row Level Security policies in Supabase
- Netlify production deployment

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- CSS
- Lucide React

### Backend & Data
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Row Level Security (RLS)

### Deployment
- Netlify

## Database Model

The production backend uses tables for:

- `profiles`
- `categories`
- `products`
- `product_images`
- `providers`
- `payment_methods`
- `currency_rates`
- `orders`
- `order_items`
- `store_settings`

Product photos are stored in the `wilyu-products` Supabase Storage bucket.

## Business Logic

A product can have a private acquisition cost and an automatic margin. Example:

```text
Cost: $10.00
Margin: 30%
Sale price: $13.00
```

The administrator can also choose a custom percentage or final selling price.

Orders can move through the following workflow:

```text
Pedido recibido
→ Pago confirmado
→ Solicitando productos
→ Preparando
→ En camino
→ Entregado
```

Customers can track an order with its unique code without exposing private order data.

## Local Development

Create a `.env.local` file using `.env.example` as reference:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then run:

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Security

- No `service_role` key is used in the frontend.
- Admin access is validated through the `profiles.role` field.
- Database operations are protected by Supabase RLS policies.
- Product images are public for reading, while upload/update/delete operations are restricted to authenticated administrators.
- Secrets and local environment files are excluded from Git.

## Project Goal

This project demonstrates the complete process of turning real business requirements into a deployed full-stack product: requirements analysis, UI/UX, frontend development, data modeling, authentication, authorization, storage, pricing logic, order workflows and production deployment.

---

Developed as a real-world e-commerce case study by Jorge Luis Añanguren.
