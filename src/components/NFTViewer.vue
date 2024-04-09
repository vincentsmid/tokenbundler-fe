<template>
  <div>
    <button @click="manualRefresh" style="position: absolute">Refresh NFTs</button>
    <button @click="clearSelection" style="position: absolute; left: 300px">Clear Selection</button>
    <ul>
      <li v-for="nft in nfts" :key="nft.token_address">
        <h2>{{ nft.name }}</h2>
        <img :src="nft.image_link" :alt="nft.name" width="100" />
        <p>{{ nft.description }}</p>
        <button @click="doSomething(nft)">Action</button>
        <span v-if="isSelected(nft.token_id)">Selected</span>
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
        <input type="number" v-model="token.amount" placeholder="Enter number" />
        <button @click="doSomething(token, token.amount)">Action</button>
        <span v-if="isSelected(token.token_address)">Selected</span>
        <p>{{ token.token_address }}</p>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { ref, watch, watchEffect } from 'vue'
import type { Ref } from 'vue'
import { userData, selectedItems, refreshStore } from '../store'
import { hexlify } from 'ethers'

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
  amount: number
}

interface PassedInformationType {
  id: number
  assetAddress: string
  category: number
  amount: number | 1
}

export default {
  setup() {
    const nfts = ref<NftInformationType[]>([])
    const tokens = ref<TokenInformationType[]>([])
    const selectedNfts: Ref<PassedInformationType[]> = ref([])

    const clearSelection = () => {
      selectedNfts.value = []
    }

    const fetchNFTs = async (refresh: boolean = false) => {
      const chainID =
        parseInt(userData.chainID) === 11155111
          ? 'sepolia'
          : parseInt(userData.chainID) === 1
            ? 'eth'
            : undefined

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify({
          wallet_id: userData.wallet,
          chain: chainID
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

    const doSomething = (
      item: NftInformationType | TokenInformationType,
      amountSent: number = 1
    ) => {
      // @ts-ignore
      console.log(item.contract_type)
      const passedInformation: PassedInformationType = {
        assetAddress: hexlify(item.token_address),
        id: 'token_id' in item ? item.token_id : 0,
        category:
          'contract_type' in item
            ? item.contract_type === 'ERC721'
              ? 1
              : item.contract_type === 'ERC1155'
                ? 2
                : item.contract_type === 'ERC20'
                  ? 0
                  : 0
            : 0,
        amount: 'amount' in item ? item.amount : amountSent
      }

      const isAlreadySelected = selectedNfts.value.find(
        // @ts-ignore
        (nft) => nft.token_address === item.token_address
      )
      if (!isAlreadySelected) {
        selectedNfts.value.push(passedInformation)
        console.log('Added to selection:', item.token_address)
      } else {
        console.log('Item already selected:', item.token_address)
      }
    }

    const isSelected = (tokenID: Number | String) => {
      // @ts-ignore
      return !!selectedNfts.value.find((nft) => nft.id === tokenID)
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

    watch(
      selectedNfts,
      (newVal) => {
        // @ts-ignore
        selectedItems.items = newVal
        console.log('Selected items:', selectedItems.items)
      },
      {
        deep: true
      }
    )

    watchEffect(() => {
      manualRefresh()
      console.log(refreshStore.currentState)
    })

    return {
      nfts,
      tokens,
      doSomething,
      logUserData,
      isSelected,
      selectedNfts,
      manualRefresh,
      clearSelection
    }
  }
}
</script>

<style></style>
