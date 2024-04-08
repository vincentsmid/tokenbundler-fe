<template>
  <div>
    <button @click="manualRefresh">Refresh NFTs</button>
    <ul>
      <li v-for="nft in nfts" :key="nft.token_address">
        <h2>{{ nft.name }}</h2>
        <img :src="nft.image_link" :alt="nft.name" width="100" />
        <p>{{ nft.description }}</p>
        <button @click="doSomething(nft)">Action</button>
        <span v-if="isSelected(nft.token_address)">Selected</span>
        <p>{{ nft.token_address }}</p>
        <p>{{ nft.token_id }}</p>
      </li>
    </ul>
    <ul>
      <li v-for="token in tokens" :key="token.token_address">
        <h2>{{ token.name }}</h2>
        <p>Balance: {{ token.balance }}</p>
        <p>USD Value: {{ token.usd_value }}</p>
        <p>USD Value Percent Change: {{ token.usd_value_percent_change }}</p>
        <button @click="doSomething(token)">Action</button>
        <span v-if="isSelected(token.token_address)">Selected</span>
        <p>{{ token.token_address }}</p>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { ref, watch } from 'vue'
import { userData } from '../store'

interface NftInformationType {
  amount: number
  token_id: number
  token_address: string
  contract_type: string
  block_number: number
  name: string
  description: string
  image_link: string
}

interface TokenInformationType {
  token_address: string
  symbol: string
  name: string
  balance: string
  usd_value: string
  usd_value_percent_change: string
  image: string
}

export default {
  setup() {
    const nfts = ref<NftInformationType[]>([])
    const tokens = ref<TokenInformationType[]>([])
    const selectedNfts = ref([])

    const fetchNFTs = async (refresh: boolean = false) => {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify({
          wallet_id: userData.wallet,
          chain: 'sepolia'
        })
      }
      try {
        const response_nfts = await fetch(
          `http://localhost:8000/api/v1/nft_info/?refresh=${refresh}`,
          requestOptions
        )
        const response_tokens = await fetch(
          `http://localhost:8000/api/v1/token_info/?refresh=${refresh}`,
          requestOptions
        )
        if (!response_nfts.ok || !response_tokens.ok)
          throw new Error(`HTTP error! status: ${(response_nfts.status, response_tokens.status)}`)
        const nft_data = await response_nfts.json()
        const token_data = await response_tokens.json()

        nfts.value = JSON.parse(nft_data)
        tokens.value = JSON.parse(token_data)
      } catch (error) {
        console.error('Error fetching NFT data:', error)
      }
    }

    const doSomething = (nft: any) => {
      if (!selectedNfts.value.find((item) => item.token_address === nft.token_address)) {
        selectedNfts.value.push(nft)
        console.log('Added to selection:', nft.token_address)
      } else {
        console.log('NFT already selected:', nft.token_address)
      }
    }

    const isSelected = (tokenaddress: String) => {
      return !!selectedNfts.value.find((nft) => nft.token_address === tokenaddress)
    }

    const logUserData = () => {
      console.log(userData.wallet, userData.chainID, userData.isConnected)
    }

    const manualRefresh = () => {
      fetchNFTs(true)
    }

    watch(
      () => userData.wallet,
      (newWallet) => {
        if (newWallet) {
          fetchNFTs()
        }
      },
      {
        immediate: true
      }
    )

    // onMounted(() => {
    //   fetchNFTs()
    // })

    return {
      nfts,
      tokens,
      doSomething,
      logUserData,
      isSelected,
      selectedNfts,
      manualRefresh
    }
  }
}
</script>

<style>
/* Your styles here */
</style>
