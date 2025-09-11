import { useChainId, useSimulateContract, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import contracts from "../contracts";
import { waitForTransactionReceipt } from "viem/actions";
import { client } from "../config";
import { getParsedError } from "../utils";

export const useBorrowActions = (deps: {
  borrowInput: string;
  repayInput: string;
  withdrawInput: string;
  bfiAllowance?: bigint;
  showToast: (m: string, v?: "success" | "error") => void;
  refetchAll: () => Promise<void>;
}) => {
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const { data: simulateBorrow, isLoading: isLoadingBorrow, error: simulateBorrowError } = useSimulateContract({
    ...contracts.borrowFi,
    functionName: "borrow",
    args: [parseEther(deps.borrowInput || "0")],
  });
  const { data: simulateRepay, isLoading: isLoadingRepay, error: simulateRepayError } = useSimulateContract({
    ...contracts.borrowFi,
    functionName: "repay",
    args: [parseEther(deps.repayInput || "0")],
  });
  const { data: simulateWithdraw } = useSimulateContract({
    ...contracts.borrowFi,
    functionName: "withdrawCollateral",
    args: [parseEther(deps.withdrawInput || "0")],
  });

  const { isLoading: isRepayMining } = useWaitForTransactionReceipt({
    hash: undefined,
  });

  const ensureSepolia = async () => {
    if (chainId && chainId !== 11155111) {
      try { await switchChainAsync({ chainId: 11155111 }) } catch {}
    }
  }

  const borrow = async () => {
    try {
      await ensureSepolia();
      const amt = parseEther(deps.borrowInput || "0");
      if (amt <= BigInt(0)) { deps.showToast("Enter a valid borrow amount", "error"); return }
      if (simulateBorrowError) { deps.showToast(simulateBorrowError.message, "error"); return }
      const txHash = simulateBorrow?.request
        ? await writeContractAsync(simulateBorrow.request)
        : await writeContractAsync({ ...contracts.borrowFi, functionName: "borrow", args: [amt] });
      const receipt = await waitForTransactionReceipt(client, { hash: txHash });
      if (!receipt || receipt.status !== 'success') throw new Error("Borrow failed");
      deps.showToast("Borrow successful", "success");
      await deps.refetchAll();
    } catch (err) {
      deps.showToast(getParsedError(err), "error");
    }
  }

  const repay = async () => {
    try {
      await ensureSepolia();
      const amt = parseEther(deps.repayInput || "0");
      if (amt <= BigInt(0)) { deps.showToast("Enter a valid repay amount", "error"); return }
      const txHash = simulateRepay?.request
        ? await writeContractAsync(simulateRepay.request)
        : await writeContractAsync({ ...contracts.borrowFi, functionName: "repay", args: [amt] });
      const receipt = await waitForTransactionReceipt(client, { hash: txHash });
      if (!receipt || receipt.status !== 'success') throw new Error("Repay failed");
      deps.showToast("Repay successful", "success");
      await deps.refetchAll();
    } catch (err) {
      deps.showToast(getParsedError(err), "error");
    }
  }

  const repayExact = async (weiAmount: bigint) => {
    try {
      await ensureSepolia();
      const amt = weiAmount;
      if (amt <= BigInt(0)) { deps.showToast("Enter a valid repay amount", "error"); return }
      const txHash = simulateRepay?.request
        ? await writeContractAsync({ ...simulateRepay.request, args: [amt] })
        : await writeContractAsync({ ...contracts.borrowFi, functionName: "repay", args: [amt] });
      const receipt = await waitForTransactionReceipt(client, { hash: txHash });
      if (!receipt || receipt.status !== 'success') throw new Error("Repay failed");
      deps.showToast("Repay successful", "success");
      await deps.refetchAll();
    } catch (err) {
      deps.showToast(getParsedError(err), "error");
    }
  }

  const approveRepay = async (weiAmount: bigint) => {
    try {
      await ensureSepolia();
      const amt = weiAmount;
      if (amt <= BigInt(0)) { deps.showToast("Enter a valid repay amount", "error"); return }
      const approvalHash = await writeContractAsync({ ...contracts.borrowToken, functionName: "approve", args: [contracts.borrowFi.address, amt] });
      const approvalReceipt = await waitForTransactionReceipt(client, { hash: approvalHash });
      if (!approvalReceipt || approvalReceipt.status !== 'success') throw new Error("Approval failed");
      deps.showToast("BFI approval successful", "success");
      await deps.refetchAll();
    } catch (err) {
      deps.showToast(getParsedError(err), "error");
    }
  }

  const withdraw = async () => {
    try {
      await ensureSepolia();
      const amt = parseEther(deps.withdrawInput || "0");
      if (amt <= BigInt(0)) { deps.showToast("Enter a valid withdraw amount", "error"); return }
      const txHash = simulateWithdraw?.request
        ? await writeContractAsync(simulateWithdraw.request)
        : await writeContractAsync({ ...contracts.borrowFi, functionName: "withdrawCollateral", args: [amt] });
      const receipt = await waitForTransactionReceipt(client, { hash: txHash });
      if (!receipt || receipt.status !== 'success') throw new Error("Withdraw failed");
      deps.showToast("Withdraw successful", "success");
      await deps.refetchAll();
    } catch (err) {
      deps.showToast(getParsedError(err), "error");
    }
  }

  return { borrow, repay, repayExact, approveRepay, withdraw, isLoadingBorrow, isLoadingRepay, isRepayMining, simulateBorrowError, simulateRepayError } as const;
}


