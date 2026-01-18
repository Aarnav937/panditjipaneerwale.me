import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not found. Some features may not work.')
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
)

// Helper functions for common operations
export const auth = {
    // Sign up with email
    signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password })
        return { data, error }
    },

    // Sign in with email
    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        return { data, error }
    },

    // Sign in with phone (OTP)
    signInWithPhone: async (phone) => {
        const { data, error } = await supabase.auth.signInWithOtp({ phone })
        return { data, error }
    },

    // Verify phone OTP
    verifyOtp: async (phone, token) => {
        const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
        return { data, error }
    },

    // Sign out
    signOut: async () => {
        const { error } = await supabase.auth.signOut()
        return { error }
    },

    // Get current user
    getUser: async () => {
        const { data: { user } } = await supabase.auth.getUser()
        return user
    },

    // Get session
    getSession: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        return session
    }
}

// Database helper functions
export const db = {
    // Customers
    customers: {
        getByPhone: async (phone) => {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('phone', phone)
                .single()
            return { data, error }
        },

        create: async (customer) => {
            const { data, error } = await supabase
                .from('customers')
                .insert([customer])
                .select()
                .single()
            return { data, error }
        },

        update: async (id, updates) => {
            const { data, error } = await supabase
                .from('customers')
                .update(updates)
                .eq('id', id)
                .select()
                .single()
            return { data, error }
        }
    },

    // Orders
    orders: {
        create: async (order) => {
            const { data, error } = await supabase
                .from('orders')
                .insert([order])
                .select()
                .single()
            return { data, error }
        },

        getByCustomer: async (customerId) => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_id', customerId)
                .order('created_at', { ascending: false })
            return { data, error }
        },

        getByPhone: async (phone) => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_phone', phone)
                .order('created_at', { ascending: false })
            return { data, error }
        },

        updateStatus: async (id, status) => {
            const { data, error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', id)
                .select()
                .single()
            return { data, error }
        }
    }
}
