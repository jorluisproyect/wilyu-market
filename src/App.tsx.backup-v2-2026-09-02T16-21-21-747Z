import { useEffect, useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import { Search, ShoppingCart, Menu, X, Clock3, CheckCircle2, Plus, Trash2, Pencil, Store, LayoutDashboard, Tags, Truck, Users, LogOut, ArrowLeft, Save, EyeOff, MessageCircle, DollarSign, TrendingUp, ClipboardList, Home, Minus, Eye, Boxes, ShieldCheck, WalletCards, RefreshCcw, ReceiptText, MapPinned, PackageCheck, ImagePlus, Landmark, CreditCard, CircleDollarSign, UserRound, LogIn, UserPlus, History, MapPin, Phone, Mail, BadgeCheck } from 'lucide-react'
import { Category, Order, OrderStatus, OwnershipType, Product, ProductStatus, Provider, PaymentMethod, CurrencySettings, CurrencyCode } from './types'
import { seedCategories, seedProducts, seedProviders } from './data/seed'
import {
  testSupabaseConnection, getCategories, getProducts,
  adminGetCategories, adminGetProducts, createCategory, deleteCategory,
  saveProduct, deleteProduct, uploadAndAttachProductImage, signIn, signOut,
  adminGetProviders, createProvider, deleteProvider,
  adminGetPaymentMethods, savePaymentMethod, deletePaymentMethod,
  getRates, saveRates, createOrderRemote, adminGetOrders, updateOrderStatus,
  trackOrder, signUp, getProfile, updateProfile, getAuthUser
} from './lib/wilyuApi'

type View='store'|'product'|'cart'|'checkout'|'success'|'track'|'account'|'admin'
type AccountMode='login'|'register'|'profile'
interface CustomerAccount{id:string;name:string;email:string;phone:string;address:string;password:string;createdAt:string}
type AdminTab='dashboard'|'products'|'orders'|'categories'|'providers'|'payments'|'currencies'
const WA='584125427074'
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
]
const uid=(p:string)=>`${p}-${Date.now()}-${Math.random().toString(16).slice(2,7)}`
const money=(v:number,c:CurrencyCode='USD')=>c==='VES'?`Bs. ${Number(v||0).toLocaleString('es-VE',{maximumFractionDigits:2})}`:c==='EUR'?`€${Number(v||0).toFixed(2)}`:c==='USDT'?`${Number(v||0).toFixed(2)} USDT`:`$${Number(v||0).toFixed(2)}`
function useLS<T>(k:string,init:T){const[v,s]=useState<T>(()=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):init}catch{return init}});useEffect(()=>localStorage.setItem(k,JSON.stringify(v)),[k,v]);return[v,s]as const}
const paySeed:PaymentMethod[]=[
{id:'p1',name:'Pago Móvil',type:'mobile',details:'La administradora debe colocar aquí banco, teléfono y documento.',active:true,requiresProof:true,acceptedCurrencies:['VES']},
{id:'p2',name:'Transferencia bancaria',type:'bank',details:'Agrega banco, titular y número de cuenta.',active:true,requiresProof:true,acceptedCurrencies:['USD','VES','EUR']},
{id:'p3',name:'PayPal',type:'paypal',details:'Agrega el correo PayPal de cobro.',active:false,requiresProof:true,acceptedCurrencies:['USD','EUR']},
{id:'p4',name:'Binance / USDT',type:'binance',details:'Agrega Binance Pay ID o instrucciones de pago.',active:false,requiresProof:true,acceptedCurrencies:['USDT']}
]
const currSeed:CurrencySettings={base:'USD',enabled:['USD','EUR','VES','USDT'],autoUpdate:true,rates:{USD:1,EUR:.92,VES:1,USDT:1},lastUpdated:'',sourceLabel:'Referencia online'}
const steps:OrderStatus[]=['new','confirmed','supplier','preparing','delivery','delivered']
const orderText:Record<OrderStatus,string>={new:'Pedido recibido',confirmed:'Pago confirmado',supplier:'Solicitando productos',preparing:'Preparando',delivery:'En camino',delivered:'Entregado'}
const ownText:Record<OwnershipType,string>={own:'Propio',supplier:'De proveedor',thirdparty:'Producto de tercero'}
function status(s:ProductStatus){return s==='available'?['Disponible','green']:s==='preorder'?['Por encargo','amber']:s==='soldout'?['Agotado','red']:['Oculto','gray']}
function convert(v:number,c:CurrencyCode,cs:CurrencySettings){return v*(cs.rates[c]||1)}
function CurrencyLine({usd,cs,large=false}:{usd:number,cs:CurrencySettings,large?:boolean}){
 const showVES=cs.enabled.includes('VES')
 const others=cs.enabled.filter(c=>c!=='USD'&&c!=='VES')
 return <div className={`currency-stack ${large?'large':''}`}>
   {showVES&&<div className="bolivar-price"><span>Precio en bolívares</span><strong>{money(convert(usd,'VES',cs),'VES')}</strong></div>}
   {others.length>0&&<div className="currency-line">{others.map(c=><span key={c}>{money(convert(usd,c,cs),c)}</span>)}</div>}
 </div>
}
function dataUrl(file:File){return new Promise<string>((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result));r.onerror=rej;r.readAsDataURL(file)})}
async function pdf(order:Order,products:Product[],payment:string,cs:CurrencySettings,reference=''){
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

const emptyProduct=():Product=>({id:'',name:'',categoryId:'reposteria',description:'',image:'',cost:0,salePrice:0,marginPercent:30,status:'available',deliveryText:'Entrega aproximada en 24 horas',ownershipType:'supplier',ownerName:'',providerId:'',featured:false,createdAt:new Date().toISOString()})

async function fetchDailyRates(current:CurrencySettings){
 try{
   const r=await fetch('https://open.er-api.com/v6/latest/USD')
   if(!r.ok)throw new Error('rate')
   const d=await r.json()
   const eur=Number(d?.rates?.EUR),ves=Number(d?.rates?.VES)
   if(!eur||!ves)throw new Error('rate')
   return {...current,rates:{...current.rates,USD:1,EUR:eur,VES:ves,USDT:1},lastUpdated:new Date().toISOString(),sourceLabel:'Tasa de referencia online'}
 }catch{return null}
}


function mapRemoteCategory(row:any):Category{
  return { id:row.id, name:row.name, emoji:row.emoji || '🛍️' }
}

function mapRemoteProduct(row:any):Product{
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id || '',
    description: row.description || '',
    image: row.product_images?.[0]?.image_url || '',
    cost: Number(row.cost || 0),
    salePrice: Number(row.sale_price || 0),
    marginPercent: Number(row.margin_percent || 30),
    status: row.status,
    deliveryText: row.delivery_text || 'Entrega aproximada en 24 horas',
    ownershipType: row.ownership_type || 'supplier',
    ownerName: row.owner_name || '',
    providerId: row.provider_id || '',
    featured: !!row.featured,
    createdAt: row.created_at || new Date().toISOString()
  }
}


