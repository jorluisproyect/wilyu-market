-- =========================================================
-- WILYU MARKET - DATA API GRANTS
-- Ejecutar UNA VEZ en Supabase SQL Editor
-- RLS ya está activo, estos GRANT solo permiten que Data API
-- alcance las tablas y luego RLS decide qué filas puede usar.
-- =========================================================

grant usage on schema public to anon, authenticated;

-- Lectura pública donde ya existen políticas RLS públicas
grant select on public.categories to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.product_images to anon, authenticated;
grant select on public.payment_methods to anon, authenticated;
grant select on public.currency_rates to anon, authenticated;
grant select on public.store_settings to anon, authenticated;

-- Perfiles: solo usuarios autenticados; RLS limita al propio perfil/admin
grant select, update on public.profiles to authenticated;

-- Proveedores: solo admin autenticado; RLS aplica public.is_admin()
grant select, insert, update, delete on public.providers to authenticated;

-- Administración de catálogo: RLS deja escribir solo al admin
grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.product_images to authenticated;
grant insert, update, delete on public.payment_methods to authenticated;
grant insert, update, delete on public.currency_rates to authenticated;
grant insert, update, delete on public.store_settings to authenticated;

-- Pedidos: invitado/usuario puede crear; lectura privada según RLS
grant insert on public.orders to anon, authenticated;
grant select on public.orders to authenticated;
grant update, delete on public.orders to authenticated;

grant insert on public.order_items to anon, authenticated;
grant select, update, delete on public.order_items to authenticated;

-- RPC público de seguimiento
grant execute on function public.track_order(text) to anon, authenticated;

-- service_role mantiene acceso completo (backend futuro)
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
