
const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'src', 'App.tsx');

if (!fs.existsSync(file)) {
  console.error('ERROR: No se encontró src/App.tsx. Ejecuta este archivo dentro de C:\\Proyectos\\Wilyu-Market');
  process.exit(1);
}

let s = fs.readFileSync(file, 'utf8');
const original = s;

function replaceOnce(oldText, newText, label) {
  if (!s.includes(oldText)) {
    console.error(`ERROR: No encontré el bloque: ${label}`);
    process.exit(1);
  }
  s = s.replace(oldText, newText);
  console.log(`OK: ${label}`);
}

// 1) Checkout robusto: selección dinámica, validaciones visibles, referencia obligatoria y estado procesando.
const oldCheckout = `function Checkout({total,pays,cs,back,done}:any){const[f,setF]=useState({name:'',phone:'',address:'',ref:'',notes:''}),[pid,setPid]=useState(pays[0]?.id||'');const p=pays.find((x:PaymentMethod)=>x.id===pid);return <main className="page-main container narrow"><button className="back-button" onClick={back}><ArrowLeft size={18}/> Volver</button><div className="checkout-card"><span className="mini-title">Pago</span><h1>Finalizar pedido</h1><form className="form-grid" onSubmit={e=>{e.preventDefault();if(f.name&&f.phone&&p)done(f,p)}}><label>Nombre<input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label><label>WhatsApp<input value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/></label><label className="full-field">Dirección / zona<input value={f.address} onChange={e=>setF({...f,address:e.target.value})}/></label><div className="full-field payment-picker"><strong>Método de pago</strong>{pays.map((x:PaymentMethod)=><label className={\`payment-option \${pid===x.id?'selected':''}\`} key={x.id}><input type="radio" checked={pid===x.id} onChange={()=>setPid(x.id)}/><div><b>{x.name}</b><span>{x.details}</span><small>{x.acceptedCurrencies.join(' · ')}</small></div></label>)}</div>{p?.requiresProof&&<label className="full-field">Referencia / operación<input value={f.ref} onChange={e=>setF({...f,ref:e.target.value})}/></label>}<label className="full-field">Notas<textarea value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/></label><div className="checkout-total full-field"><div><span>Total</span><strong>{money(total)}</strong><CurrencyLine usd={total} cs={cs} large/></div></div><button className="primary-button full-field"><ReceiptText size={18}/> Registrar pedido y generar PDF</button></form></div></main>}`;

const newCheckout = `function Checkout({total,pays,cs,back,done}:any){
 const[f,setF]=useState({name:'',phone:'',address:'',ref:'',notes:''})
 const[pid,setPid]=useState('')
 const[err,setErr]=useState('')
 const[busy,setBusy]=useState(false)
 useEffect(()=>{
  if(!pays?.length){setPid('');return}
  if(!pid||!pays.some((x:PaymentMethod)=>x.id===pid))setPid(pays[0].id)
 },[pays,pid])
 const p=pays.find((x:PaymentMethod)=>x.id===pid)
 const submit=async(e:React.FormEvent)=>{
  e.preventDefault();setErr('')
  if(!f.name.trim()){setErr('Escribe tu nombre para continuar.');return}
  if(!f.phone.trim()){setErr('Escribe tu número de WhatsApp para continuar.');return}
  if(!p){setErr('Selecciona un método de pago.');return}
  if(p.requiresProof&&!f.ref.trim()){setErr('Escribe la referencia u operación del pago.');return}
  if(total<=0){setErr('El carrito no tiene un total válido.');return}
  setBusy(true)
  try{await done(f,p)}
  finally{setBusy(false)}
 }
 return <main className="page-main container narrow"><button className="back-button" onClick={back}><ArrowLeft size={18}/> Volver</button><div className="checkout-card"><span className="mini-title">Pago</span><h1>Finalizar pedido</h1><form className="form-grid" onSubmit={submit}><label>Nombre<input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label><label>WhatsApp<input value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/></label><label className="full-field">Dirección / zona<input value={f.address} onChange={e=>setF({...f,address:e.target.value})}/></label><div className="full-field payment-picker"><strong>Método de pago</strong>{pays.length===0?<div className="form-error">No hay métodos de pago activos. La administradora debe activar al menos uno.</div>:pays.map((x:PaymentMethod)=><label className={\`payment-option \${pid===x.id?'selected':''}\`} key={x.id}><input type="radio" checked={pid===x.id} onChange={()=>{setPid(x.id);setErr('')}}/><div><b>{x.name}</b><span>{x.details}</span><small>{x.acceptedCurrencies.join(' · ')}</small></div></label>)}</div>{p?.requiresProof&&<label className="full-field">Referencia / operación<input value={f.ref} onChange={e=>setF({...f,ref:e.target.value})} placeholder="Ej: 123456"/></label>}{err&&<div className="form-error full-field">{err}</div>}<label className="full-field">Notas<textarea value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/></label><div className="checkout-total full-field"><div><span>Total</span><strong>{money(total)}</strong><CurrencyLine usd={total} cs={cs} large/></div></div><button className="primary-button full-field" disabled={busy||pays.length===0}><ReceiptText size={18}/> {busy?'Registrando pedido...':'Registrar pedido y generar PDF'}</button></form></div></main>
}`;

