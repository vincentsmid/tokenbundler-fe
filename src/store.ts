import { reactive } from 'vue'

export const userData = reactive({
  wallet: '',
  chainID: 'eth',
  isConnected: false
})

export const selectedItems = reactive({
  items: []
})

export const refreshStore = reactive({
  currentState: ''
})
