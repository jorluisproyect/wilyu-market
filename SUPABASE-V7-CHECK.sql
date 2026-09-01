-- Verifica catálogo remoto
select id, name, emoji, active from public.categories order by name;
select id, name, sale_price, status, created_at from public.products order by created_at desc;
