const fs = require('fs');
const path = require('path');

const root = process.cwd();
const appPath = path.join(root, 'src', 'App.tsx');
const apiPath = path.join(root, 'src', 'lib', 'wilyuApi.ts');

function fail(msg){
  console.error('\n❌ ' + msg);
  console.error('No se modificó el proyecto.');
  process.exit(1);
}

if(!fs.existsSync(appPath) || !fs.existsSync(apiPath)){
  fail('Ejecuta este archivo dentro de C:\\Proyectos\\Wilyu-Market-Git');
}

let app = fs.readFileSync(appPath,'utf8');
let api = fs.readFileSync(apiPath,'utf8');

if(app.includes("type AdminTab='dashboard'|'products'|'orders'|'history'")){
  console.log('ℹ️ La actualización V2 parece estar aplicada ya.');
} else {
  // 1) import deleteOrderRemote
  if(!app.includes('deleteOrderRemote')){
    app = app.replace(
      /trackOrder,\s*signUp,\s*getProfile,\s*updateProfile,\s*getAuthUser/,
      'trackOrder, signUp, getProfile, updateProfile, getAuthUser, deleteOrderRemote'
    );
  }

  // 2) AdminTab
  app = app.replace(
    /type AdminTab='dashboard'\|'products'\|'orders'\|'categories'\|'providers'\|'payments'\|'currencies'/,
    "type AdminTab='dashboard'|'products'|'orders'|'history'|'categories'|'providers'|'payments'|'currencies'"
  );

  // 3) mapOrder complete remote metadata
  const mapStart = app.indexOf('function mapOrder(row:any):Order{');
  const ratesStart = app.indexOf('function ratesFromRows', mapStart);
  if(mapStart < 0 || ratesStart < 0) fail('No encontré mapOrder/ratesFromRows en App.tsx');

  const newMap = `function mapOrder(row:any):Order{
 return {
  id:row.order_code,
  customerName:row.customer_name,
  phone:row.phone,
  address:row.address||'',
  notes:row.notes||'',
  items:(row.order_items||[]).map((i:any)=>({
   productId:i.product_id||'',
   quantity:Number(i.quantity||1),
   productName:i.product_name||'Producto',
   unitPrice:Number(i.unit_price||0),
   lineTotal:Number(i.line_total||0)
  })) as any,
  total:Number(row.total||0),
  status:row.status,
  createdAt:row.created_at,
  ...({
   remoteId:row.id,
   paymentMethodId:row.payment_method_id||'',
   paymentReference:row.payment_reference||'',
   paymentStatus:row.payment_status||''
  } as any)
 }
}
`;
  app = app.slice(0,mapStart) + newMap + app.slice(ratesStart);

  // 4) Admin body routes
  const oldOrdersRender = /else if\(tab==='orders'\)body=<Orders orders=\{orders\} setOrders=\{setOrders\} remote=\{remote\}\/>/;
  if(!oldOrdersRender.test(app)) fail('No encontré la ruta actual de Pedidos');
  app = app.replace(
    oldOrdersRender,
    "else if(tab==='orders')body=<Orders orders={orders} setOrders={setOrders} products={products} payments={payments} remote={remote}/>\n else if(tab==='history')body=<Orders orders={orders} setOrders={setOrders} products={products} payments={payments} remote={remote} history/>"
  );

  // 5) Dashboard route prop
  app = app.replace(
    /else body=<Dashboard products=\{products\} orders=\{orders\}\/>/,
    "else body=<Dashboard products={products} orders={orders} goOrders={()=>setTab('orders')}/>"
  );

  // 6) Sidebar: insert history after Pedidos
  const navOrders = "{nav('orders','Pedidos',<ClipboardList/>)}";
  if(!app.includes(navOrders)) fail('No encontré la opción Pedidos del menú');
  app = app.replace(
    navOrders,
    navOrders + "{nav('history','Histórico de pedidos',<History/>)}"
  );

  // 7) Dashboard clickable card, robust minimal changes
  app = app.replace(
    /function Dashboard\(\{products,orders\}:any\)/,
    'function Dashboard({products,orders,goOrders}:any)'
  );

  // make Pedidos stat clickable when recognizable
  app = app.replace(
    /<div className="stat-card"><ClipboardList\/><div><span>Pedidos<\/span><strong>\{orders\.length\}<\/strong><\/div><\/div>/,
    '<button type="button" className="stat-card" onClick={goOrders} style={{cursor:\'pointer\',textAlign:\'left\',border:\'none\',width:\'100%\'}} title="Ir a pedidos"><ClipboardList/><div><span>Pedidos</span><strong>{orders.filter((o:Order)=>o.status!==\'delivered\').length}</strong><small style={{display:\'block\',marginTop:4}}>Ver pedidos →</small></div></button>'
  );

  // 8) Replace complete Orders component
  const ordersStart = app.indexOf('function Orders(');
  const categoriesStart = app.indexOf('function Categories(', ordersStart);
  if(ordersStart < 0 || categoriesStart < 0) fail('No encontré los componentes Orders/Categories');

  const newOrders = `function Orders({orders,setOrders,products,payments,remote,history=false}:any){
 const [loading,setLoading]=useState(false)
 const [openId,setOpenId]=useState<string|null>(null)

 const refresh=async()=>{
  if(!remote)return
  setLoading(true)
  const r=await adminGetOrders()
  if(!r.error)setOrders((r.data||[]).map(mapOrder))
  else alert('No se pudieron cargar los pedidos: '+r.error.message)
  setLoading(false)
 }

 useEffect(()=>{refresh()},[remote])

 const visible=(orders as Order[]).filter((o:Order)=>history?o.status==='delivered':o.status!=='delivered')

 const change=async(o:Order,s:OrderStatus)=>{
  if(remote){
   let rowId=(o as any).remoteId
   if(!rowId){
    const all=await adminGetOrders()
    rowId=(all.data||[]).find((x:any)=>x.order_code===o.id)?.id
   }
   if(!rowId){alert('No se encontró el pedido.');return}
   const r=await updateOrderStatus(rowId,s)
   if(r.error){alert('No se pudo cambiar el estado: '+r.error.message);return}
  }
  setOrders((xs:Order[])=>xs.map(x=>x.id===o.id?{...x,status:s}:x))
  alert('✅ Estado del pedido actualizado.')
 }

 const remove=async(o:Order)=>{
  if(!confirm('¿Eliminar definitivamente el pedido '+o.id+'? Esta acción no se puede deshacer.'))return
  if(remote){
   let rowId=(o as any).remoteId
   if(!rowId){
    const all=await adminGetOrders()
    rowId=(all.data||[]).find((x:any)=>x.order_code===o.id)?.id
   }
   if(!rowId){alert('No se encontró el pedido.');return}
   const r=await deleteOrderRemote(rowId)
   if(r.error){alert('No se pudo eliminar el pedido: '+r.error.message);return}
  }
  setOrders((xs:Order[])=>xs.filter(x=>x.id!==o.id))
  alert('✅ Pedido eliminado.')
 }

 const payName=(o:Order)=>{
  const id=(o as any).paymentMethodId
  return payments?.find((p:PaymentMethod)=>p.id===id)?.name||'No disponible'
 }
 const productName=(item:any)=>item.productName||products?.find((p:Product)=>p.id===item.productId)?.name||'Producto'
 const unitPrice=(item:any)=>{
  const stored=Number(item.unitPrice||0)
  if(stored>0)return stored
  return Number(products?.find((p:Product)=>p.id===item.productId)?.salePrice||0)
 }

 return <><div className="admin-page-head"><div>
  <span className="mini-title">{history?'PEDIDOS FINALIZADOS':'PEDIDOS ACTIVOS'} · {remote?'SUPABASE':'LOCAL'}</span>
  <h1>{history?'Histórico de pedidos':'Pedidos'}</h1>
  <p>{history?'Aquí se conservan los pedidos marcados como Entregado.':'Haz clic en Ver detalle para revisar exactamente qué pidió cada cliente.'}</p>
 </div><button className="secondary-button" onClick={refresh}><RefreshCcw size={17}/> Actualizar</button></div>

 {loading?<div className="mini-empty">Cargando pedidos...</div>:
 visible.length===0?<div className="mini-empty">{history?'Todavía no hay pedidos finalizados.':'No hay pedidos activos.'}</div>:
 <div className="order-admin-grid">{visible.map((o:Order)=>{
  const expanded=openId===o.id
  return <article className="admin-panel order-card" key={o.id}>
   <div className="order-card-head">
    <div><strong>{o.id}</strong><span>{o.customerName} · {o.phone}</span><small>{new Date(o.createdAt).toLocaleString('es-VE')}</small></div>
    <b>{money(o.total)}</b>
   </div>

   <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'end'}}>
    <label style={{flex:'1 1 230px'}}>Estado
     <select value={o.status} onChange={e=>change(o,e.target.value as OrderStatus)}>
      {steps.map(s=><option value={s} key={s}>{orderText[s]}</option>)}
     </select>
    </label>
    <button className="edit-button" onClick={()=>setOpenId(expanded?null:o.id)} style={{cursor:'pointer'}}>
     <Eye size={17}/> {expanded?'Ocultar detalle':'Ver detalle'}
    </button>
    <button className="delete-button-small" onClick={()=>remove(o)} style={{cursor:'pointer'}}>
     <Trash2 size={17}/> Eliminar
    </button>
   </div>

   {expanded&&<div style={{marginTop:18,borderTop:'1px solid #e5e7eb',paddingTop:18}}>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,marginBottom:18}}>
     <div><small>Número de pedido</small><strong style={{display:'block'}}>{o.id}</strong></div>
     <div><small>Fecha y hora</small><strong style={{display:'block'}}>{new Date(o.createdAt).toLocaleString('es-VE')}</strong></div>
     <div><small>Cliente</small><strong style={{display:'block'}}>{o.customerName}</strong></div>
     <div><small>WhatsApp</small><strong style={{display:'block'}}>{o.phone}</strong></div>
     <div><small>Dirección / zona</small><strong style={{display:'block'}}>{o.address||'No indicada'}</strong></div>
     <div><small>Método de pago</small><strong style={{display:'block'}}>{payName(o)}</strong></div>
     <div><small>Referencia</small><strong style={{display:'block'}}>{(o as any).paymentReference||'No indicada'}</strong></div>
     <div><small>Total</small><strong style={{display:'block'}}>{money(o.total)}</strong></div>
    </div>

    <h3 style={{margin:'0 0 10px'}}>Productos solicitados</h3>
    <div style={{display:'grid',gap:8}}>
     {(o.items as any[]).map((item:any,index:number)=>{
      const price=unitPrice(item)
      const subtotal=Number(item.lineTotal||price*Number(item.quantity||1))
      return <div key={index} style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) auto auto',gap:14,alignItems:'center',padding:'11px 0',borderBottom:'1px solid #f0f0f0'}}>
       <div><strong>{productName(item)}</strong></div>
       <span>{item.quantity} × {money(price)}</span>
       <strong>{money(subtotal)}</strong>
      </div>
     })}
    </div>

    {o.notes&&<div style={{marginTop:14,padding:12,background:'#f8fafc',borderRadius:10}}>
     <small>Notas del cliente</small><p style={{margin:'5px 0 0'}}>{o.notes}</p>
    </div>}
   </div>}
  </article>
 })}</div>}
 </>
}

`;
  app = app.slice(0,ordersStart) + newOrders + app.slice(categoriesStart);

  // 9) API delete
  if(!api.includes('export async function deleteOrderRemote')){
    api += `

export async function deleteOrderRemote(id:string){
 const itemsRes=await supabase.from('order_items').delete().eq('order_id',id)
 if(itemsRes.error)return {data:null,error:itemsRes.error}

 const orderRes=await supabase.from('orders').delete().eq('id',id).select().single()
 if(orderRes.error)return {data:null,error:orderRes.error}

 return {data:orderRes.data,error:null}
}
`;
  }
}

