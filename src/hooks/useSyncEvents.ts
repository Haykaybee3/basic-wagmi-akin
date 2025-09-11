import { useWatchContractEvent } from "wagmi";
import contracts from "../contracts";

export const useSyncEvents = (
  connectedAccount: `0x${string}` | undefined,
  refetchAll: () => Promise<void>,
) => {
  useWatchContractEvent({
    ...contracts.cltToken,
    eventName: "Transfer",
    onLogs: async (logs) => {
      const involves = (addr?: string) => addr && [connectedAccount, contracts.borrowFi.address].includes(addr as `0x${string}`)
      if (logs.some(l => involves(l.args?.from as string) || involves(l.args?.to as string))) {
        await refetchAll()
      }
    },
    enabled: Boolean(connectedAccount)
  })

  useWatchContractEvent({
    ...contracts.borrowToken,
    eventName: "Transfer",
    onLogs: async (logs) => {
      const involves = (addr?: string) => addr && [connectedAccount, contracts.borrowFi.address].includes(addr as `0x${string}`)
      if (logs.some(l => involves(l.args?.from as string) || involves(l.args?.to as string))) {
        await refetchAll()
      }
    },
    enabled: Boolean(connectedAccount)
  })

  useWatchContractEvent({
    ...contracts.borrowToken,
    eventName: "Approval",
    onLogs: async (logs) => {
      const toBorrowFi = (logs ?? []).some((l) => (l.args?.spender as string)?.toLowerCase() === contracts.borrowFi.address.toLowerCase() && (l.args?.owner as string)?.toLowerCase() === (connectedAccount ?? '').toLowerCase())
      if (toBorrowFi) {
        await refetchAll()
      }
    },
    enabled: Boolean(connectedAccount)
  })
}


