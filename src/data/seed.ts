import { Category, Product, Provider } from '../types'

export const seedCategories: Category[] = [
  { id: 'reposteria', name: 'Repostería', emoji: '🧁' },
  { id: 'utensilios', name: 'Utensilios', emoji: '🍴' },
  { id: 'alimentos', name: 'Alimentos', emoji: '🥫' },
  { id: 'hogar', name: 'Hogar', emoji: '🏠' },
  { id: 'belleza', name: 'Belleza', emoji: '✨' },
  { id: 'tecnologia', name: 'Tecnología', emoji: '📱' }
]

export const seedProviders: Provider[] = [
  { id: 'prov-1', name: 'Proveedor principal', phone: '', notes: 'Proveedor directo' }
]

export const seedProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Molde desmontable 24 cm',
    categoryId: 'reposteria',
    description: 'Molde práctico para tortas y postres. Ideal para uso doméstico o emprendimientos.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
    cost: 10,
    salePrice: 13,
    marginPercent: 30,
    status: 'available',
    deliveryText: 'Entrega aproximada en 24 horas',
    ownershipType: 'supplier',
    ownerName: '',
    providerId: 'prov-1',
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Set de boquillas para decoración',
    categoryId: 'utensilios',
    description: 'Set surtido para decoración de cupcakes, tortas y postres.',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
    cost: 8,
    salePrice: 10.4,
    marginPercent: 30,
    status: 'preorder',
    deliveryText: 'Entrega estimada: 2–3 días',
    ownershipType: 'supplier',
    providerId: 'prov-1',
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Sprinkles de colores',
    categoryId: 'reposteria',
    description: 'Decoración comestible para cupcakes, tortas, galletas y postres.',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=900&q=80',
    cost: 4,
    salePrice: 5.2,
    marginPercent: 30,
    status: 'available',
    deliveryText: 'Entrega aproximada en 24 horas',
    ownershipType: 'own',
    featured: true,
    createdAt: new Date().toISOString()
  }
]
