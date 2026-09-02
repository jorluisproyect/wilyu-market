const fs=require('fs'),path=require('path');
const appFile=path.join(process.cwd(),'src','App.tsx');
const apiFile=path.join(process.cwd(),'src','lib','wilyuApi.ts');
if(!fs.existsSync(appFile)||!fs.existsSync(apiFile)){console.error('Ejecuta este archivo dentro de C:\\Proyectos\\Wilyu-Market');process.exit(1)}
let app=fs.readFileSync(appFile,'utf8'),api=fs.readFileSync(apiFile,'utf8');
const stamp=Date.now();fs.copyFileSync(appFile,appFile+'.backup-orders-'+stamp);fs.copyFileSync(apiFile,apiFile+'.backup-orders-'+stamp);
function rep(a,b,label){if(!app.includes(a)){console.error('No encontré: '+label);process.exit(1)}app=app.replace(a,b);console.log('OK '+label)}

rep("trackOrder, signUp, getProfile, updateProfile, getAuthUser","trackOrder, signUp, getProfile, updateProfile, getAuthUser, deleteOrderRemote","import deleteOrderRemote");
rep("type AdminTab='dashboard'|'products'|'orders'|'categories'|'providers'|'payments'|'currencies'","type AdminTab='dashboard'|'products'|'orders'|'history'|'categories'|'providers'|'payments'|'currencies'","tab history");

rep(`function mapOrder(row:any):Order{
 return {
  id:row.order_code,
  customerName:row.customer_name,
  phone:row.phone,
  address:row.address||'',
  notes:row.notes||'',
  items:(row.order_items||[]).map((i:any)=>({productId:i.product_id||'',quantity:Number(i.quantity||1)})),
  total:Number(row.total||0),
  status:row.status,
  createdAt:row.created_at
 }
}`,`function mapOrder(row:any):Order{
 return {
  id:row.order_code,
  customerName:row.customer_name,
  phone:row.phone,
  address:row.address||'',
  notes:row.notes||'',
  items:(row.order_items||[]).map((i:any)=>({productId:i.product_id||'',quantity:Number(i.quantity||1),productName:i.product_name||'Producto',unitPrice:Number(i.unit_price||0),lineTotal:Number(i.line_total||0)})) as any,
  total:Number(row.total||0),
  status:row.status,
  createdAt:row.created_at,
  ...({remoteId:row.id,paymentMethodId:row.payment_method_id||'',paymentReference:row.payment_reference||'',paymentStatus:row.payment_status||''} as any)
 }
}`,"map order detallado");

rep("else if(tab==='orders')body=<Orders orders={orders} setOrders={setOrders} remote={remote}/>\n else if(tab==='categories')",
"else if(tab==='orders')body=<Orders orders={orders} setOrders={setOrders} products={products} payments={payments} remote={remote}/>\n else if(tab==='history')body=<Orders orders={orders} setOrders={setOrders} products={products} payments={payments} remote={remote} history/>\n else if(tab==='categories')","rutas pedidos");

rep("else body=<Dashboard products={products} orders={orders}/>","else body=<Dashboard products={products} orders={orders} goOrders={()=>setTab('orders')}/>","dashboard pedidos");

rep("{nav('dashboard','Resumen',<LayoutDashboard/>)}{nav('products','Productos',<Boxes/>)}{nav('orders','Pedidos',<ClipboardList/>)}{nav('categories','Categorías',<Tags/>)}}",
"{nav('dashboard','Resumen',<LayoutDashboard/>)}{nav('products','Productos',<Boxes/>)}{nav('orders','Pedidos',<ClipboardList/>)}{nav('history','Histórico de pedidos',<History/>)}{nav('categories','Categorías',<Tags/>)}}","nav histórico");

