declare global {
  interface Window {
    cardano?: {
      [key: string]: {
        name: string
        icon: string
        apiVersion: string
        enable: (extensions?: {
          extensions: {
            cip: number
          }[]
        }) => Promise<{
          getUsedAddresses: () => Promise<string[]>
          getUnusedAddresses: () => Promise<string[]>
          getBalance: () => Promise<string>
          getUtxos: () => Promise<any[]>
          signTx: (tx: string, partialSign?: boolean) => Promise<string>
          signData: (address: string, payload: string) => Promise<any>
          submitTx: (tx: string) => Promise<string>
          getCollateral: () => Promise<any[]>
          getNetworkId: () => Promise<number>
          getRewardAddresses: () => Promise<string[]>
          getChangeAddress: () => Promise<string>
        }>
        supportedExtensions?: {
          cip: number
        }[]
      }
    }
  }
}

export {}
