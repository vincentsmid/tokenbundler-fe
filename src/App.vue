<script setup lang="ts">
import {
  createWeb3Modal,
  defaultConfig,
  // useWeb3Modal,
  useWeb3ModalAccount
} from '@web3modal/ethers/vue'

import { ethers, Contract } from 'ethers'

import { watchEffect } from 'vue'

import { userData, selectedItems, refreshStore } from './store'

import NFTViewer from './components/NFTViewer.vue'
// import type { create } from 'domain'

interface Asset {
  category: number
  assetAddress: string
  id: string | number
  amount: string | number
}

// test data
// const assets: Asset[] = [
//   {
//     category: 1,
//     assetAddress: hexlify('0xddf366d6e74d7a83181335a528b8dea6002be288'),
//     id: 234,
//     amount: 1
//   },
//   {
//     category: 1,
//     assetAddress: hexlify('0xddf366d6e74d7a83181335a528b8dea6002be288'),
//     id: 233,
//     amount: 1
//   }
// ]

// Should not be hardcoded, but for the sake of the demo
const projectId = 'cd7cca4c881f9d1c96a8da90262b3eac'

const contractAddress = '0x448E3D0a4BAa00FE511a03E7B27177AeDE6d9636'

// const contractAddress721 = '0xDdF366d6e74D7A83181335A528b8DeA6002Be288'

// Scrapped - did not have time to implement
// const contractAbiToken1 = [
//   {
//     inputs: [{ internalType: 'string', name: '_uri', type: 'string' }],
//     stateMutability: 'nonpayable',
//     type: 'constructor'
//   },
//   {
//     anonymous: false,
//     inputs: [
//       { indexed: true, internalType: 'address', name: 'operator', type: 'address' },
//       { indexed: false, internalType: 'bool', name: 'approved', type: 'bool' }
//     ],
//     name: 'ApprovalForAll',
//     type: 'function'
//   }
// ]

// const contractAbiToken0 = [
//   {
//     inputs: [{ internalType: 'string', name: '_uri', type: 'string' }],
//     stateMutability: 'nonpayable',
//     type: 'constructor'
//   },
//   {
//     anonymous: false,
//     inputs: [
//       { indexed: true, internalType: 'address', name: 'spender', type: 'address' },
//       { indexed: true, internalType: 'uint256', name: 'amount', type: 'uint256' }
//     ],
//     name: 'approve',
//     type: 'event'
//   }
// ]

