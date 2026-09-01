import { supabase } from './supabase'

export async function testSupabaseConnection() {
  const { error } = await supabase.from('categories').select('id').limit(1)
  if (error) throw error
  return true
}

export const getCategories = () =>
  supabase.from('categories').select('*').eq('active', true).order('name')

export const getProducts = () =>
  supabase.from('products')
    .select('*, categories(*), product_images(*)')
    .eq('active', true)
    .neq('status', 'hidden')
    .order('created_at', { ascending: false })

export const getPaymentMethods = () =>
  supabase.from('payment_methods').select('*').eq('active', true).order('created_at')

export const getCurrencyRates = () =>
  supabase.from('currency_rates').select('*')

export const signIn = (email:string,password:string) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = () => supabase.auth.signOut()

export const signUp = (data:{email:string,password:string,full_name:string,phone:string,address?:string}) =>
  supabase.auth.signUp({
    email:data.email,
    password:data.password,
    options:{data:{full_name:data.full_name,phone:data.phone,address:data.address ?? ''}}
  })

export const trackOrder = (code:string) =>
  supabase.rpc('track_order', { p_order_code: code })

export async function uploadProductImage(file:File, productId:string) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${productId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('wilyu-products')
    .upload(path,file,{cacheControl:'3600',upsert:false})
  if(error) return {data:null,error}
  const { data } = supabase.storage.from('wilyu-products').getPublicUrl(path)
  return {data:{path,publicUrl:data.publicUrl},error:null}
}

export async function adminGetCategories() {
  return supabase.from('categories').select('*').order('name')
}

export async function createCategory(input:{name:string;emoji:string;slug?:string}) {
  const slug = input.slug || input.name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
  return supabase.from('categories').insert({
    name: input.name,
    emoji: input.emoji || '🛍️',
    slug,
    active: true
  }).select().single()
}

export async function deleteCategory(id:string) {
  return supabase.from('categories').delete().eq('id', id)
}

export async function adminGetProducts() {
  return supabase
    .from('products')
    .select('*, categories(*), product_images(*)')
    .order('created_at', { ascending: false })
}

export async function saveProduct(input:any) {
  const payload = {
    name: input.name,
    description: input.description || '',
    category_id: input.categoryId || null,
    provider_id: input.providerId || null,
    ownership_type: input.ownershipType || 'supplier',
    owner_name: input.ownerName || null,
    cost: Number(input.cost || 0),
    margin_percent: Number(input.marginPercent || 30),
    sale_price: Number(input.salePrice || 0),
    status: input.status || 'available',
    delivery_text: input.deliveryText || 'Entrega aproximada en 24 horas',
    featured: !!input.featured,
    active: true,
    updated_at: new Date().toISOString()
  }

  if (input.id && !String(input.id).startsWith('prod-')) {
    return supabase.from('products').update(payload).eq('id', input.id).select().single()
  }

  return supabase.from('products').insert(payload).select().single()
}

export async function deleteProduct(id:string) {
  return supabase.from('products').delete().eq('id', id)
}

export async function replaceProductImage(productId:string, imageUrl:string) {
  const { error: delError } = await supabase.from('product_images').delete().eq('product_id', productId)
  if (delError) return { data:null, error:delError }

  if (!imageUrl) return { data:null, error:null }

  return supabase.from('product_images').insert({
    product_id: productId,
    image_url: imageUrl,
    position: 0
  }).select().single()
}

export async function uploadAndAttachProductImage(file:File, productId:string) {
  const uploaded = await uploadProductImage(file, productId)
  if (uploaded.error || !uploaded.data) return uploaded
  const attached = await replaceProductImage(productId, uploaded.data.publicUrl)
  if (attached.error) return { data:null, error:attached.error }
  return { data:{ publicUrl: uploaded.data.publicUrl }, error:null }
}

export const adminGetProviders = () =>
  supabase.from('providers').select('*').order('created_at', { ascending:false })

