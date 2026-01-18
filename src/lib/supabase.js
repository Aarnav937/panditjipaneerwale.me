import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if credentials are available
const hasCredentials = supabaseUrl && supabaseAnonKey

if (!hasCredentials) {
    console.warn('⚠️ Supabase credentials not found. Database features disabled.')
}

// Only create client if credentials exist
export const supabase = hasCredentials
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    })
    : null

// Helper functions - return empty/error if no client
export const auth = {
    signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    signIn: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    signInWithPhone: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    verifyOtp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    signOut: async () => ({ error: null }),
    getUser: async () => null,
    getSession: async () => null
}

// Database helpers - gracefully handle no client
export const db = {
    customers: {
        getByPhone: async (phone) => {
            if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
            const { data, error } = await supabase.from('customers').select('*').eq('phone', phone).single()
            return { data, error }
        },
        create: async (customer) => {
            if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
            const { data, error } = await supabase.from('customers').insert([customer]).select().single()
            return { data, error }
        },
        update: async (id, updates) => {
            if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
            const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select().single()
            return { data, error }
        }
    },
    orders: {
        create: async (order) => {
            if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
            const { data, error } = await supabase.from('orders').insert([order]).select().single()
            return { data, error }
        },
        getByCustomer: async (customerId) => {
            if (!supabase) return { data: [], error: null }
            const { data, error } = await supabase.from('orders').select('*').eq('customer_id', customerId).order('created_at', { ascending: false })
            return { data, error }
        },
        getByPhone: async (phone) => {
            if (!supabase) return { data: [], error: null }
            const { data, error } = await supabase.from('orders').select('*').eq('customer_phone', phone).order('created_at', { ascending: false })
            return { data, error }
        },
        updateStatus: async (id, status) => {
            if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
            const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single()
            return { data, error }
        }
    }
}
