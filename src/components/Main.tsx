import {useAccount, useChainId, useSwitchChain, useWriteContract} from "wagmi";
import contracts from "../contracts";
import {parseEther} from "viem";
import {useMemo, useState} from "react";
 
import {getParsedError} from "../utils.ts";
import {waitForTransactionReceipt} from "viem/actions";
import {client} from "../config.ts";
import { useLend } from "../hooks/useLend";
import { useContractsData } from "../hooks/useContractsData";
import { useBorrowActions } from "../hooks/useBorrowActions";
import { useToast } from "../state/ui";
import { useSyncEvents } from "../hooks/useSyncEvents";
import { useCharts } from "../hooks/useCharts";
 
import Dashboard from "../pages/Dashboard";

const Main = () => {
    const [cltInput, setCltInput] = useState("");
    const [borrowInput, setBorrowInput] = useState("");
    const [repayInput, setRepayInput] = useState("");
    const [withdrawInput, setWithdrawInput] = useState("");
    const [isApprovingClt, setIsApprovingClt] = useState(false);
    const [isAddingClt, setIsAddingClt] = useState(false);
    const [isWithdrawingClt, setIsWithdrawingClt] = useState(false);
    const [isBorrowing, setIsBorrowing] = useState(false);
    const [isRepaying, setIsRepaying] = useState(false);
    const {address: connectedAccount} = useAccount();
    const chainId = useChainId();
    const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
    const { writeContractAsync, isPending: isTransactionLoading } = useWriteContract()
    const { toast, showToast } = useToast()
    

    const parsedAmount = useMemo(() => parseEther(cltInput || "0"), [cltInput]);
    const parsedRepayAmount = useMemo(() => parseEther(repayInput || "0"), [repayInput]);
    const parsedBorrowAmount = useMemo(() => parseEther(borrowInput || "0"), [borrowInput]);


  const {
    totalBorrowed,
    totalCollateral,
    userCollateral,
    userLoan,
    userCLT,
    userBFI,
    cltDecimals,
    bfiDecimals,
    availableBorrow,
    availableCLT,
    cltAllowance,
    bfiAllowance,
    refetchAllVariables,
  } = useContractsData()

  const { ltcRatio, isHealthy, borrowable } = useLend(userCollateral, userLoan, availableBorrow)

  const {
    borrow: borrowBFI,
    repay: repayBFI,
    approveRepay,
    withdraw: withdrawCLTInner,
    isLoadingBorrow,
    isRepayMining,
    simulateBorrowError,
  } = useBorrowActions({
    borrowInput,
    repayInput,
    withdrawInput,
    bfiAllowance: bfiAllowance ?? BigInt(0),
    showToast,
    refetchAll: refetchAllVariables,
  })

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
      const projectedRatio = ( (userLoan ?? BigInt(0)) * BigInt(10000) ) / newCollateral
      if (projectedRatio >= 7000) return "Health breach: Can't have 0 collateral"
      return ""
  }, [withdrawInput, userCollateral, userLoan])

    

  const hasCLTAllowanceForAddingCLT = useMemo(() => Boolean(cltAllowance && cltAllowance >= parsedAmount), [cltAllowance, parsedAmount]);

  const addButtonDisabled = useMemo(() => {
      if (!hasCLTAllowanceForAddingCLT) {
          if (parsedAmount === BigInt(0)) return true
          if (parsedAmount > (userCLT ?? BigInt(0))) return true
          return isTransactionLoading
      }
      return isTransactionLoading || (parsedAmount === BigInt(0)) || (parsedAmount > (userCLT ?? BigInt(0)))
  }, [hasCLTAllowanceForAddingCLT, parsedAmount, userCLT, isTransactionLoading])

  const hasBFIAllowanceForRepay = useMemo(() => {
      if (parsedRepayAmount === BigInt(0)) return false
      return Boolean(bfiAllowance && bfiAllowance >= parsedRepayAmount)
  }, [bfiAllowance, parsedRepayAmount])

    const addCltError = useMemo<[boolean, string]>(() => {
        if (parsedAmount === BigInt(0)) return [true, ""];
        if (parsedAmount > (userCLT ?? BigInt(0)) ) return [true, "Insufficient CLT Balance"];
        if (!hasCLTAllowanceForAddingCLT) return [false, ""];
        return [false, ""];
    }, [hasCLTAllowanceForAddingCLT, parsedAmount, userCLT, cltAllowance]);

  const repayError = useMemo<[boolean, string]>(() => {
      const amt = parsedRepayAmount
      if (amt === BigInt(0)) return [true, ""]
      if ((userBFI ?? BigInt(0)) < amt) return [true, "Insufficient BFI Balance"]
      if (!hasBFIAllowanceForRepay) return [true, "Insufficient BFI Allowance"]
      return [false, ""]
  }, [parsedRepayAmount, userBFI, hasBFIAllowanceForRepay])
  

  const addCLT = async () => {
      const _addClt = async () => {
          if (userCLT && userCLT >= parsedAmount) {
            setIsAddingClt(true)
            const txHash = await writeContractAsync({
              ...contracts.borrowFi,
              functionName: "addCollateral",
              args: [parsedAmount]
            })
              const receipt = await waitForTransactionReceipt(
                  client,
                  {
                      hash: txHash
                  }
              );
              if (receipt && receipt.status === 'success') {
                  showToast("Collateral added successfully", "success")
                  setCltInput("")
                  await refetchAllVariables()
              } else {
                  throw new Error("Add Collateral failed!")
              }

          } else {
              throw new Error("Insufficient CLT");
          }
      }

      try {
            await _addClt()
        } catch (err) {
          console.error(err);
          showToast((err as Error)?.message || "Collateral add failed", "error")
        } finally {
          setIsAddingClt(false)
        }
  }

  const approveCLT = async () => {
     try {
         setIsApprovingClt(true)
         const txHash = await writeContractAsync({
             ...contracts.cltToken,
             functionName: "approve",
             args: [contracts.borrowFi.address, parsedAmount],
         });

         const receipt = await waitForTransactionReceipt(
             client,
             {
                 hash: txHash
             }
         );

         if (!receipt || receipt.status !== 'success') {
             throw new Error("CLT approval failed")
         }

         await refetchAllVariables()
         showToast("CLT approval successful", "success")

     } catch (error) {
          console.error(error);
          showToast(getParsedError(error), "error")
     } finally {
          setIsApprovingClt(false)
     }
  }

  const withdrawCLT = async () => {
     try {
        setIsWithdrawingClt(true)
        await withdrawCLTInner()
     } finally {
        setIsWithdrawingClt(false)
     }
  }

  const borrowWithLoading = async () => {
     try {
       setIsBorrowing(true)
       await borrowBFI()
     } finally {
       setIsBorrowing(false)
     }
  }

  const repayWithLoading = async () => {
     try {
       setIsRepaying(true)
       if (!hasBFIAllowanceForRepay) {
         await approveRepay(parsedRepayAmount)
       } else {
         await repayBFI()
       }
     } finally {
       setIsRepaying(false)
     }
  }

  
  


  useSyncEvents(connectedAccount as `0x${string}` | undefined, refetchAllVariables)

  const { barData, pieData } = useCharts(userCollateral, userLoan)

  

  return (
    <Dashboard
      chainId={chainId}
      isSwitchingChain={isSwitchingChain}
      onSwitchNetwork={async () => { try { await switchChainAsync({ chainId: 11155111 }) } catch {} }}
      toast={toast}
      userCollateral={userCollateral}
      userLoan={userLoan}
      userCLT={userCLT}
      userBFI={userBFI}
      cltDecimals={Number(cltDecimals ?? 18)}
      bfiDecimals={Number(bfiDecimals ?? 18)}
      isHealthy={isHealthy}
      availableBorrow={availableBorrow}
      availableCLT={availableCLT}
      totalBorrowed={totalBorrowed}
      totalCollateral={totalCollateral}
      ltcRatio={ltcRatio}
      borrowable={borrowable}
      barData={barData}
      pieData={pieData}
      borrowInput={borrowInput}
      setBorrowInput={setBorrowInput}
      onBorrow={borrowWithLoading}
      isBorrowLoading={isLoadingBorrow || isBorrowing}
      parsedBorrowAmount={parsedBorrowAmount}
      simulateBorrowError={simulateBorrowError as any}
      getParsedError={getParsedError}
      repayInput={repayInput}
      setRepayInput={setRepayInput}
      onRepay={repayWithLoading}
      isRepayLoading={isRepayMining || isRepaying}
      repayButtonState={/allowance/i.test(repayError[1] || "") ? "approve" : "repay"}
      repayError={repayError}
      cltInput={cltInput}
      setCltInput={setCltInput}
      withdrawInput={withdrawInput}
      setWithdrawInput={setWithdrawInput}
      onAddClt={addCLT}
      onApproveClt={approveCLT}
      onWithdrawClt={withdrawCLT}
      isApproveCltLoading={isApprovingClt}
      isAddCltLoading={isAddingClt}
      isWithdrawCltLoading={isWithdrawingClt}
      addDisabled={addButtonDisabled}
      hasCltAllowance={hasCLTAllowanceForAddingCLT}
      isAddSimulating={isApprovingClt || isAddingClt}
      addCltError={addCltError}
      withdrawDisabled={withdrawDisabled}
      withdrawWarning={withdrawWarning}
      
    />
  );
};

export default Main;