const dStart=app.indexOf("function Dashboard({products,orders}:any){");
const dEnd=app.indexOf("function Products(",dStart);
if(dStart<0||dEnd<0){console.error('No encontré Dashboard');process.exit(1)}
app=app.slice(0,dStart)+`function Dashboard({products,orders,goOrders}:any){
 const activeOrders=orders.filter((o:Order)=>o.status!=='delivered')
 return <><div className="admin-page-head"><div><span className="mini-title">Hoy</span><h1>Resumen</h1></div></div><div className="stats-grid"><div className="stat-card"><Boxes/><div><span>Productos</span><strong>{products.length}</strong></div></div><button type="button" className="stat-card" onClick={goOrders} style={{cursor:'pointer',textAlign:'left',border:'none',width:'100%'}} title="Ir a pedidos"><ClipboardList/><div><span>Pedidos</span><strong>{activeOrders.length}</strong><small style={{display:'block',marginTop:4}}>Ver pedidos →</small></div></button><div className="stat-card"><DollarSign/><div><span>Ventas</span><strong>{money(orders.reduce((a:number,o:Order)=>a+o.total,0))}</strong></div></div><div className="stat-card"><TrendingUp/><div><span>Activos</span><strong>{products.filter((p:Product)=>p.status!=='hidden').length}</strong></div></div></div></>
}
`+app.slice(dEnd);
console.log('OK dashboard clicable');