export const createProvider = (input:{name:string;phone?:string}) =>
  supabase.from('providers').insert({
    name:input.name, phone:input.phone || '', active:true
  }).select().single()

export const deleteProvider = (id:string) =>
  supabase.from('providers').delete().eq('id', id)

export const adminGetPaymentMethods = () =>
  supabase.from('payment_methods').select('*').order('created_at')

export async function savePaymentMethod(input:any){
  const payload = {
    name: input.name,
    type: input.type,
    details: input.details || '',
    active: !!input.active,
    requires_proof: !!input.requiresProof,
    accepted_currencies: input.acceptedCurrencies || ['USD'],
    updated_at: new Date().toISOString()
  }
  if(input.id && !String(input.id).startsWith('p')){
    return supabase.from('payment_methods').update(payload).eq('id',input.id).select().single()
  }
  return supabase.from('payment_methods').insert(payload).select().single()
}

export const deletePaymentMethod = (id:string) =>
  supabase.from('payment_methods').delete().eq('id',id)

export const getRates = () =>
  supabase.from('currency_rates').select('*')

export async function saveRates(rates:Record<string,number>){
  const rows = Object.entries(rates).map(([currency,rate])=>({
    currency, rate:Number(rate), source:'Panel Wilyu', updated_at:new Date().toISOString()
  }))
  return supabase.from('currency_rates').upsert(rows,{onConflict:'currency'}).select()
}

export async function createOrderRemote(input:{
  customerId?:string|null
  customerName:string
  phone:string
  address?:string
  paymentMethodId?:string|null
  paymentReference?:string
  notes?:string
  total:number
  rates:Record<string,number>
  items:{productId:string;productName:string;quantity:number;unitPrice:number}[]
}){
  const orderRes = await supabase.from('orders').insert({
    customer_id: input.customerId || null,
    customer_name: input.customerName,
    phone: input.phone,
    address: input.address || '',
    payment_method_id: input.paymentMethodId || null,
    payment_reference: input.paymentReference || null,
    payment_status: 'review',
    status: 'new',
    subtotal: input.total,
    delivery_fee: 0,
    total: input.total,
    usd_rate: input.rates.USD || 1,
    eur_rate: input.rates.EUR || null,
    ves_rate: input.rates.VES || null,
    usdt_rate: input.rates.USDT || 1,
    notes: input.notes || ''
  }).select().single()

  if(orderRes.error || !orderRes.data) return {data:null,error:orderRes.error}

  const items = input.items.map(i=>({
    order_id: orderRes.data.id,
    product_id: i.productId || null,
    product_name: i.productName,
    quantity: i.quantity,
    unit_price: i.unitPrice,
    line_total: i.unitPrice * i.quantity
  }))

  const itemsRes = await supabase.from('order_items').insert(items)
  if(itemsRes.error) return {data:null,error:itemsRes.error}

  return {data:orderRes.data,error:null}
}

export const adminGetOrders = () =>
  supabase.from('orders')
    .select('*, order_items(*)')
    .order('created_at',{ascending:false})

export const updateOrderStatus = (id:string,status:string) =>
  supabase.from('orders').update({
    status,
    updated_at:new Date().toISOString()
  }).eq('id',id).select().single()

export async function getAuthUser(){
  const {data}=await supabase.auth.getUser()
  return data.user
}

export async function getProfile(){
  const user=await getAuthUser()
  if(!user)return {data:null,error:null}
  return supabase.from('profiles').select('*').eq('id',user.id).single()
}

export async function updateProfile(input:{full_name:string;phone:string;address:string}){
  const user=await getAuthUser()
  if(!user)return {data:null,error:new Error('No session')}
  return supabase.from('profiles').update({
    full_name:input.full_name,
    phone:input.phone,
    address:input.address,
    updated_at:new Date().toISOString()
  }).eq('id',user.id).select().single()
}
