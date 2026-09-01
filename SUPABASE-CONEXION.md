# Wilyu Market V6

Esta versión ya contiene el cliente oficial de Supabase y prueba la conexión real al iniciar.

## Ejecutar
npm.cmd install
npm.cmd run dev

Si todo está bien, en escritorio aparece una pequeña etiqueta `Online`.

## Importante
La tienda todavía conserva localStorage como respaldo mientras migramos cada módulo.
La siguiente fase es mover Productos/Categorías primero, luego Auth, Pedidos y Storage.

## Si aparece “Sin conexión”
Ejecuta `SUPABASE-GRANTS.sql` en SQL Editor.
El proyecto fue creado con la exposición automática de tablas desactivada, por lo que las tablas necesitan privilegios explícitos para el Data API.
