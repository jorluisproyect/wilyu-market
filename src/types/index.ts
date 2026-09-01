export type ProductStatus = 'available' | 'preorder' | 'soldout' | 'hidden'
export type OwnershipType = 'own' | 'supplier' | 'thirdparty'
export type OrderStatus = 'new' | 'confirmed' | 'supplier' | 'preparing' | 'delivery' | 'delivered'

export interface Category {
  id: string
  name: string
  emoji: string
}

export interface Provider {
  id: string
  name: string
  phone: string
  notes?: string
}

export interface Product {
  id: string
  name: string
  categoryId: string
  description: string
  image: string
  cost: number
  salePrice: number
  marginPercent: number
  status: ProductStatus
  deliveryText: string
  ownershipType: OwnershipType
  ownerName?: string
  providerId?: string
  featured?: boolean
  createdAt: string
}

export interface CartLine {
  productId: string
  quantity: number
}

export interface Order {
  id: string
  customerName: string
  phone: string
  address: string
  notes: string
  items: CartLine[]
  total: number
  status: OrderStatus
  createdAt: string
}

export type CurrencyCode = 'USD' | 'EUR' | 'VES' | 'USDT'
export interface PaymentMethod { id:string; name:string; type:'mobile'|'bank'|'paypal'|'binance'|'other'; details:string; active:boolean; requiresProof:boolean; acceptedCurrencies:CurrencyCode[] }
export interface CurrencySettings { base:CurrencyCode; enabled:CurrencyCode[]; autoUpdate:boolean; rates:Record<CurrencyCode,number>; lastUpdated:string; sourceLabel:string }
