import { useMemo } from "react";

export const useLend = (
  userCollateral: bigint | undefined,
  userLoan: bigint | undefined,
  availableBorrow: bigint | undefined,
) => {
  const ltcRatio = useMemo(() => {
    const collateral = userCollateral ?? BigInt(0);
    const loan = userLoan ?? BigInt(0);
    if (collateral === BigInt(0)) return 0;
    try {
      return Number((loan * BigInt(10000)) / collateral);
    } catch {
      return 0;
    }
  }, [userCollateral, userLoan]);

  const isHealthy = useMemo(() => ltcRatio < 7000, [ltcRatio]);

  const borrowable = useMemo(() => {
    const collateral = userCollateral ?? BigInt(0);
    const loan = userLoan ?? BigInt(0);
    if (collateral === BigInt(0)) return BigInt(0);
    // If tokens have non-18 decimals, math is still correct in raw units as long as both use same decimals on-chain.
    const maxLoan = ((collateral * BigInt(70)) - BigInt(1)) / BigInt(100);
    if (maxLoan <= loan) return BigInt(0);
    const headroom = maxLoan - loan;
    const pool = availableBorrow ?? BigInt(0);
    return headroom < pool ? headroom : pool;
  }, [userCollateral, userLoan, availableBorrow]);

  return {
    ltcRatio,
    isHealthy,
    borrowable,
  } as const;
};


