import { useAccount, useReadContract } from "wagmi";
import contracts from "../contracts";
import { zeroAddress } from "viem";

export const useContractsData = () => {
  const { address } = useAccount();

  const { data: totalBorrowed, refetch: refetchTotalBorrowed } = useReadContract({
    ...contracts.borrowFi,
    functionName: "totalBorrowed",
  });
  const { data: totalCollateral, refetch: refetchTotalCollateral } = useReadContract({
    ...contracts.borrowFi,
    functionName: "totalCollateral",
  });
  const { data: userCollateral, refetch: refetchUserCollateral } = useReadContract({
    ...contracts.borrowFi,
    functionName: "collateralOf",
    args: [address ?? zeroAddress],
  });
  const { data: userLoan, refetch: refetchUserLoan } = useReadContract({
    ...contracts.borrowFi,
    functionName: "loanOf",
    args: [address ?? zeroAddress],
  });
  const { data: userCLT, refetch: refetchUserCLT } = useReadContract({
    ...contracts.cltToken,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
  });
  const { data: cltDecimals } = useReadContract({
    ...contracts.cltToken,
    functionName: "decimals",
  });
  const { data: userBFI, refetch: refetchUserBFI } = useReadContract({
    ...contracts.borrowToken,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
  });
  const { data: bfiDecimals } = useReadContract({
    ...contracts.borrowToken,
    functionName: "decimals",
  });
  const { data: healthThreshold } = useReadContract({
    ...contracts.borrowFi,
    functionName: "HEALTHY_THRESHOLD",
  });
  const { data: ratioDecimals } = useReadContract({
    ...contracts.borrowFi,
    functionName: "DECIMALS",
  });
  const { data: availableBorrow, refetch: refetchAvailableBorrow } = useReadContract({
    ...contracts.borrowToken,
    functionName: "balanceOf",
    args: [contracts.borrowFi.address],
  });
  const { data: availableCLT, refetch: refetchAvailableCLT } = useReadContract({
    ...contracts.cltToken,
    functionName: "balanceOf",
    args: [contracts.borrowFi.address],
  });
  const { data: cltAllowance, refetch: refetchCltAllowance } = useReadContract({
    ...contracts.cltToken,
    functionName: "allowance",
    args: [address ?? zeroAddress, contracts.borrowFi.address],
  });
  const { data: bfiAllowance, refetch: refetchBfiAllowance } = useReadContract({
    ...contracts.borrowToken,
    functionName: "allowance",
    args: [address ?? zeroAddress, contracts.borrowFi.address],
  });

  const refetchAllVariables = async () => {
    await Promise.all([
      refetchAvailableCLT(),
      refetchUserCLT(),
      refetchCltAllowance(),
      refetchUserBFI(),
      refetchTotalBorrowed(),
      refetchTotalCollateral(),
      refetchAvailableBorrow(),
      refetchUserLoan(),
      refetchUserCollateral(),
      refetchBfiAllowance(),
    ]);
  };

  return {
    totalBorrowed,
    totalCollateral,
    userCollateral,
    userLoan,
    userCLT,
    userBFI,
    cltDecimals,
    bfiDecimals,
    healthThreshold,
    ratioDecimals,
    availableBorrow,
    availableCLT,
    cltAllowance,
    bfiAllowance,
    refetchAllVariables,
  } as const;
};