const contractAbi = [
  {
    inputs: [{ internalType: 'string', name: '_uri', type: 'string' }],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'account', type: 'address' },
      { indexed: true, internalType: 'address', name: 'operator', type: 'address' },
      { indexed: false, internalType: 'bool', name: 'approved', type: 'bool' }
    ],
    name: 'ApprovalForAll',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' }
    ],
    name: 'BundleCreated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' }],
    name: 'BundleUnwrapped',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' }
    ],
    name: 'OwnershipTransferred',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'operator', type: 'address' },
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint256[]', name: 'ids', type: 'uint256[]' },
      { indexed: false, internalType: 'uint256[]', name: 'values', type: 'uint256[]' }
    ],
    name: 'TransferBatch',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'operator', type: 'address' },
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' }
    ],
    name: 'TransferSingle',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'string', name: 'value', type: 'string' },
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' }
    ],
    name: 'URI',
    type: 'event'
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'id', type: 'uint256' }
    ],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'accounts', type: 'address[]' },
      { internalType: 'uint256[]', name: 'ids', type: 'uint256[]' }
    ],
    name: 'balanceOfBatch',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_bundleId', type: 'uint256' }],
    name: 'bundle',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'enum MultiToken.Category', name: 'category', type: 'uint8' },
          { internalType: 'address', name: 'assetAddress', type: 'address' },
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' }
        ],
        internalType: 'struct MultiToken.Asset[]',
        name: '_assets',
        type: 'tuple[]'
      }
    ],
    name: 'create',
    outputs: [{ internalType: 'uint256', name: 'bundleId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'address', name: 'operator', type: 'address' }
    ],
    name: 'isApprovedForAll',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256[]', name: '', type: 'uint256[]' },
      { internalType: 'uint256[]', name: '', type: 'uint256[]' },
      { internalType: 'bytes', name: '', type: 'bytes' }
    ],
    name: 'onERC1155BatchReceived',
    outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'operator', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'bytes', name: '', type: 'bytes' }
    ],
    name: 'onERC1155Received',
    outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'operator', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'bytes', name: '', type: 'bytes' }
    ],
    name: 'onERC721Received',
    outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256[]', name: 'ids', type: 'uint256[]' },
      { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
      { internalType: 'bytes', name: 'data', type: 'bytes' }
    ],
    name: 'safeBatchTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' }
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'operator', type: 'address' },
      { internalType: 'bool', name: 'approved', type: 'bool' }
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'string', name: '_newUri', type: 'string' }],
    name: 'setUri',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
    name: 'token',
    outputs: [
      {
        components: [
          { internalType: 'enum MultiToken.Category', name: 'category', type: 'uint8' },
          { internalType: 'address', name: 'assetAddress', type: 'address' },
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' }
        ],
        internalType: 'struct MultiToken.Asset',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_bundleId', type: 'uint256' }],
    name: 'tokensInBundle',
    outputs: [
      {
        components: [
          { internalType: 'enum MultiToken.Category', name: 'category', type: 'uint8' },
          { internalType: 'address', name: 'assetAddress', type: 'address' },
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' }
        ],
        internalType: 'struct MultiToken.Asset[]',
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_bundleId', type: 'uint256' }],
    name: 'unwrap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'uri',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  }
]

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

const metadata = {
  name: 'Token Bundler',
  description: 'bundly bundly',
  url: 'https://tokenbundler.xyz',
  icons: ['https://avatars.mywebsite.com/']
}

const ethersConfig = defaultConfig({
  metadata,

  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  defaultChainId: 1
})

createWeb3Modal({
  ethersConfig,
  chains: [mainnet, sepolia],
  projectId,
  enableAnalytics: true,
  enableOnramp: true
})

// const modal = useWeb3Modal()

const { address, chainId, isConnected } = useWeb3ModalAccount()

let contract: Contract | null = null

let signer: ethers.Signer | null = null

let provider: ethers.BrowserProvider | null = null

const updateUser = () => {
  userData.wallet = userData.wallet = address.value?.toString() || ''
  userData.chainID = chainId.value ? chainId.value.toString() : ''
  userData.isConnected = isConnected.value
}

watchEffect(() => {
  try {
    updateUser()
  } catch (error) {
    console.error('Error during updateUser execution:', error)
  }
})

// func prepared for future provider change, currently unnecessary
async function changeProvider(abi: any = contractAbi, contractAdd: string = contractAddress) {
  // @ts-ignore
  const _provider = new ethers.BrowserProvider(window.ethereum)
  provider = _provider
  // const signer = await provider.getSigner()
  const _signer = await provider.getSigner()
  signer = _signer
  // console.log('Signer:', signer)

  const _contract = new ethers.Contract(contractAdd, abi, _signer)
  contract = _contract
}

watchEffect(async () => {
  if (isConnected.value && address.value) {
    changeProvider()
  }
})

watchEffect(() => {
  if (contract) {
    contract.on('SomeEvent', (arg1, arg2, event) => {
      console.log('Event received:', arg1, arg2, event)
    })
  }
})

// scrapped - did not have time to implement
// async function approveItem() {
//   if (!isConnected.value) throw Error('User disconnected')
//   const assets: Asset[] = selectedItems.items

//   const formattedAssets = assets
//     .map((asset) => {
//       return {
//         category: asset.category,
//         assetAddress: asset.assetAddress,
//         id: asset.id,
//         amount: asset.amount
//       }
//     })
//     .map((a) => Object.values(a))

//   if (formattedAssets[0][0] === 0) {
//     // This is ugly, however i do not want to rewrite the logic, so it will have to do for now
//     await changeProvider(contractAbiToken0)
//   } else {
//     await changeProvider(contractAbiToken1)
//   }

//   try {
//     console.log('contrekt', contract)
//     const gasLimit = await contract?.ApprovalForAll.estimateGas(formattedAssets)

//     const gas = (await provider?.getFeeData())?.gasPrice

//     console.log('gas', gas)

//     const tx = await contract?.ApprovalForAll(formattedAssets, {
//       // gasLimit: ((gas ?? 25000n) * 150n) / 100n,
//       // gasPrice: (gas ?? 25000n) * 100n
//       gasLimit: gasLimit,
//       gasPrice: gas
//     })
//     console.log('teikso', tx)
//     const receipt = await tx.wait()

//     console.log(receipt)

//     console.log(`Approved succesfully. Transaction Hash: ${receipt.transactionHash}`)
//     changeProvider()
//   } catch (error) {
//     console.error('Error approving:', error)
//   }
// }

async function createBundle() {
  if (!isConnected.value) throw Error('User disconnected')

  console.log('Contract:', contract)

  const assets: Asset[] = selectedItems.items

  const formattedAssets = assets
    .map((asset) => {
      return {
        category: asset.category,
        assetAddress: asset.assetAddress,
        id: asset.id,
        amount: asset.amount
      }
    })
    .map((a) => Object.values(a))

  console.log(JSON.stringify(formattedAssets))

  try {
    console.log('contrekt', contract)
    // console.log(contract.value?.)
    // const tx = await contract.value?.create(formattedAssets)
    console.log('call functions', contract?.getFunction('create'))

    const gasLimit = await contract?.create.estimateGas(formattedAssets)

    const gas = (await provider?.getFeeData())?.gasPrice

    console.log('gas', gas)

    const tx = await contract?.create(formattedAssets, {
      // gasLimit: ((gas ?? 25000n) * 150n) / 100n,
      // gasPrice: (gas ?? 25000n) * 100n
      gasLimit: gasLimit,
      gasPrice: gas
    })
    console.log('teikso', tx)
    const receipt = await tx.wait()

    console.log(receipt)

    refreshStore.currentState = receipt

    console.log(`Bundle created successfully. Transaction Hash: ${receipt.transactionHash}`)
  } catch (error) {
    console.error('Error creating bundle:', error)
  }
}

// scrapped - did not have time to implement
// async function makeAllTokensUsable() {
//   if (!isConnected.value) throw Error('User disconnected')

//   try {
//   } catch (error) {
//     console.error('Error creating bundle:', error)
//   }
// }

const whoIsSigner = () => {
  console.log('Signer:', signer)
}
</script>

<template>
  <div style="position: absolute; top: 0">
    <!-- <button @click="modal.open()">Open Connect Modal</button>
    <button @click="modal.open({ view: 'Networks' })">Open Network Modal</button>
    <button @click="console.log(isConnected, address, chainId)">Log Account</button>
    <button @click="updateUser()">update user</button> -->
    <w3m-button />
    <button @click="createBundle()">Bundle Assets</button>
    <button @click="whoIsSigner()">Who is Signer</button>
  </div>

  <NFTViewer />
</template>
