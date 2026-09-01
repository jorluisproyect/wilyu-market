# Wilyu Market V7 — Catálogo real en Supabase

## Qué cambia
- Las categorías visibles se cargan desde Supabase.
- Los productos visibles se cargan desde Supabase.
- El administrador crea/edita/elimina productos en Supabase.
- Las fotos seleccionadas desde teléfono/PC se suben a Storage `wilyu-products`.
- La URL pública de la foto se guarda en `product_images`.
- Las categorías nuevas se crean/eliminan en Supabase.

## Probar
1. `npm.cmd install`
2. `npm.cmd run dev`
3. Inicia sesión como administradora.
4. Crea una categoría.
5. Crea un producto con foto.
6. Abre la tienda en otro navegador/dispositivo.

## Nota
Pedidos, métodos de pago, perfiles y proveedores todavía conservan la lógica local mientras los migramos en las próximas fases.