replaceOnce(oldCheckout, newCheckout, 'Checkout: métodos de pago + validación + botón');

// 2) Mensaje de éxito al terminar pedido antes del PDF.
replaceOnce(
  `setOrders(x=>[o,...x]);setCart([]);setLast({o,p:pay.name});setView('success');setTimeout(()=>pdf(o,products,pay.name,currencies),250)`,
  `setOrders(x=>[o,...x]);setCart([]);setLast({o,p:pay.name});setView('success');setTimeout(()=>pdf(o,products,pay.name,currencies),250)`,
  'Registro de pedido'
);

// 3) Producto guardado / eliminado.
replaceOnce(
  `await refreshProducts();setEdit(null);return`,
  `await refreshProducts();alert('✅ Producto guardado con éxito.');setEdit(null);return`,
  'Mensaje producto guardado'
);

replaceOnce(
  `}else setProducts((x:Product[])=>x.filter(p=>p.id!==edit.id))
   setEdit(null)`,
  `}else setProducts((x:Product[])=>x.filter(p=>p.id!==edit.id))
   alert('✅ Producto eliminado con éxito.')
   setEdit(null)`,
  'Mensaje producto eliminado'
);

// 4) Estado de pedido.
replaceOnce(
  `setOrders((x:Order[])=>x.map(a=>a.id===o.id?{...a,status:s}:a))
 }`,
  `setOrders((x:Order[])=>x.map(a=>a.id===o.id?{...a,status:s}:a))
  alert('✅ Estado del pedido actualizado con éxito.')
 }`,
  'Mensaje estado de pedido'
);

// 5) Categorías.
replaceOnce(
  `await refresh()}else setCategories((x:Category[])=>[...x,{id:uid('cat'),name:n,emoji:e}]);sn('')}finally`,
  `await refresh()}else setCategories((x:Category[])=>[...x,{id:uid('cat'),name:n,emoji:e}]);alert('✅ Categoría guardada con éxito.');sn('')}finally`,
  'Mensaje categoría guardada'
);

replaceOnce(
  `await refresh()}else setCategories((x:Category[])=>x.filter(a=>a.id!==id))}`,
  `await refresh()}else setCategories((x:Category[])=>x.filter(a=>a.id!==id));alert('✅ Categoría eliminada con éxito.')}`,
  'Mensaje categoría eliminada'
);

// 6) Proveedores.
replaceOnce(
  `await refresh()}else setProviders((x:Provider[])=>[...x,{id:uid('prov'),name:n,phone:p}]);sn('');sp('');setBusy(false)}`,
  `await refresh()}else setProviders((x:Provider[])=>[...x,{id:uid('prov'),name:n,phone:p}]);alert('✅ Proveedor guardado con éxito.');sn('');sp('');setBusy(false)}`,
  'Mensaje proveedor guardado'
);

replaceOnce(
  `await refresh()}else setProviders((a:Provider[])=>a.filter(b=>b.id!==id))}`,
  `await refresh()}else setProviders((a:Provider[])=>a.filter(b=>b.id!==id));alert('✅ Proveedor eliminado con éxito.')}`,
  'Mensaje proveedor eliminado'
);

// 7) Métodos de pago.
replaceOnce(
  `await refresh()}else setPayments((x:PaymentMethod[])=>p.id?x.map(a=>a.id===p.id?p:a):[...x,{...p,id:uid('pay')}]);setEd(null)`,
  `await refresh()}else setPayments((x:PaymentMethod[])=>p.id?x.map(a=>a.id===p.id?p:a):[...x,{...p,id:uid('pay')}]);alert('✅ Método de pago guardado con éxito.');setEd(null)`,
  'Mensaje método de pago guardado'
);

// 8) Monedas/tasas: cambiar mensaje para que sea inequívoco.
replaceOnce(
  `setCs(s);setMsg('Tasas guardadas correctamente.')`,
  `setCs(s);setMsg('✅ Tasas guardadas con éxito.')`,
  'Mensaje tasas guardadas'
);

if (s === original) {
  console.error('No se realizaron cambios.');
  process.exit(1);
}

const backup = file + '.backup-' + Date.now();
fs.copyFileSync(file, backup);
fs.writeFileSync(file, s, 'utf8');

console.log('');
console.log('==============================================');
console.log('WILYU MARKET ACTUALIZADO');
console.log('Backup: ' + backup);
console.log('Ahora ejecuta: npm.cmd run build');
console.log('==============================================');