// HARD verification before writing
const checks = [
  ["AdminTab history", app.includes("'history'|'categories'")],
  ["Histórico menú", app.includes('Histórico de pedidos')],
  ["Ver detalle", app.includes('Ver detalle')],
  ["Pedidos activos", app.includes('PEDIDOS ACTIVOS')],
  ["Ruta history", app.includes("tab==='history'")],
  ["deleteOrderRemote import/use", app.includes('deleteOrderRemote')],
  ["API deleteOrderRemote", api.includes('export async function deleteOrderRemote')],
  ["Detalle paymentReference", app.includes('paymentReference')]
];

const failed = checks.filter(([,ok])=>!ok);
if(failed.length){
  failed.forEach(([name])=>console.error('❌ Falta verificación:',name));
  fail('La V2 no pasó las verificaciones internas.');
}

const stamp = new Date().toISOString().replace(/[:.]/g,'-');
fs.copyFileSync(appPath, appPath+'.backup-v2-'+stamp);
fs.copyFileSync(apiPath, apiPath+'.backup-v2-'+stamp);
fs.writeFileSync(appPath,app,'utf8');
fs.writeFileSync(apiPath,api,'utf8');

console.log('\n✅ WILYU PEDIDOS V2 APLICADO');
console.log('✅ Histórico de pedidos');
console.log('✅ Ver detalle');
console.log('✅ Cambio de estado');
console.log('✅ Eliminar pedido');
console.log('✅ Datos de pago y referencia');
console.log('✅ Productos, cantidades, precios y subtotales');
console.log('\nAhora ejecuta:');
console.log('npm.cmd run build');
console.log('\nDespués verifica con:');
console.log('Select-String -Path src\\App.tsx -Pattern "Histórico de pedidos","Ver detalle","PEDIDOS ACTIVOS"');
