import { useMemo } from "react";
import { parseEther } from "viem";

export const useWithdrawGuards = (
  userCollateral: bigint | undefined,
  userLoan: bigint | undefined,
  withdrawInput: string,
) => {
  const withdrawDisabled = useMemo(() => {
    const amount = parseEther(withdrawInput || "0")
    if (amount === BigInt(0)) return true
    const currentCollateral = (userCollateral ?? BigInt(0))
    if (currentCollateral < amount) return true
    const newCollateral = currentCollateral - amount
    if (newCollateral === BigInt(0)) return true
    const projectedRatio = ((userLoan ?? BigInt(0)) * BigInt(10000)) / newCollateral
    if (projectedRatio >= 7000) return true
    return false
  }, [withdrawInput, userCollateral, userLoan])

  const withdrawWarning = useMemo(() => {
    const amount = parseEther(withdrawInput || "0")
    const currentCollateral = (userCollateral ?? BigInt(0))
    if (amount === BigInt(0) || currentCollateral < amount) return ""
    const newCollateral = currentCollateral - amount
    if (newCollateral === BigInt(0)) return "Health breach: Can't have 0 collateral"
    const projectedRatio = ((userLoan ?? BigInt(0)) * BigInt(10000)) / newCollateral
    if (projectedRatio >= 7000) return "Health breach: Can't have 0 collateral"
    return ""
  }, [withdrawInput, userCollateral, userLoan])

  return { withdrawDisabled, withdrawWarning } as const
}


