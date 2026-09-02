const fs = require('fs');
const path = require('path');

const appFile = path.join(process.cwd(), 'src', 'App.tsx');
if (!fs.existsSync(appFile)) {
  console.error('ERROR: No se encontró src/App.tsx. Ejecuta este archivo dentro de C:\\Proyectos\\Wilyu-Market');
  process.exit(1);
}

let s = fs.readFileSync(appFile, 'utf8');
const backup = appFile + '.backup-factura-' + Date.now();
fs.copyFileSync(appFile, backup);

function replaceOnce(oldText, newText, label) {
  if (!s.includes(oldText)) {
    console.error('ERROR: No encontré el bloque: ' + label);
    process.exit(1);
  }
  s = s.replace(oldText, newText);
  console.log('OK: ' + label);
}

replaceOnce(
  `import { useEffect, useMemo, useState } from 'react'`,
  `import { useEffect, useMemo, useState } from 'react'\nimport { jsPDF } from 'jspdf'`,
  'Importar jsPDF'
);

replaceOnce(
  `const WA='584125427074'`,
  `const WA='584125427074'
const countryCodes=[
 {code:'+58',name:'Venezuela 🇻🇪'},
 {code:'+1',name:'Estados Unidos / Canadá 🇺🇸'},
 {code:'+57',name:'Colombia 🇨🇴'},
 {code:'+51',name:'Perú 🇵🇪'},
 {code:'+593',name:'Ecuador 🇪🇨'},
 {code:'+56',name:'Chile 🇨🇱'},
 {code:'+54',name:'Argentina 🇦🇷'},
 {code:'+52',name:'México 🇲🇽'},
 {code:'+34',name:'España 🇪🇸'},
 {code:'+55',name:'Brasil 🇧🇷'}
]`,
  'Códigos de país'
);

const pdfStart = s.indexOf(`function pdf(order:Order,products:Product[],payment:string,cs:CurrencySettings){`);
const pdfEnd = s.indexOf(`const emptyProduct=():Product=>`);
if (pdfStart < 0 || pdfEnd < 0 || pdfEnd <= pdfStart) {
  console.error('ERROR: No pude localizar la función PDF actual.');
  process.exit(1);
}

