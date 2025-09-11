import { useMemo } from "react";

export const useLend = (
  userCollateral: bigint | undefined,
  userLoan: bigint | undefined,
  availableBorrow: bigint | undefined,
  healthThreshold?: bigint,
  ratioDecimals?: bigint,
) => {
  const ltcRatio = useMemo(() => {
    const collateral = userCollateral ?? BigInt(0);
    const loan = userLoan ?? BigInt(0);
    const decimals = ratioDecimals ?? BigInt(10000);
    if (collateral === BigInt(0)) return 0;
    try {
      return Number((loan * decimals) / collateral);
    } catch {
      return 0;
    }
  }, [userCollateral, userLoan, ratioDecimals]);

  const isHealthy = useMemo(() => {
    const threshold = Number(healthThreshold ?? BigInt(7000));
    return ltcRatio < threshold;
  }, [ltcRatio, healthThreshold]);

  const borrowable = useMemo(() => {
    const collateral = userCollateral ?? BigInt(0);
    const loan = userLoan ?? BigInt(0);
    if (collateral === BigInt(0)) return BigInt(0);
    const threshold = healthThreshold ?? BigInt(7000);
    const decimals = ratioDecimals ?? BigInt(10000);
    // maxLoan where (maxLoan * decimals) / collateral < threshold
    const maxLoan = (((collateral * threshold) / decimals) - BigInt(1));
    if (maxLoan <= loan) return BigInt(0);
    const headroom = maxLoan - loan;
    const pool = availableBorrow ?? BigInt(0);
    return headroom < pool ? headroom : pool;
  }, [userCollateral, userLoan, availableBorrow, healthThreshold, ratioDecimals]);

  return {
    ltcRatio,
    isHealthy,
    borrowable,
  } as const;
};