function mapProvider(row:any):Provider{
 return {id:row.id,name:row.name,phone:row.phone||'',notes:row.notes||''}
}
function mapPayment(row:any):PaymentMethod{
 return {id:row.id,name:row.name,type:row.type,details:row.details||'',active:!!row.active,requiresProof:!!row.requires_proof,acceptedCurrencies:row.accepted_currencies||['USD']}
}
function mapOrder(row:any):Order{
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
}
function ratesFromRows(rows:any[]):CurrencySettings{
 const map:any={USD:1,EUR:.92,VES:1,USDT:1}
 rows.forEach(r=>map[r.currency]=Number(r.rate||1))
 return {base:'USD',enabled:['USD','EUR','VES','USDT'],autoUpdate:true,rates:map,lastUpdated:new Date().toISOString(),sourceLabel:'Supabase'}
}

export default function App(){
 const [supabaseStatus,setSupabaseStatus]=useState<'checking'|'connected'|'error'>('checking')
 const [remoteCatalogReady,setRemoteCatalogReady]=useState(false)
 const [catalogLoading,setCatalogLoading]=useState(true)

 useEffect(()=>{
   const load = async()=>{
     try{
       await testSupabaseConnection()
       setSupabaseStatus('connected')
       const [catsRes,prodsRes,pvRes,pmRes,rtRes] = await Promise.all([
         getCategories(),getProducts(),adminGetProviders(),adminGetPaymentMethods(),getRates()
       ])
       if(catsRes.error) throw catsRes.error
       if(prodsRes.error) throw prodsRes.error
       setCategories((catsRes.data||[]).map(mapRemoteCategory))
       setProducts((prodsRes.data||[]).map(mapRemoteProduct))
       if(!pvRes.error)setProviders((pvRes.data||[]).map(mapProvider))
       if(!pmRes.error)setPayments((pmRes.data||[]).map(mapPayment))
       if(!rtRes.error)setCurrencies(ratesFromRows(rtRes.data||[]))
       setRemoteCatalogReady(true)
     }catch(err){
       console.error('Supabase catálogo:',err)
       setSupabaseStatus('error')
       setRemoteCatalogReady(false)
     }finally{
       setCatalogLoading(false)
     }
   }
   load()
 },[])
 const[products,setProducts]=useLS<Product[]>('wilyu_products',seedProducts),[categories,setCategories]=useLS<Category[]>('wilyu_categories',seedCategories),[providers,setProviders]=useLS<Provider[]>('wilyu_providers',seedProviders),[orders,setOrders]=useLS<Order[]>('wilyu_orders',[]),[cart,setCart]=useLS<{productId:string,quantity:number}[]>('wilyu_cart',[]),[payments,setPayments]=useLS<PaymentMethod[]>('wilyu_payments',paySeed),[currencies,setCurrencies]=useLS<CurrencySettings>('wilyu_currency',currSeed),[customers,setCustomers]=useLS<CustomerAccount[]>('wilyu_customers',[]),[customerSession,setCustomerSession]=useLS<string>('wilyu_customer_session','')
 const[view,setView]=useState<View>('store'),[pid,setPid]=useState<string|null>(null),[search,setSearch]=useState(''),[cat,setCat]=useState('all'),[menu,setMenu]=useState(false),[last,setLast]=useState<{o:Order,p:string,ref:string}|null>(null),[accountMode,setAccountMode]=useState<AccountMode>('login')
 const currentCustomer=customers.find(c=>c.id===customerSession)||null
 useEffect(()=>{
   if(!currencies.autoUpdate)return
   const last=currencies.lastUpdated?new Date(currencies.lastUpdated).getTime():0
   const sixHours=6*60*60*1000
   if(Date.now()-last<sixHours)return
   fetchDailyRates(currencies).then(next=>{if(next)setCurrencies(next)})
 },[])
 const shown=useMemo(()=>products.filter(p=>p.status!=='hidden'&&(cat==='all'||p.categoryId===cat)&&`${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase())),[products,cat,search])
 const count=cart.reduce((a,x)=>a+x.quantity,0),total=cart.reduce((a,l)=>a+(products.find(p=>p.id===l.productId)?.salePrice||0)*l.quantity,0)
 const add=(id:string,q=1)=>setCart(prev=>{const f=prev.find(x=>x.productId===id);return f?prev.map(x=>x.productId===id?{...x,quantity:x.quantity+q}:x):[...prev,{productId:id,quantity:q}]})
 const home=()=>{setView('store');window.scrollTo({top:0})},open=(id:string)=>{setPid(id);setView('product');window.scrollTo({top:0})}
 const checkout=async(data:any,pay:PaymentMethod)=>{
   try{
    const user=await getAuthUser()
    const r=await createOrderRemote({
      customerId:user?.id||null,
      customerName:data.name,
      phone:data.phone,
      address:data.address,
      paymentMethodId:pay.id,
      paymentReference:data.ref||'',
      notes:data.notes||'',
      total,
      rates:currencies.rates,
      items:cart.map(line=>{
       const p=products.find(x=>x.id===line.productId)
       return {productId:line.productId,productName:p?.name||'Producto',quantity:line.quantity,unitPrice:p?.salePrice||0}
      })
    })
    if(r.error||!r.data){alert('No se pudo registrar el pedido: '+(r.error?.message||'Error'));return}
    const o:Order={id:r.data.order_code,customerName:data.name,phone:data.phone,address:data.address,notes:data.notes||'',items:cart,total,status:'new',createdAt:r.data.created_at}
    setOrders(x=>[o,...x]);setCart([]);setLast({o,p:pay.name,ref:data.ref||''});setView('success');setTimeout(()=>pdf(o,products,pay.name,currencies,data.ref||''),250)
   }catch(e:any){alert('No se pudo registrar el pedido: '+(e?.message||'Error'))}
 }
 if(view==='admin')return <Admin {...{products,setProducts,categories,setCategories,providers,setProviders,orders,setOrders,payments,setPayments,currencies,setCurrencies}} remote={remoteCatalogReady} exit={home}/>
 const sel=products.find(p=>p.id===pid)
 return <div className="app-shell"><header className="topbar"><div className="container nav-wrap"><button className="brand-button" onClick={home}><img src="/wilyu-logo.svg" className="brand-logo"/><div><strong>Wilyu Market</strong><span>Encuentra. Pide. Nosotros lo conseguimos.</span></div></button><nav className="desktop-nav"><button onClick={home}>Inicio</button><button onClick={()=>setView('track')}>Ve tu pedido</button><button onClick={()=>{home();setTimeout(()=>document.getElementById('productos')?.scrollIntoView({behavior:'smooth'}),20)}}>Productos</button><button onClick={()=>{home();setTimeout(()=>document.getElementById('como-comprar')?.scrollIntoView({behavior:'smooth'}),20)}}>¿Cómo comprar?</button></nav><div className={`db-status ${supabaseStatus}`}><span></span>{supabaseStatus==='connected'?'Online':supabaseStatus==='error'?'Sin conexión':'Conectando'}</div><div className="nav-actions"><div className="shop-auth-stack"><button className="icon-button cart-button" onClick={()=>setView('cart')}><ShoppingCart size={21}/>{count>0&&<span className="cart-badge">{count}</span>}</button>{currentCustomer?<button className="account-nav-button logged" onClick={()=>{setAccountMode('profile');setView('account')}}><UserRound size={17}/><span>{currentCustomer.name.split(' ')[0]}</span></button>:<div className="auth-nav-actions"><button className="login-nav-button" onClick={()=>{setAccountMode('login');setView('account')}}><LogIn size={16}/> Iniciar sesión</button><button className="register-nav-button" onClick={()=>{setAccountMode('register');setView('account')}}><UserPlus size={16}/> Regístrate</button></div>}</div><button className="admin-link" onClick={()=>setView('admin')}>Administrar</button><button className="icon-button mobile-menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div></div>{menu&&<div className="mobile-nav"><button onClick={home}>Inicio</button><button onClick={()=>setView('track')}>Ve tu pedido</button>{currentCustomer?<button onClick={()=>{setAccountMode('profile');setView('account');setMenu(false)}}>Mi cuenta</button>:<><button onClick={()=>{setAccountMode('login');setView('account');setMenu(false)}}>Iniciar sesión</button><button onClick={()=>{setAccountMode('register');setView('account');setMenu(false)}}>Regístrate</button></>}<button onClick={()=>setView('cart')}>Carrito</button></div>}</header>
 {view==='store'&&<><section className="hero"><div className="container hero-grid"><div className="hero-copy"><span className="eyebrow"><ShieldCheck size={16}/> Compra fácil y entrega coordinada</span><h1>Todo lo que buscas, <span>en un solo lugar.</span></h1><p>Compra productos disponibles o por encargo, elige cómo pagar y sigue tu pedido.</p><div className="search-box hero-search"><Search size={20}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="¿Qué estás buscando?"/></div></div><div className="hero-card"><div className="floating-chip chip-one">🧁 Repostería</div><div className="floating-chip chip-two">🏠 Hogar</div><div className="floating-chip chip-three">📱 Tecnología</div><img src="/wilyu-logo.svg"/><h3>Wilyu Market</h3><p>Compra, paga y sigue tu pedido.</p></div></div></section><section className="section container"><div className="section-head"><div><span className="mini-title">Explora</span><h2>Categorías</h2></div></div><div className="category-grid"><button className={`category-card ${cat==='all'?'active':''}`} onClick={()=>setCat('all')}><span>🛍️</span><strong>Todos</strong></button>{categories.map(c=><button key={c.id} className={`category-card ${cat===c.id?'active':''}`} onClick={()=>setCat(c.id)}><span>{c.emoji}</span><strong>{c.name}</strong></button>)}</div></section><section className="section soft-section" id="productos"><div className="container"><div className="section-head"><div><span className="mini-title">Catálogo</span><h2>Productos en venta</h2></div></div><div className="product-grid">{shown.map(p=><ProductCard key={p.id} p={p} cat={categories.find(c=>c.id===p.categoryId)} cs={currencies} open={()=>open(p.id)} add={()=>add(p.id)}/>)}</div></div></section><section className="member-section"><div className="container member-card"><div className="member-copy"><span className="mini-title">Tu cuenta Wilyu</span><h2>Compra más rápido la próxima vez</h2><p>Registrarte es opcional. Guarda tus datos, consulta tu historial de compras y acelera tus próximos pedidos.</p><div className="member-benefits"><span><BadgeCheck size={17}/> Datos guardados</span><span><History size={17}/> Historial de compras</span><span><MapPinned size={17}/> Seguimiento fácil</span></div></div><div className="member-actions">{currentCustomer?<button className="primary-button" onClick={()=>{setAccountMode('profile');setView('account')}}><UserRound size={18}/> Mi cuenta</button>:<><button className="primary-button" onClick={()=>{setAccountMode('register');setView('account')}}><UserPlus size={18}/> Regístrate gratis</button><button className="secondary-button" onClick={()=>{setAccountMode('login');setView('account')}}><LogIn size={18}/> Iniciar sesión</button></>}</div></div></section><section className="section container" id="como-comprar"><div className="section-head"><div><span className="mini-title">Simple</span><h2>¿Cómo comprar?</h2></div></div><div className="steps-grid"><div className="step-card"><span>1</span><Search/><h3>Encuentra</h3><p>Busca el producto que necesitas.</p></div><div className="step-card"><span>2</span><CreditCard/><h3>Paga</h3><p>Elige un método habilitado.</p></div><div className="step-card"><span>3</span><Truck/><h3>Sigue</h3><p>Consulta el código de tu pedido.</p></div></div></section></>}
 {view==='product'&&sel&&<Detail p={sel} cat={categories.find(c=>c.id===sel.categoryId)} cs={currencies} back={home} add={(q:number)=>add(sel.id,q)} cart={()=>setView('cart')}/>} {view==='cart'&&<Cart cart={cart} products={products} total={total} cs={currencies} back={home} setCart={setCart} next={()=>setView('checkout')}/>} {view==='checkout'&&<Checkout total={total} pays={payments.filter(p=>p.active)} cs={currencies} back={()=>setView('cart')} done={checkout}/>} {view==='success'&&last&&<Success data={last} products={products} cs={currencies} home={home} track={()=>setView('track')}/>} {view==='track'&&<Track orders={orders} back={home}/>}{view==='account'&&<CustomerAccountView orders={orders} mode={accountMode} setMode={setAccountMode} back={home}/>}<footer className="footer"><div className="container footer-grid"><div className="footer-brand"><img src="/wilyu-logo.svg"/><div><strong>Wilyu Market</strong><span>Compra fácil y seguimiento.</span></div></div><p>© {new Date().getFullYear()} Wilyu Market</p></div></footer></div>
}
function ProductCard({p,cat,cs,open,add}:any){const[s,c]=status(p.status);return <article className="product-card"><button className="product-image-wrap" onClick={open}><img className="product-image" src={p.image||'/wilyu-logo.svg'}/><span className={`status-pill ${c}`}>{s}</span></button><div className="product-body"><span className="product-category">{cat?.emoji} {cat?.name}</span><button className="product-title" onClick={open}>{p.name}</button><p className="delivery-line"><Clock3 size={15}/>{p.deliveryText}</p><strong className="price">{money(p.salePrice)}</strong><CurrencyLine usd={p.salePrice} cs={cs}/><button className="add-button full" onClick={add} disabled={p.status==='soldout'}><Plus size={18}/> Agregar</button></div></article>}
function Detail({p,cat,cs,back,add,cart}:any){const[q,setQ]=useState(1),[s,c]=status(p.status);return <main className="page-main container"><button className="back-button" onClick={back}><ArrowLeft size={18}/> Volver</button><div className="product-detail"><div className="detail-image-card"><img src={p.image||'/wilyu-logo.svg'}/></div><div className="detail-copy"><span className="product-category">{cat?.emoji} {cat?.name}</span><h1>{p.name}</h1><span className={`status-pill static ${c}`}>{s}</span><strong className="detail-price">{money(p.salePrice)}</strong><CurrencyLine usd={p.salePrice} cs={cs} large/><p className="detail-description">{p.description}</p><div className="eta-box"><Truck/><div><strong>Tiempo estimado</strong><span>{p.deliveryText}</span></div></div><div className="quantity-row"><span>Cantidad</span><div className="quantity-control"><button onClick={()=>setQ(Math.max(1,q-1))}><Minus size={17}/></button><strong>{q}</strong><button onClick={()=>setQ(q+1)}><Plus size={17}/></button></div></div><div className="detail-actions"><button className="primary-button" onClick={()=>{add(q);cart()}}><ShoppingCart size={19}/> Agregar</button><a className="secondary-button" href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hola, tengo una consulta sobre ${p.name}`)}`} target="_blank"><MessageCircle size={19}/> WhatsApp</a></div></div></div></main>}
function Cart({cart,products,total,cs,back,setCart,next}:any){const ch=(id:string,d:number)=>setCart((x:any[])=>x.map(a=>a.productId===id?{...a,quantity:Math.max(0,a.quantity+d)}:a).filter(a=>a.quantity>0));return <main className="page-main container narrow"><button className="back-button" onClick={back}><ArrowLeft size={18}/> Seguir comprando</button><div className="page-heading"><h1>Carrito</h1></div>{cart.length===0?<div className="empty-state"><ShoppingCart/><h3>Tu carrito está vacío</h3></div>:<div className="cart-layout"><div className="cart-lines">{cart.map((l:any)=>{const p=products.find((x:Product)=>x.id===l.productId);if(!p)return null;return <div className="cart-line" key={l.productId}><img src={p.image||'/wilyu-logo.svg'}/><div className="cart-line-info"><strong>{p.name}</strong><b>{money(p.salePrice)}</b></div><div className="quantity-control"><button onClick={()=>ch(p.id,-1)}><Minus size={16}/></button><strong>{l.quantity}</strong><button onClick={()=>ch(p.id,1)}><Plus size={16}/></button></div><button className="danger-icon" onClick={()=>setCart((x:any[])=>x.filter(a=>a.productId!==p.id))}><Trash2 size={18}/></button></div>})}</div><aside className="order-summary"><h3>Resumen</h3><div><span>Total</span><strong>{money(total)}</strong></div><CurrencyLine usd={total} cs={cs} large/><button className="primary-button full" onClick={next}>Finalizar pedido</button></aside></div>}</main>}
function Checkout({total,pays,cs,back,done}:any){
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
  const localPhone=f.phone.replace(/\D/g,'')
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
 <div className="full-field payment-picker"><strong>Método de pago</strong>{pays.length===0?<div className="form-error">No hay métodos de pago activos. La administradora debe activar al menos uno.</div>:pays.map((x:PaymentMethod)=><label className={`payment-option ${pid===x.id?'selected':''}`} key={x.id}><input type="radio" checked={pid===x.id} onChange={()=>{setPid(x.id);setErr('')}}/><div><b>{x.name}</b><span>{x.details}</span><small>{x.acceptedCurrencies.join(' · ')}</small></div></label>)}</div>
 {p?.requiresProof&&<label className="full-field">Referencia / operación<input inputMode="numeric" value={f.ref} onChange={e=>setF({...f,ref:e.target.value})} placeholder="Mínimo últimos 6 dígitos"/><small style={{display:'block',marginTop:5}}>Ingresa como mínimo los últimos 6 dígitos de la referencia del pago.</small></label>}
 {err&&<div className="form-error full-field">{err}</div>}
 <label className="full-field">Notas<textarea value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/></label>
 <div className="checkout-total full-field"><div><span>Total</span><strong>{money(total)}</strong><CurrencyLine usd={total} cs={cs} large/></div></div>
 <button className="primary-button full-field" disabled={busy||pays.length===0}><ReceiptText size={18}/> {busy?'Registrando pedido...':'Registrar pedido y generar PDF'}</button>
 </form></div></main>
}
function Success({data,products,cs,home,track}:any){return <main className="page-main container narrow"><div className="success-card"><div className="success-icon"><CheckCircle2/></div><h1>¡Pedido registrado con éxito!</h1><p>Tu comprobante PDF estilo factura se descargó automáticamente.</p><div className="order-number">{data.o.id}</div><div className="info-message" style={{margin:'14px 0',textAlign:'left'}}><strong>Guarda o anota este número de pedido.</strong><br/>Lo necesitarás para consultar el estado de tu compra en la sección <b>“Ve tu pedido”</b>.</div><div className="success-actions"><button className="secondary-button" onClick={()=>pdf(data.o,products,data.p,cs,data.ref||'')}><ReceiptText/> Descargar factura PDF</button><button className="primary-button" onClick={track}><MapPinned/> Ve tu pedido</button></div><button className="back-button centered" onClick={home}>Volver a la tienda</button></div></main>}
function Track({orders,back}:any){
 const[c,setC]=useState(''),[o,setO]=useState<any|null>(null),[err,setErr]=useState(''),[busy,setBusy]=useState(false)
 const search=async(e:React.FormEvent)=>{
  e.preventDefault();setBusy(true);setErr('');setO(null)
  const r=await trackOrder(c.trim())
  setBusy(false)
  if(r.error||!r.data?.length){setErr('No encontramos ese código.');return}
  setO(r.data[0])
 }
 const idx=o?Math.max(0,steps.indexOf(o.status as OrderStatus)):0
 return <main className="page-main container narrow"><button className="back-button" onClick={back}><ArrowLeft/> Volver</button><div className="track-head"><span className="mini-title">Seguimiento</span><h1>Ve tu pedido</h1><p>Escribe el código entregado al finalizar la compra.</p></div><form className="track-search" onSubmit={search}><input value={c} onChange={e=>setC(e.target.value)} placeholder="WY-XXXXXXXXXXXX"/><button className="primary-button" disabled={busy}><Search/> {busy?'Buscando...':'Buscar'}</button></form>{err&&<div className="form-error">{err}</div>}{o&&<div className="tracking-card"><div className="tracking-top"><div><strong>{o.order_code}</strong><span>Pedido Wilyu Market</span></div><span className="tracking-current">{orderText[o.status as OrderStatus]}</span></div><div className="route-wrap"><div className="route-line"/><div className="route-progress" style={{width:`${idx/(steps.length-1)*100}%`}}/><div className="delivery-vehicle" style={{left:`calc(${idx/(steps.length-1)*100}% - 18px)`}}>{o.status==='delivered'?'📦':'🚚'}</div>{steps.map((s,i)=><div className={`route-step ${i<=idx?'done':''}`} key={s} style={{left:`${i/(steps.length-1)*100}%`}}><div>{i<=idx?'✓':''}</div><span>{orderText[s]}</span></div>)}</div><div className="tracking-message"><PackageCheck/><div><strong>{orderText[o.status as OrderStatus]}</strong><span>Estamos avanzando con tu pedido.</span></div></div></div>}</main>
}

function CustomerAccountView({orders,mode,setMode,back}:any){
 const[current,setCurrent]=useState<any|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('')
 useEffect(()=>{getProfile().then(r=>{if(r.data)setCurrent(r.data);setLoading(false)})},[])
 if(loading)return <main className="page-main container narrow"><div className="mini-empty">Cargando cuenta...</div></main>
 if(current){
  const mine=orders.filter((o:Order)=>o.phone===current.phone)
  const saveProfile=async(patch:any)=>{
   const next={...current,...patch};setCurrent(next)
   await updateProfile({full_name:next.full_name||'',phone:next.phone||'',address:next.address||''})
  }
  return <main className="page-main container narrow"><button className="back-button" onClick={back}><ArrowLeft/> Volver</button><div className="account-profile-grid"><section className="account-card profile-card"><div className="profile-avatar">{(current.full_name||'U').charAt(0).toUpperCase()}</div><span className="mini-title">Mi cuenta</span><h1>{current.full_name||'Cliente'}</h1><p>Tus datos se completarán automáticamente en futuras compras.</p><div className="profile-fields"><label><Phone/>Teléfono<input value={current.phone||''} onChange={e=>saveProfile({phone:e.target.value})}/></label><label><MapPin/>Dirección<textarea value={current.address||''} onChange={e=>saveProfile({address:e.target.value})}/></label></div><button className="secondary-button full" onClick={async()=>{await signOut();setCurrent(null);setMode('login')}}><LogOut/> Cerrar sesión</button></section><section className="account-card orders-history"><div className="account-section-head"><div><span className="mini-title">Tus compras</span><h2>Historial de pedidos</h2></div><History/></div>{mine.length===0?<div className="mini-empty">Aún no tienes pedidos asociados.</div>:mine.map((o:Order)=><div className="history-order" key={o.id}><div><strong>{o.id}</strong><span>{new Date(o.createdAt).toLocaleDateString()} · {orderText[o.status]}</span></div><b>{money(o.total)}</b></div>)}</section></div></main>
 }
 return <main className="page-main container narrow"><button className="back-button" onClick={back}><ArrowLeft/> Volver</button><div className="customer-auth-wrap"><div className="customer-auth-copy"><span className="mini-title">Cuenta opcional</span><h1>Tu cuenta Wilyu</h1><p>Compra como invitado o crea una cuenta para acelerar futuras compras y conservar tu historial.</p></div><div className="account-card auth-card"><div className="auth-tabs"><button className={mode==='login'?'active':''} onClick={()=>{setMode('login');setError('')}}><LogIn/> Iniciar sesión</button><button className={mode==='register'?'active':''} onClick={()=>{setMode('register');setError('')}}><UserPlus/> Regístrate</button></div>{mode==='register'?<CustomerRegister success={async()=>{const p=await getProfile();if(p.data)setCurrent(p.data)}} error={error} setError={setError}/>:<CustomerLogin success={async()=>{const p=await getProfile();if(p.data)setCurrent(p.data)}} error={error} setError={setError}/>}</div></div></main>
}
function CustomerLogin({success,error,setError}:any){
 const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false)
 return <form className="customer-auth-form" onSubmit={async e=>{e.preventDefault();setBusy(true);const r=await signIn(email,password);setBusy(false);if(r.error){setError('Correo o contraseña incorrectos.');return}setError('');await success()}}><label>Correo<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Contraseña<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<div className="form-error">{error}</div>}<button className="primary-button full" disabled={busy}>{busy?'Entrando...':'Iniciar sesión'}</button></form>
}
function CustomerRegister({success,error,setError}:any){
 const[f,setF]=useState({name:'',email:'',phone:'',address:'',password:''}),[busy,setBusy]=useState(false)
 return <form className="customer-auth-form" onSubmit={async e=>{e.preventDefault();if(!f.name||!f.email||!f.phone||f.password.length<6){setError('Completa los datos y usa una contraseña de al menos 6 caracteres.');return}setBusy(true);const r=await signUp({email:f.email,password:f.password,full_name:f.name,phone:f.phone,address:f.address});setBusy(false);if(r.error){setError(r.error.message);return}setError('');if(r.data.session)await success();else setError('Cuenta creada. Revisa tu correo si Supabase solicita confirmación.')}}><label>Nombre completo<input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label><label>Correo<input type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></label><label>WhatsApp<input value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/></label><label>Dirección<textarea value={f.address} onChange={e=>setF({...f,address:e.target.value})}/></label><label>Contraseña<input type="password" value={f.password} onChange={e=>setF({...f,password:e.target.value})}/></label>{error&&<div className="form-error">{error}</div>}<button className="primary-button full" disabled={busy}>{busy?'Creando...':'Crear mi cuenta'}</button></form>
}

function Admin(props:any){
 const{products,setProducts,categories,setCategories,providers,setProviders,orders,setOrders,payments,setPayments,currencies,setCurrencies,remote,exit}=props
 const[ok,setOk]=useState(false),[checking,setChecking]=useState(true),[tab,setTab]=useState<AdminTab>('dashboard'),[edit,setEdit]=useState<Product|null>(null),[side,setSide]=useState(false)

 useEffect(()=>{
  import('./lib/supabase').then(({supabase})=>{
   supabase.auth.getSession().then(async({data})=>{
    if(!data.session){setChecking(false);return}
    const {data:profile}=await supabase.from('profiles').select('role').eq('id',data.session.user.id).single()
    setOk(profile?.role==='admin')
    setChecking(false)
   })
  })
 },[])

 const refreshProducts=async()=>{const r=await adminGetProducts();if(!r.error)setProducts((r.data||[]).map(mapRemoteProduct))}
 const refreshCategories=async()=>{const r=await adminGetCategories();if(!r.error)setCategories((r.data||[]).map(mapRemoteCategory))}

 if(checking)return <div className="login-screen"><div className="login-card"><img src="/wilyu-logo.svg"/><h1>Administración</h1><p>Verificando sesión segura...</p></div></div>
 if(!ok)return <Login enter={()=>setOk(true)} back={exit}/>

 const nav=(id:AdminTab,l:string,i:any)=><button className={`admin-nav-item ${tab===id&&!edit?'active':''}`} onClick={()=>{setTab(id);setEdit(null);setSide(false)}}>{i}<span>{l}</span></button>
 let body:any

 if(edit)body=<Editor p0={edit} categories={categories} providers={providers} remote={remote} back={()=>setEdit(null)}
  del={edit.id?async()=>{
   if(!confirm('¿Eliminar este producto?'))return
   if(remote&&!String(edit.id).startsWith('prod-')){
    const r=await deleteProduct(edit.id)
    if(r.error){alert('No se pudo eliminar: '+r.error.message);return}
    await refreshProducts()
   }else setProducts((x:Product[])=>x.filter(p=>p.id!==edit.id))
   alert('✅ Producto eliminado con éxito.')
   setEdit(null)
  }:undefined}
  save={async(p:Product,file?:File)=>{
   if(remote){
    const r=await saveProduct(p)
    if(r.error||!r.data){alert('No se pudo guardar: '+(r.error?.message||'Error'));return}
    if(file){
     const up=await uploadAndAttachProductImage(file,r.data.id)
     if(up.error)alert('Producto guardado, pero la foto falló: '+up.error.message)
    }
    await refreshProducts();alert('✅ Producto guardado con éxito.');setEdit(null);return
   }
   setProducts((x:Product[])=>p.id?x.map(a=>a.id===p.id?p:a):[{...p,id:uid('prod'),createdAt:new Date().toISOString()},...x]);setEdit(null)
  }}/>
 else if(tab==='products')body=<Products products={products} categories={categories} remote={remote} add={()=>setEdit(emptyProduct())} edit={setEdit}/>
 else if(tab==='orders')body=<Orders orders={orders} setOrders={setOrders} remote={remote}/>
 else if(tab==='categories')body=<Categories categories={categories} setCategories={setCategories} remote={remote} refresh={refreshCategories}/>
 else if(tab==='providers')body=<Providers providers={providers} setProviders={setProviders} remote={remote}/>
 else if(tab==='payments')body=<Payments payments={payments} setPayments={setPayments} remote={remote}/>
 else if(tab==='currencies')body=<Currencies cs={currencies} setCs={setCurrencies} remote={remote}/>
 else body=<Dashboard products={products} orders={orders}/>

 return <div className="admin-shell"><aside className={`admin-sidebar ${side?'open':''}`}><div className="admin-brand"><img src="/wilyu-logo.svg"/><div><strong>Wilyu Market</strong><span>Administración segura</span></div></div><nav>{nav('dashboard','Resumen',<LayoutDashboard/>)}{nav('products','Productos',<Boxes/>)}{nav('orders','Pedidos',<ClipboardList/>)}{nav('categories','Categorías',<Tags/>)}{nav('providers','Proveedores',<Users/>)}{nav('payments','Métodos de pago',<WalletCards/>)}{nav('currencies','Monedas y tasas',<RefreshCcw/>)}</nav><div className="admin-sidebar-bottom"><button onClick={exit}><Eye/> Ver tienda</button><button onClick={async()=>{await signOut();setOk(false)}}><LogOut/> Salir</button></div></aside>{side&&<button className="sidebar-overlay" onClick={()=>setSide(false)}/>}<div className="admin-main"><header className="admin-top"><button className="icon-button admin-menu-button" onClick={()=>setSide(true)}><Menu/></button><div><strong>Panel de control</strong><span>{remote?'Supabase conectado':'Modo local'}</span></div><button className="store-preview" onClick={exit}><Store/> Ver tienda</button></header><main className="admin-content">{body}</main></div></div>
}

function Login({enter,back}:any){
 const[e,se]=useState(''),[p,sp]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false)
 return <div className="login-screen"><button className="back-button login-back" onClick={back}><ArrowLeft/> Volver</button><form className="login-card" onSubmit={async x=>{
  x.preventDefault();setErr('');setBusy(true)
  const r=await signIn(e,p)
  if(r.error){setErr('Correo o contraseña incorrectos.');setBusy(false);return}
  const {supabase}=await import('./lib/supabase')
  const {data:profile}=await supabase.from('profiles').select('role').eq('id',r.data.user.id).single()
  if(profile?.role!=='admin'){await signOut();setErr('Esta cuenta no tiene permisos de administradora.');setBusy(false);return}
  setBusy(false);enter()
 }}><img src="/wilyu-logo.svg"/><h1>Administración</h1><p>Acceso seguro con Supabase Auth.</p><label>Correo<input type="email" value={e} onChange={x=>se(x.target.value)}/></label><label>Contraseña<input type="password" value={p} onChange={x=>sp(x.target.value)}/></label>{err&&<div className="form-error">{err}</div>}<button className="primary-button full" disabled={busy}>{busy?'Entrando...':'Entrar'}</button><small>Solo las cuentas con rol admin pueden modificar la tienda.</small></form></div>
}

function Dashboard({products,orders}:any){return <><div className="admin-page-head"><div><span className="mini-title">Hoy</span><h1>Resumen</h1></div></div><div className="stats-grid"><div className="stat-card"><Boxes/><div><span>Productos</span><strong>{products.length}</strong></div></div><div className="stat-card"><ClipboardList/><div><span>Pedidos</span><strong>{orders.length}</strong></div></div><div className="stat-card"><DollarSign/><div><span>Ventas</span><strong>{money(orders.reduce((a:number,o:Order)=>a+o.total,0))}</strong></div></div><div className="stat-card"><TrendingUp/><div><span>Activos</span><strong>{products.filter((p:Product)=>p.status!=='hidden').length}</strong></div></div></div></>}
function Products({products,categories,remote,add,edit}:any){return <><div className="admin-page-head"><div><span className="mini-title">Catálogo {remote?'· Supabase':'· Local'}</span><h1>Productos</h1></div><button className="primary-button" onClick={add}><Plus/> Nuevo producto</button></div><div className="admin-panel table-panel">{products.map((p:Product)=>{const[s,c]=status(p.status);return <div className="product-admin-row" key={p.id}><img src={p.image||'/wilyu-logo.svg'}/><div className="admin-product-main"><strong>{p.name}</strong><span>{categories.find((x:Category)=>x.id===p.categoryId)?.name} · {ownText[p.ownershipType]}</span></div><div className="admin-money"><span>Venta</span><strong>{money(p.salePrice)}</strong></div><div className="admin-money hide-mobile"><span>Ganancia/u.</span><strong>{money(p.salePrice-p.cost)}</strong></div><span className={`status-pill static ${c}`}>{s}</span><button className="edit-button" onClick={()=>edit(p)}><Pencil/> Editar</button></div>})}{products.length===0&&<div className="mini-empty">No hay productos todavía. Crea el primero desde este panel.</div>}</div></>}
function Editor({p0,categories,providers,back,save,del,remote}:any){
 const[p,setP]=useState<Product>({...p0}),[mode,setMode]=useState<'margin'|'final'>('margin'),[file,setFile]=useState<File|undefined>(undefined),[saving,setSaving]=useState(false)
 const cost=(n:number)=>setP(x=>({...x,cost:n,salePrice:mode==='margin'?Number((n*(1+x.marginPercent/100)).toFixed(2)):x.salePrice}))
 const margin=(n:number)=>setP(x=>({...x,marginPercent:n,salePrice:Number((x.cost*(1+n/100)).toFixed(2))}))
 const upload=(e:any)=>{const f=e.target.files?.[0];if(!f)return;if(f.size>5000000){alert('Imagen máxima 5 MB.');return}setFile(f);setP(x=>({...x,image:URL.createObjectURL(f)}))}
 return <form onSubmit={async e=>{e.preventDefault();if(!p.name)return;setSaving(true);try{await save(p,file)}finally{setSaving(false)}}}>
 <div className="admin-page-head"><div><button type="button" className="back-button" onClick={back}><ArrowLeft/> Volver</button><h1>{p.id?'Editar':'Nuevo'} producto</h1></div><div className="editor-actions">{del&&<button type="button" className="delete-button-small" onClick={del}><Trash2/></button>}<button className="primary-button" disabled={saving}><Save/> {saving?'Guardando...':'Guardar'}</button></div></div>
 <div className="editor-grid"><section className="admin-panel form-section"><h3>Información</h3><div className="form-grid"><label className="full-field">Nombre<input value={p.name} onChange={e=>setP({...p,name:e.target.value})}/></label><label>Categoría<select value={p.categoryId} onChange={e=>setP({...p,categoryId:e.target.value})}>{categories.map((c:Category)=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select></label><label>Estado<select value={p.status} onChange={e=>setP({...p,status:e.target.value as ProductStatus})}><option value="available">Disponible</option><option value="preorder">Por encargo</option><option value="soldout">Agotado</option><option value="hidden">Oculto</option></select></label><label className="full-field">Descripción<textarea value={p.description} onChange={e=>setP({...p,description:e.target.value})}/></label><label className="full-field">Cargar foto<div className="upload-box">{p.image?<img src={p.image}/>:<ImagePlus/>}<div><input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload}/><small>{remote?'La foto se subirá a Supabase Storage al guardar.':'Foto local de prueba.'}</small></div></div></label><label className="full-field">Tiempo de entrega<input value={p.deliveryText} onChange={e=>setP({...p,deliveryText:e.target.value})}/></label></div></section><section className="admin-panel form-section pricing-panel"><h3>Precio y ganancia · Privado</h3><div className="pricing-mode"><button type="button" className={mode==='margin'?'active':''} onClick={()=>setMode('margin')}>% ganancia</button><button type="button" className={mode==='final'?'active':''} onClick={()=>setMode('final')}>Precio final</button></div><label>Costo ($)<input type="number" step=".01" value={p.cost} onChange={e=>cost(Number(e.target.value))}/></label>{mode==='margin'?<label>Ganancia (%)<div className="margin-input-row"><input type="number" value={p.marginPercent} onChange={e=>margin(Number(e.target.value))}/><button type="button" onClick={()=>margin(30)}>30%</button></div></label>:<label>Venta ($)<input type="number" step=".01" value={p.salePrice} onChange={e=>setP({...p,salePrice:Number(e.target.value)})}/></label>}<div className="profit-preview"><div><span>Venta</span><strong>{money(p.salePrice)}</strong></div><div><span>Ganancia</span><strong>{money(p.salePrice-p.cost)}</strong></div></div></section><section className="admin-panel form-section"><h3>Origen</h3><label>Tipo<select value={p.ownershipType} onChange={e=>setP({...p,ownershipType:e.target.value as OwnershipType})}><option value="own">Propio</option><option value="supplier">Proveedor</option><option value="thirdparty">Tercero</option></select></label><label>Proveedor<select value={p.providerId||''} onChange={e=>setP({...p,providerId:e.target.value})}><option value="">Sin proveedor</option>{providers.map((x:Provider)=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label></section></div>
 </form>
}
function Orders({orders,setOrders,remote}:any){
 const[loading,setLoading]=useState(false)
 useEffect(()=>{if(!remote)return;setLoading(true);adminGetOrders().then(r=>{if(!r.error)setOrders((r.data||[]).map(mapOrder));setLoading(false)})},[remote])
 const change=async(o:Order,s:OrderStatus)=>{
  if(remote){
   const all=await adminGetOrders()
   const row=(all.data||[]).find((x:any)=>x.order_code===o.id)
   if(!row){alert('No se encontró el pedido.');return}
   const r=await updateOrderStatus(row.id,s)
   if(r.error){alert(r.error.message);return}
  }
  setOrders((x:Order[])=>x.map(a=>a.id===o.id?{...a,status:s}:a))
  alert('✅ Estado del pedido actualizado con éxito.')
 }
 return <><div className="admin-page-head"><div><span className="mini-title">{remote?'Supabase · Tiempo real al recargar':'Local'}</span><h1>Pedidos</h1></div></div>{loading?<div className="mini-empty">Cargando pedidos...</div>:<div className="order-admin-grid">{orders.map((o:Order)=><article className="admin-panel order-card" key={o.id}><div className="order-card-head"><div><strong>{o.id}</strong><span>{o.customerName} · {o.phone}</span></div><b>{money(o.total)}</b></div><label>Estado<select value={o.status} onChange={e=>change(o,e.target.value as OrderStatus)}>{steps.map(s=><option value={s} key={s}>{orderText[s]}</option>)}</select></label></article>)}</div>}</>
}

function Categories({categories,setCategories,remote,refresh}:any){
 const[n,sn]=useState(''),[e,se]=useState('🛍️'),[busy,setBusy]=useState(false)
 const add=async()=>{if(!n.trim())return;setBusy(true);try{if(remote){const r=await createCategory({name:n.trim(),emoji:e||'🛍️'});if(r.error){alert('No se pudo crear: '+r.error.message);return}await refresh()}else setCategories((x:Category[])=>[...x,{id:uid('cat'),name:n,emoji:e}]);alert('✅ Categoría guardada con éxito.');sn('')}finally{setBusy(false)}}
 const remove=async(id:string)=>{if(!confirm('¿Eliminar categoría?'))return;if(remote){const r=await deleteCategory(id);if(r.error){alert('No se pudo eliminar: '+r.error.message);return}await refresh()}else setCategories((x:Category[])=>x.filter(a=>a.id!==id));alert('✅ Categoría eliminada con éxito.')}
 return <><div className="admin-page-head"><div><span className="mini-title">{remote?'Supabase conectado':'Modo local'}</span><h1>Categorías</h1></div></div><div className="admin-two-col"><div className="admin-panel form-section"><label>Emoji<input value={e} onChange={x=>se(x.target.value)}/></label><label>Nombre<input value={n} onChange={x=>sn(x.target.value)}/></label><button className="primary-button" disabled={busy} onClick={add}>{busy?'Guardando...':'Agregar'}</button></div><div className="admin-panel">{categories.map((c:Category)=><div className="list-manage-row" key={c.id}><span>{c.emoji}</span><strong>{c.name}</strong><button className="danger-icon" onClick={()=>remove(c.id)}><Trash2/></button></div>)}</div></div></>
}
function Providers({providers,setProviders,remote}:any){
 const[n,sn]=useState(''),[p,sp]=useState(''),[busy,setBusy]=useState(false)
 const refresh=async()=>{const r=await adminGetProviders();if(!r.error)setProviders((r.data||[]).map(mapProvider))}
 const add=async()=>{if(!n.trim())return;setBusy(true);if(remote){const r=await createProvider({name:n.trim(),phone:p});if(r.error){alert(r.error.message);setBusy(false);return}await refresh()}else setProviders((x:Provider[])=>[...x,{id:uid('prov'),name:n,phone:p}]);alert('✅ Proveedor guardado con éxito.');sn('');sp('');setBusy(false)}
 const remove=async(id:string)=>{if(!confirm('¿Eliminar proveedor?'))return;if(remote){const r=await deleteProvider(id);if(r.error){alert(r.error.message);return}await refresh()}else setProviders((a:Provider[])=>a.filter(b=>b.id!==id));alert('✅ Proveedor eliminado con éxito.')}
 return <><div className="admin-page-head"><div><span className="mini-title">{remote?'Supabase':'Local'}</span><h1>Proveedores</h1></div></div><div className="admin-two-col"><div className="admin-panel form-section"><label>Nombre<input value={n} onChange={x=>sn(x.target.value)}/></label><label>Teléfono<input value={p} onChange={x=>sp(x.target.value)}/></label><button className="primary-button" disabled={busy} onClick={add}>{busy?'Guardando...':'Agregar'}</button></div><div className="admin-panel">{providers.map((x:Provider)=><div className="list-manage-row provider-row" key={x.id}><div><strong>{x.name}</strong><span>{x.phone}</span></div><button className="danger-icon" onClick={()=>remove(x.id)}><Trash2/></button></div>)}</div></div></>
}

function Payments({payments,setPayments,remote}:any){
 const[ed,setEd]=useState<PaymentMethod|null>(null)
 const blank:PaymentMethod={id:'',name:'',type:'other',details:'',active:true,requiresProof:true,acceptedCurrencies:['USD']}
 const refresh=async()=>{const r=await adminGetPaymentMethods();if(!r.error)setPayments((r.data||[]).map(mapPayment))}
 if(ed)return <PayEdit p0={ed} back={()=>setEd(null)} save={async(p:PaymentMethod)=>{if(remote){const r=await savePaymentMethod(p);if(r.error){alert(r.error.message);return}await refresh()}else setPayments((x:PaymentMethod[])=>p.id?x.map(a=>a.id===p.id?p:a):[...x,{...p,id:uid('pay')}]);alert('✅ Método de pago guardado con éxito.');setEd(null)}}/>
 return <><div className="admin-page-head"><div><span className="mini-title">Checkout · {remote?'Supabase':'Local'}</span><h1>Métodos de pago</h1></div><button className="primary-button" onClick={()=>setEd(blank)}><Plus/> Agregar método</button></div><div className="admin-panel payment-admin-list">{payments.map((p:PaymentMethod)=><div className="payment-admin-row" key={p.id}><div className={`pay-icon ${p.active?'active':''}`}>{p.type==='bank'?<Landmark/>:p.type==='mobile'?<CreditCard/>:p.type==='binance'?<CircleDollarSign/>:<WalletCards/>}</div><div><strong>{p.name}</strong><span>{p.details}</span><small>{p.acceptedCurrencies.join(' · ')}</small></div><span className={`method-state ${p.active?'on':'off'}`}>{p.active?'Activo':'Inactivo'}</span><button className="edit-button" onClick={()=>setEd(p)}><Pencil/> Editar</button></div>)}</div></>
}

function PayEdit({p0,back,save}:any){const[p,setP]=useState<PaymentMethod>({...p0}),curr:CurrencyCode[]=['USD','EUR','VES','USDT'];return <><div className="admin-page-head"><div><button className="back-button" onClick={back}><ArrowLeft/> Volver</button><h1>Método de pago</h1></div><button className="primary-button" onClick={()=>p.name&&save(p)}><Save/> Guardar</button></div><div className="admin-panel form-section payment-editor"><label>Nombre<input value={p.name} onChange={e=>setP({...p,name:e.target.value})}/></label><label>Tipo<select value={p.type} onChange={e=>setP({...p,type:e.target.value as any})}><option value="mobile">Pago Móvil</option><option value="bank">Transferencia</option><option value="paypal">PayPal</option><option value="binance">Binance / USDT</option><option value="other">Otro</option></select></label><label>Datos e instrucciones<textarea value={p.details} onChange={e=>setP({...p,details:e.target.value})}/></label><div className="check-grid">{curr.map(c=><label className="check-label" key={c}><input type="checkbox" checked={p.acceptedCurrencies.includes(c)} onChange={e=>setP({...p,acceptedCurrencies:e.target.checked?[...p.acceptedCurrencies,c]:p.acceptedCurrencies.filter(x=>x!==c)})}/><span>{c}</span></label>)}</div><label className="check-label"><input type="checkbox" checked={p.requiresProof} onChange={e=>setP({...p,requiresProof:e.target.checked})}/><span>Pedir referencia</span></label><label className="check-label"><input type="checkbox" checked={p.active} onChange={e=>setP({...p,active:e.target.checked})}/><span>Activo</span></label></div></>}
function Currencies({cs,setCs,remote}:any){
 const[s,setS]=useState<CurrencySettings>({...cs}),[msg,setMsg]=useState(''),[load,setLoad]=useState(false)
 const online=async()=>{setLoad(true);setMsg('');try{const r=await fetch('https://open.er-api.com/v6/latest/USD');if(!r.ok)throw 0;const d=await r.json(),eur=Number(d?.rates?.EUR),ves=Number(d?.rates?.VES);if(!eur||!ves)throw 0;const n={...s,rates:{...s.rates,USD:1,EUR:eur,VES:ves,USDT:1},lastUpdated:new Date().toISOString(),sourceLabel:'Referencia online USD'};setS(n);setMsg('Tasas obtenidas. Pulsa Guardar para enviarlas a Supabase.')}catch{setMsg('No fue posible actualizar. Usa la tasa manual.')}finally{setLoad(false)}}
 const save=async()=>{if(remote){const r=await saveRates(s.rates);if(r.error){setMsg(r.error.message);return}}setCs(s);setMsg('✅ Tasas guardadas con éxito.')}
 return <><div className="admin-page-head"><div><span className="mini-title">Conversión · {remote?'Supabase':'Local'}</span><h1>Monedas y tasas</h1></div><button className="primary-button" onClick={save}><Save/> Guardar</button></div><div className="admin-two-col currency-admin"><div className="admin-panel form-section"><h3>Monedas visibles</h3>{(['USD','EUR','VES','USDT']as CurrencyCode[]).map(c=><label className="check-label" key={c}><input type="checkbox" disabled={c==='USD'} checked={s.enabled.includes(c)} onChange={e=>setS({...s,enabled:e.target.checked?[...s.enabled,c]:s.enabled.filter(x=>x!==c)})}/><span>{c}{c==='USD'?' · base':''}</span></label>)}<button className="secondary-button" onClick={online} disabled={load}><RefreshCcw/> {load?'Actualizando...':'Actualizar tasa ahora'}</button>{msg&&<div className="info-message">{msg}</div>}</div><div className="admin-panel form-section"><h3>Tasas por 1 USD</h3>{(['EUR','VES','USDT']as CurrencyCode[]).map(c=><label key={c}>{c}<input type="number" step=".0001" value={s.rates[c]} onChange={e=>setS({...s,rates:{...s.rates,[c]:Number(e.target.value)}})}/></label>)}<div className="rate-preview"><span>Ejemplo $20</span><strong>{money(convert(20,'EUR',s),'EUR')} · {money(convert(20,'VES',s),'VES')} · {money(convert(20,'USDT',s),'USDT')}</strong></div></div></div></>
}

