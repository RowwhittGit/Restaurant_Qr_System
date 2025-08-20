import {create} from "zustand"


interface FoodItem {
  id: number
  image: string
  name: string
  category: string[]
  price: number
}

interface OrderItem extends FoodItem {
  quantity: number
}

interface OrderStore {
  orders: OrderItem[]
  addToOrder: (item: FoodItem) => void
  increaseQuantity: (id: number) => void
  decreaseQuantity: (id: number) => void
  removeFromOrder: (id: number) => void
  clearOrders: () => void
  placeOrder: () => void
}


export const useOrderStore = create<OrderStore>((set, get) => ({

  orders: [],

  // Add item to order (if exists, increase qty)
  addToOrder: (item) => {
    const orders = get().orders
    const existing = orders.find(order => order.id === item.id)

    if (existing) {
      set({
        orders: orders.map(order =>
          order.id === item.id ? { ...order, quantity: order.quantity + 1 } : order
        ),
      })
    } else {
      set({ orders: [...orders, { ...item, quantity: 1 }] })
    }
    console.log("order placed successfully", get().orders);
    
  },

  increaseQuantity: (id) =>
    set({
      orders: get().orders.map(order =>
        order.id === id ? { ...order, quantity: order.quantity + 1 } : order
      ),
    }),

  decreaseQuantity: (id) => {
    const orders = get().orders
    const target = orders.find(order => order.id === id)
    if (!target) return

    if (target.quantity === 1) {
      // remove item if quantity hits 0
      set({ orders: orders.filter(order => order.id !== id) })
    } else {
      set({
        orders: orders.map(order =>
          order.id === id ? { ...order, quantity: order.quantity - 1 } : order
        ),
      })
    }
  },

  removeFromOrder: (id) =>
    set({ orders: get().orders.filter(order => order.id !== id) }),

  clearOrders: () => set({ orders: [] }),

  placeOrder: () => {
    const currentOrders = get().orders
    if (currentOrders.length === 0) {
      alert("No items to place order.")
      return
    }

    // here you can call an API to submit the order
    console.log("Placing order:", currentOrders)

    // Clear after placing order
    set({ orders: [] })
    alert("Order placed successfully!")
  },
}))