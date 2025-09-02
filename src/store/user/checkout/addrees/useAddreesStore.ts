import { create } from 'zustand'
import axios from 'axios'

export const USER_GET_ADDRESS_URL = 'https://api.nafaskarya.my.id/api/checkout/addresses'

export type Address = {
  uuid: string
  receiver_name: string
  phone: string
  address_line: string
  province: string
  regency: string
  district: string
  village: string
  postal_code: string
  [key: string]: string
}

type AddressListState = {
  addresses: Address[]
  loading: boolean
  error: string | null
  fetchAddresses: () => Promise<void>
  resetStatus: () => void
}

export const useAddressStore = create<AddressListState>((set) => ({
  addresses: [],
  loading: false,
  error: null,

  resetStatus: () => set({ error: null }),

  fetchAddresses: async () => {
    set({ loading: true, error: null })
    try {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('user_token') : null
      if (!token) throw new Error('Token tidak ditemukan. Silakan login dulu.')

      const res = await axios.get(USER_GET_ADDRESS_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      set({ addresses: res.data.data, loading: false, error: null })
    } catch (err: any) {
      let errorMsg = 'Unknown error'
      // Handle Laravel error
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error
      } else if (err.message) {
        errorMsg = err.message
      }
      set({ loading: false, error: errorMsg })
    }
  },
}))
