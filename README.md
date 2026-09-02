# Wilyu Market V2

## Incluye
- Carga de fotos desde teléfono o PC.
- Costo privado + 30% automático / margen personalizado / precio final.
- Métodos de pago configurables por la administradora.
- Pago Móvil, transferencia, PayPal, Binance/USDT u otros.
- Moneda base USD y equivalencias EUR, VES y USDT.
- Tasas manuales y botón de actualización online de referencia.
- Seguimiento "Ve tu pedido" con código y ruta animada.
- Estados: recibido, pago confirmado, solicitando productos, preparando, en camino y entregado.
- WhatsApp conectado a +58 412-5427074.
- PDF tipo nota de pedido/entrega descargado al registrar el pedido.
- Panel responsive.

## Ejecutar
En PowerShell:

npm.cmd install
npm.cmd run dev

## Importante
Esta V2 guarda datos e imágenes localmente en el navegador para pruebas. Para que la clienta administre desde cualquier teléfono o laptop y los clientes vean el mismo catálogo/estatus, el siguiente paso es conectar Supabase Database + Storage + Auth.

La tasa online incluida es una referencia pública. Antes de producción conviene mover la consulta de tasas al backend y validar VES contra una fuente oficial/confiable; además se debe guardar la tasa usada al momento de cada pedido.

PayPal y Binance automáticos requieren integración segura del lado del servidor. Nunca coloques secretos o API keys dentro del frontend React.


## V3
- Precio en bolívares destacado en tarjetas de productos, detalle, carrito y checkout.
- La tienda intenta actualizar USD→EUR y USD→VES automáticamente al abrir, si la última actualización tiene más de 6 horas.
- La administradora mantiene la opción de actualizar manualmente o introducir una tasa manual.
- USDT se mantiene 1:1 con USD como referencia en esta versión.


## V4 — cuentas opcionales de clientes
- Registro opcional de comprador.
- Inicio/cierre de sesión.
- Perfil con nombre, correo, teléfono y dirección.
- Checkout autocompletado para clientes registrados.
- Historial de pedidos asociado al perfil.
- Compra como invitado sigue disponible.
- En esta versión de prueba las cuentas se guardan en localStorage.
- Para producción se debe migrar la autenticación a Supabase Auth y los perfiles a la base de datos.


## V5 — registro visible
- Botón explícito “Iniciar sesión” en escritorio.
- Botón explícito “Regístrate” en escritorio.
- Opciones visibles también en el menú móvil.
- Bloque promocional en Inicio con beneficios del registro.
- Acceso directo a registro o login según el botón seleccionado.
- Una vez autenticado, el acceso cambia a “Mi cuenta”.