const oStart=app.indexOf("function Orders({orders,setOrders,remote}:any){");
const oEnd=app.indexOf("function Categories(",oStart);
if(oStart<0||oEnd<0){console.error('No encontré Orders');process.exit(1)}
const orders=`function Orders({orders,setOrders,products,payments,remote,history=false}:any){
 const[loading,setLoading]=useState(false)
 const[openId,setOpenId]=useState<string|null>(null)
 const refresh=async()=>{if(!remote)return;setLoading(true);const r=await adminGetOrders();if(!r.error)setOrders((r.data||[]).map(mapOrder));else alert('No se pudieron cargar los pedidos: '+r.error.message);setLoading(false)}
 useEffect(()=>{refresh()},[remote])
 const visible=(orders as Order[]).filter((o:Order)=>history?o.status==='delivered':o.status!=='delivered')
 const change=async(o:Order,s:OrderStatus)=>{if(remote){let rowId=(o as any).remoteId;if(!rowId){const all=await adminGetOrders();rowId=(all.data||[]).find((x:any)=>x.order_code===o.id)?.id}if(!rowId){alert('No se encontró el pedido.');return}const r=await updateOrderStatus(rowId,s);if(r.error){alert('No se pudo cambiar el estado: '+r.error.message);return}}setOrders((x:Order[])=>x.map(a=>a.id===o.id?{...a,status:s}:a));alert('✅ Estado del pedido actualizado con éxito.')}
 const remove=async(o:Order)=>{if(!confirm('¿Eliminar definitivamente el pedido '+o.id+'?'))return;if(remote){let rowId=(o as any).remoteId;if(!rowId){const all=await adminGetOrders();rowId=(all.data||[]).find((x:any)=>x.order_code===o.id)?.id}if(!rowId){alert('No se encontró el pedido.');return}const r=await deleteOrderRemote(rowId);if(r.error){alert('No se pudo eliminar: '+r.error.message);return}}setOrders((x:Order[])=>x.filter(a=>a.id!==o.id));alert('✅ Pedido eliminado con éxito.')}
 const paymentName=(o:Order)=>payments?.find((p:PaymentMethod)=>p.id===(o as any).paymentMethodId)?.name||'No disponible'
 const itemName=(i:any)=>i.productName||products?.find((p:Product)=>p.id===i.productId)?.name||'Producto'
 const unitPrice=(i:any)=>Number(i.unitPrice||products?.find((p:Product)=>p.id===i.productId)?.salePrice||0)
 return <><div className="admin-page-head"><div><span className="mini-title">{history?'Pedidos completados':'Pedidos activos'} · {remote?'Supabase':'Local'}</span><h1>{history?'Histórico de pedidos':'Pedidos'}</h1><p>{history?'Aquí quedan los pedidos marcados como Entregado.':'Abre cada pedido para ver exactamente lo que compró el cliente.'}</p></div><button className="secondary-button" onClick={refresh}><RefreshCcw size={17}/> Actualizar</button></div>
 {loading?<div className="mini-empty">Cargando pedidos...</div>:visible.length===0?<div className="mini-empty">{history?'Todavía no hay pedidos finalizados.':'No hay pedidos activos.'}</div>:<div className="order-admin-grid">{visible.map((o:Order)=>{const expanded=openId===o.id;return <article className="admin-panel order-card" key={o.id}><div className="order-card-head"><div><strong>{o.id}</strong><span>{o.customerName} · {o.phone}</span><small>{new Date(o.createdAt).toLocaleString('es-VE')}</small></div><b>{money(o.total)}</b></div><div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'end'}}><label style={{flex:'1 1 210px'}}>Estado<select value={o.status} onChange={e=>change(o,e.target.value as OrderStatus)}>{steps.map(s=><option value={s} key={s}>{orderText[s]}</option>)}</select></label><button className="edit-button" onClick={()=>setOpenId(expanded?null:o.id)} style={{cursor:'pointer'}}><Eye size={17}/> {expanded?'Ocultar detalle':'Ver detalle'}</button><button className="delete-button-small" onClick={()=>remove(o)} style={{cursor:'pointer'}}><Trash2 size={17}/> Eliminar</button></div>{expanded&&<div style={{marginTop:16,borderTop:'1px solid #e5e7eb',paddingTop:16}}><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginBottom:16}}><div><small>Cliente</small><strong style={{display:'block'}}>{o.customerName}</strong></div><div><small>WhatsApp</small><strong style={{display:'block'}}>{o.phone}</strong></div><div><small>Dirección / zona</small><strong style={{display:'block'}}>{o.address||'No indicada'}</strong></div><div><small>Método de pago</small><strong style={{display:'block'}}>{paymentName(o)}</strong></div><div><small>Referencia</small><strong style={{display:'block'}}>{(o as any).paymentReference||'No indicada'}</strong></div><div><small>Total</small><strong style={{display:'block'}}>{money(o.total)}</strong></div></div><h3 style={{margin:'0 0 10px'}}>Productos solicitados</h3><div style={{display:'grid',gap:8}}>{(o.items as any[]).map((i:any,index:number)=>{const price=unitPrice(i);return <div key={index} style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:12,alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f0f0f0'}}><div><strong>{itemName(i)}</strong></div><span>{i.quantity} × {money(price)}</span><strong>{money(Number(i.lineTotal||price*i.quantity))}</strong></div>})}</div>{o.notes&&<div style={{marginTop:14,padding:12,background:'#f8fafc',borderRadius:10}}><small>Notas del cliente</small><p style={{margin:'5px 0 0'}}>{o.notes}</p></div>}</div>}</article>})}</div>}</>
}
`;
app=app.slice(0,oStart)+orders+app.slice(oEnd);
console.log('OK pedidos detalle/histórico');

if(!api.includes('export async function deleteOrderRemote')){
api+=`
export async function deleteOrderRemote(id:string){
 const itemsRes=await supabase.from('order_items').delete().eq('order_id',id)
 if(itemsRes.error)return {data:null,error:itemsRes.error}
 const orderRes=await supabase.from('orders').delete().eq('id',id).select().single()
 if(orderRes.error)return {data:null,error:orderRes.error}
 return {data:orderRes.data,error:null}
}
`;console.log('OK API eliminar pedido')}

fs.writeFileSync(appFile,app,'utf8');fs.writeFileSync(apiFile,api,'utf8');
console.log('\\nActualización aplicada. Ahora ejecuta: npm.cmd run build');