const newPdf = `async function pdf(order:Order,products:Product[],payment:string,cs:CurrencySettings,reference=''){
 try{
  const doc=new jsPDF({unit:'mm',format:'a4'})
  const pageW=210, margin=15
  let y=15
  try{
   const svgText=await fetch('/wilyu-logo.svg').then(r=>r.text())
   const svgBlob=new Blob([svgText],{type:'image/svg+xml'})
   const url=URL.createObjectURL(svgBlob)
   const img=new Image()
   await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=reject;img.src=url})
   const canvas=document.createElement('canvas')
   canvas.width=500;canvas.height=500
   const ctx=canvas.getContext('2d')
   if(ctx){ctx.drawImage(img,0,0,500,500);doc.addImage(canvas.toDataURL('image/png'),'PNG',15,10,24,24)}
   URL.revokeObjectURL(url)
  }catch{}
  doc.setFont('helvetica','bold');doc.setFontSize(19)
  doc.text('WILYU MARKET',45,17)
  doc.setFontSize(9);doc.setFont('helvetica','normal')
  doc.text('Nota de pedido / comprobante de compra',45,23)
  doc.text('Encuentra. Pide. Nosotros lo conseguimos.',45,28)
  doc.setDrawColor(220);doc.line(margin,38,pageW-margin,38)
  doc.setFont('helvetica','bold');doc.setFontSize(13)
  doc.text('COMPROBANTE DE PEDIDO',margin,47)
  doc.setFontSize(10)
  doc.text('Pedido:',130,47);doc.setFont('helvetica','normal');doc.text(String(order.id),150,47)
  doc.setFont('helvetica','bold');doc.text('Fecha:',130,53);doc.setFont('helvetica','normal');doc.text(new Date(order.createdAt).toLocaleString('es-VE'),150,53)

  y=62
  doc.setFillColor(248,249,250);doc.roundedRect(margin,y,pageW-margin*2,33,2,2,'F')
  doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text('DATOS DEL CLIENTE',margin+4,y+7)
  doc.setFont('helvetica','normal');doc.setFontSize(9)
  doc.text('Nombre: '+(order.customerName||''),margin+4,y+14)
  doc.text('Teléfono: '+(order.phone||''),margin+4,y+20)
  doc.text('Dirección / zona: '+(order.address||'No indicada'),margin+4,y+26)

  y=101
  doc.setFillColor(248,249,250);doc.roundedRect(margin,y,pageW-margin*2,27,2,2,'F')
  doc.setFont('helvetica','bold');doc.text('DATOS DEL PAGO',margin+4,y+7)
  doc.setFont('helvetica','normal')
  doc.text('Método: '+payment,margin+4,y+14)
  doc.text('Referencia: '+(reference||'No indicada'),margin+4,y+20)

  y=136
  doc.setFont('helvetica','bold');doc.setFontSize(10)
  doc.text('DETALLE DEL PEDIDO',margin,y);y+=7
  doc.setFillColor(33,37,41);doc.rect(margin,y,pageW-margin*2,8,'F')
  doc.setTextColor(255,255,255);doc.setFontSize(8)
  doc.text('Producto',margin+3,y+5.5);doc.text('Cant.',120,y+5.5);doc.text('Precio',140,y+5.5);doc.text('Subtotal',168,y+5.5)
  doc.setTextColor(0,0,0);y+=10
  doc.setFont('helvetica','normal');doc.setFontSize(8.5)
  order.items.forEach(line=>{
   const p=products.find(x=>x.id===line.productId)
   if(!p)return
   const name=p.name.length>48?p.name.slice(0,45)+'...':p.name
   doc.text(name,margin+3,y);doc.text(String(line.quantity),122,y)
   doc.text(money(p.salePrice),140,y);doc.text(money(p.salePrice*line.quantity),168,y)
   y+=7
   if(y>250){doc.addPage();y=20}
  })

  y+=3;doc.setDrawColor(220);doc.line(120,y,pageW-margin,y);y+=8
  doc.setFont('helvetica','bold');doc.setFontSize(12)
  doc.text('TOTAL',130,y);doc.text(money(order.total),168,y);y+=7
  doc.setFontSize(8.5);doc.setFont('helvetica','normal')
  cs.enabled.filter(c=>c!=='USD').forEach(c=>{doc.text(c+': '+money(convert(order.total,c,cs),c),168,y);y+=5})

  if(order.notes){
   y+=4;doc.setFont('helvetica','bold');doc.text('Notas:',margin,y)
   doc.setFont('helvetica','normal');doc.text(String(order.notes).slice(0,140),margin+15,y);y+=7
  }

  y=Math.max(y+8,245)
  if(y>270){doc.addPage();y=20}
  doc.setFillColor(245,247,250);doc.roundedRect(margin,y,pageW-margin*2,29,2,2,'F')
  doc.setFont('helvetica','bold');doc.setFontSize(10)
  doc.text('IMPORTANTE: GUARDA TU NÚMERO DE PEDIDO',margin+4,y+8)
  doc.setFont('helvetica','normal');doc.setFontSize(8.5)
  doc.text('Código: '+order.id,margin+4,y+15)
  doc.text('Con este código puedes revisar el estado de tu compra en la sección "Ve tu pedido".',margin+4,y+21)
  doc.text('Conserva este comprobante hasta recibir tu pedido.',margin+4,y+26)
  doc.setFontSize(7.5);doc.setTextColor(110,110,110)
  doc.text('Wilyu Market · Comprobante generado automáticamente',pageW/2,292,{align:'center'})
  doc.save('Wilyu-Factura-'+order.id+'.pdf')
 }catch(e){
  console.error('PDF:',e)
  alert('El pedido fue registrado, pero no se pudo generar el PDF automáticamente. Puedes descargarlo nuevamente desde la pantalla del pedido.')
 }
}

`;

s = s.slice(0, pdfStart) + newPdf + s.slice(pdfEnd);
console.log('OK: PDF estilo factura profesional');

replaceOnce(
  `const[view,setView]=useState<View>('store'),[pid,setPid]=useState<string|null>(null),[search,setSearch]=useState(''),[cat,setCat]=useState('all'),[menu,setMenu]=useState(false),[last,setLast]=useState<{o:Order,p:string}|null>(null),[accountMode,setAccountMode]=useState<AccountMode>('login')`,
  `const[view,setView]=useState<View>('store'),[pid,setPid]=useState<string|null>(null),[search,setSearch]=useState(''),[cat,setCat]=useState('all'),[menu,setMenu]=useState(false),[last,setLast]=useState<{o:Order,p:string,ref:string}|null>(null),[accountMode,setAccountMode]=useState<AccountMode>('login')`,
  'Referencia dentro del pedido final'
);

replaceOnce(
  `setOrders(x=>[o,...x]);setCart([]);setLast({o,p:pay.name});setView('success');setTimeout(()=>pdf(o,products,pay.name,currencies),250)`,
  `setOrders(x=>[o,...x]);setCart([]);setLast({o,p:pay.name,ref:data.ref||''});setView('success');setTimeout(()=>pdf(o,products,pay.name,currencies,data.ref||''),250)`,
  'Referencia enviada al PDF'
);

const checkoutStart = s.indexOf(`function Checkout({total,pays,cs,back,done}:any){`);
const checkoutEnd = s.indexOf(`function Success({data,products,cs,home,track}:any){`);
if (checkoutStart < 0 || checkoutEnd < 0 || checkoutEnd <= checkoutStart) {
  console.error('ERROR: No pude localizar Checkout.');
  process.exit(1);
}

