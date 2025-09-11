import { useMemo } from "react";
import { formatEther } from "viem";

export const useCharts = (userCollateral?: bigint, userLoan?: bigint) => {
  const clampSmall = (v: number) => (Math.abs(v) < 0.005 ? 0 : v)
  const barData = useMemo(() => {
    const collateral = clampSmall(Number(formatEther(userCollateral ?? BigInt(0))))
    const loan = clampSmall(Number(formatEther(userLoan ?? BigInt(0))))
    return [
      { name: "Collateral", value: collateral },
      { name: "Loan", value: loan },
    ]
  }, [userCollateral, userLoan])

  const utilization = useMemo(() => {
    const collateral = clampSmall(Number(formatEther(userCollateral ?? BigInt(0))))
    const loan = clampSmall(Number(formatEther(userLoan ?? BigInt(0))))
    if (collateral <= 0) return 0
    return Math.min(100, (loan / collateral) * 100)
  }, [userCollateral, userLoan])

  const pieData = useMemo(() => [
    { name: "Utilized", value: utilization },
    { name: "Available", value: Math.max(0, 100 - utilization) },
  ], [utilization])

  return { barData, pieData } as const
}


