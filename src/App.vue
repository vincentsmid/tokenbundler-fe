<script setup lang="ts">
// import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/vue'
// import { mainnet, arbitrum } from 'viem/chains'
// import { reconnect } from '@wagmi/core'

// // 1. Define constants
// const projectId = 'cd7cca4c881f9d1c96a8da90262b3eac'

// // 2. Create wagmiConfig
// const metadata = {
//   name: 'Web3Modal',
//   description: 'Web3Modal Example',
//   url: 'http://localhost:5173', // origin must match your domain & subdomain
//   icons: ['https://avatars.githubusercontent.com/u/37784886']
// }

// const chains = [mainnet, arbitrum]
// const config = defaultWagmiConfig({
//   chains, // required
//   projectId, // required
//   metadata, // required
//   enableWalletConnect: true, // Optional - true by default
//   enableInjected: true, // Optional - true by default
//   enableEIP6963: true, // Optional - true by default
//   enableCoinbase: true, // Optional - true by default
//   ssr: false
// })

// reconnect(config)
// // 3. Create modal
// createWeb3Modal({
//   wagmiConfig: config,
//   projectId,
//   enableAnalytics: true // Optional - defaults to your Cloud configuration
// })

import {
  createWeb3Modal,
  defaultConfig,
  useWeb3Modal,
  useWeb3ModalAccount
} from '@web3modal/ethers/vue'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'cd7cca4c881f9d1c96a8da90262b3eac'

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
}

const sepolia = {
  chainId: 11155111,
  name: 'Sepolia',
  currency: 'SEP',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: 'https://rpc.sepolia.org/'
}

// 3. Create your application's metadata object
const metadata = {
  name: 'Token Bundler',
  description: 'bundly bundly',
  url: 'http://localhost:5173', // url must match your domain & subdomain
  icons: ['https://avatars.mywebsite.com/']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  // rpcUrl: '...' // used for the Coinbase SDK
  defaultChainId: 1 // used for the Coinbase SDK
})

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  chains: [mainnet, sepolia],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})

const modal = useWeb3Modal()

const { address, chainId, isConnected } = useWeb3ModalAccount()

function test() {
  if (isConnected) {
    console.log('Connected')
  } else {
    console.log('Not connected')
  }
}
</script>

<template>
  <button @click="modal.open()">Open Connect Modal</button>
  <button @click="modal.open({ view: 'Networks' })">Open Network Modal</button>
  <button @click="console.log(isConnected, address, chainId)">Log Account</button>
  <button @click="test()">Test</button>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