const newCheckout = `function Checkout({total,pays,cs,back,done}:any){
 const[f,setF]=useState({name:'',phone:'',address:'',ref:'',notes:''})
 const[country,setCountry]=useState('+58')
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
  const localPhone=f.phone.replace(/\\D/g,'')
  if(localPhone.length<7){setErr('Escribe un número de teléfono válido.');return}
  if(!p){setErr('Selecciona un método de pago.');return}
  if(p.requiresProof&&f.ref.trim().length<6){setErr('Ingresa mínimo los últimos 6 dígitos de la referencia de pago.');return}
  if(total<=0){setErr('El carrito no tiene un total válido.');return}
  setBusy(true)
  try{await done({...f,phone:country+' '+localPhone},p)}
  finally{setBusy(false)}
 }
 return <main className="page-main container narrow"><button className="back-button" onClick={back}><ArrowLeft size={18}/> Volver</button><div className="checkout-card"><span className="mini-title">Pago</span><h1>Finalizar pedido</h1><form className="form-grid" onSubmit={submit}>
 <label>Nombre<input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label>
 <label>WhatsApp<div style={{display:'flex',gap:8}}><select value={country} onChange={e=>setCountry(e.target.value)} style={{maxWidth:170}}>{countryCodes.map(c=><option key={c.code+c.name} value={c.code}>{c.name} {c.code}</option>)}</select><input inputMode="tel" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="4121234567" style={{flex:1}}/></div></label>
 <label className="full-field">Dirección / zona<input value={f.address} onChange={e=>setF({...f,address:e.target.value})}/></label>
 <div className="full-field payment-picker"><strong>Método de pago</strong>{pays.length===0?<div className="form-error">No hay métodos de pago activos. La administradora debe activar al menos uno.</div>:pays.map((x:PaymentMethod)=><label className={\`payment-option \${pid===x.id?'selected':''}\`} key={x.id}><input type="radio" checked={pid===x.id} onChange={()=>{setPid(x.id);setErr('')}}/><div><b>{x.name}</b><span>{x.details}</span><small>{x.acceptedCurrencies.join(' · ')}</small></div></label>)}</div>
 {p?.requiresProof&&<label className="full-field">Referencia / operación<input inputMode="numeric" value={f.ref} onChange={e=>setF({...f,ref:e.target.value})} placeholder="Mínimo últimos 6 dígitos"/><small style={{display:'block',marginTop:5}}>Ingresa como mínimo los últimos 6 dígitos de la referencia del pago.</small></label>}
 {err&&<div className="form-error full-field">{err}</div>}
 <label className="full-field">Notas<textarea value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/></label>
 <div className="checkout-total full-field"><div><span>Total</span><strong>{money(total)}</strong><CurrencyLine usd={total} cs={cs} large/></div></div>
 <button className="primary-button full-field" disabled={busy||pays.length===0}><ReceiptText size={18}/> {busy?'Registrando pedido...':'Registrar pedido y generar PDF'}</button>
 </form></div></main>
}
`;

s = s.slice(0, checkoutStart) + newCheckout + s.slice(checkoutEnd);
console.log('OK: Checkout con +58, países y referencia mínima');

const successStart = s.indexOf(`function Success({data,products,cs,home,track}:any){`);
const trackStart = s.indexOf(`function Track({orders,back}:any){`);
if (successStart < 0 || trackStart < 0 || trackStart <= successStart) {
  console.error('ERROR: No pude localizar Success.');
  process.exit(1);
}
const newSuccess = `function Success({data,products,cs,home,track}:any){return <main className="page-main container narrow"><div className="success-card"><div className="success-icon"><CheckCircle2/></div><h1>¡Pedido registrado con éxito!</h1><p>Tu comprobante PDF estilo factura se descargó automáticamente.</p><div className="order-number">{data.o.id}</div><div className="info-message" style={{margin:'14px 0',textAlign:'left'}}><strong>Guarda o anota este número de pedido.</strong><br/>Lo necesitarás para consultar el estado de tu compra en la sección <b>“Ve tu pedido”</b>.</div><div className="success-actions"><button className="secondary-button" onClick={()=>pdf(data.o,products,data.p,cs,data.ref||'')}><ReceiptText/> Descargar factura PDF</button><button className="primary-button" onClick={track}><MapPinned/> Ve tu pedido</button></div><button className="back-button centered" onClick={home}>Volver a la tienda</button></div></main>}
`;
s = s.slice(0, successStart) + newSuccess + s.slice(trackStart);
console.log('OK: Mensaje final y descarga de factura');

fs.writeFileSync(appFile, s, 'utf8');

console.log('');
console.log('===================================================');
console.log('ACTUALIZACIÓN WILYU FACTURA COMPLETADA');
console.log('Backup: ' + backup);
console.log('SIGUIENTE:');
console.log('1) npm.cmd install jspdf');
console.log('2) npm.cmd run build');
console.log('===================================================');
