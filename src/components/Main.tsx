
import {useAccount, useReadContract, useWriteContract} from "wagmi";
import contracts from "../contracts";
import {formatEther, parseEther, zeroAddress} from "viem";
import {useMemo, useState} from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Main = () => {
    const [cltInput, setCltInput] = useState("");
    const [borrowInput, setBorrowInput] = useState("");
    const [repayInput, setRepayInput] = useState("");
    const [withdrawInput, setWithdrawInput] = useState("");
    const {address: connectedAccount} = useAccount();
    const { writeContractAsync } = useWriteContract()
    const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null)

    const showToast = (message: string, variant: "success" | "error" = "success") => {
        setToast({ message, variant })
        setTimeout(() => setToast(null), 3500)
    }

  const { data: totalBorrowed } = useReadContract({
    ...contracts.borrowFi,
    functionName: "totalBorrowed",
  });
  const { data: totalCollateral } = useReadContract({
    ...contracts.borrowFi,
    functionName: "totalCollateral",
  });
  const {data: userCollateral} = useReadContract({
    ...contracts.borrowFi,
    functionName: "collateralOf",
    args: [connectedAccount ?? zeroAddress]
  });

  const {data: userLoan} = useReadContract({
    ...contracts.borrowFi,
    functionName: "loanOf",
    args: [connectedAccount ?? zeroAddress]
  });  const {data: userLTC} = useReadContract({
    ...contracts.borrowFi,
    functionName: "getLTC",
  });

  const {data: userCLT} = useReadContract({
    ...contracts.cltToken,
    functionName: "balanceOf",
    args: [connectedAccount ?? zeroAddress]
  });

  const {data: userBFI} = useReadContract({
    ...contracts.borrowToken,
    functionName: "balanceOf",
    args: [connectedAccount ?? zeroAddress]
  });

  const { data: isHealthy } = useReadContract({
    ...contracts.borrowFi,
    functionName: "isHealthy",
  });

  const {data: availableBorrow} = useReadContract({
    ...contracts.borrowToken,
    functionName: "balanceOf",
    args: [contracts.borrowFi.address]
  });
  const {data: availableCLT} = useReadContract({
    ...contracts.cltToken,
    functionName: "balanceOf",
    args: [contracts.borrowFi.address]
  });

  const {data: cltAllowance} = useReadContract({
      ...contracts.cltToken,
      functionName: "allowance",
      args: [connectedAccount ?? zeroAddress, contracts.borrowFi.address]
  })

  const {data: bfiAllowance} = useReadContract({
      ...contracts.borrowToken,
      functionName: "allowance",
      args: [connectedAccount ?? zeroAddress, contracts.borrowFi.address]
  })

  const addCLT = async () => {
      const parsedAmount =  parseEther(cltInput || "0")
      if (parsedAmount <= BigInt(0)) {
          showToast("Enter a valid CLT amount", "error")
          return
      }
      const _addClt = async () => {
          if (userCLT && userCLT >= parsedAmount) {
            const txHash = await writeContractAsync({
                ...contracts.borrowFi,
                functionName: "addCollateral",
                args: [parsedAmount]
            })
              if (txHash) {
                  showToast("Collateral added successfully", "success")
              } else {
                  throw new Error("Add Collateral failed!")
              }

          } else {
              throw new Error("Insufficient CLT");
          }
      }

      try {
        if (parsedAmount > (cltAllowance?? BigInt(0n))) {
           const txHash = await writeContractAsync({
                ...contracts.cltToken,
                functionName: "approve",
                args: [contracts.borrowFi.address, parsedAmount],
           });

           if (txHash) {
              await _addClt()
           }
        } else {
            await _addClt()
        }
        } catch (err) {
          console.error(err);
          showToast((err as Error)?.message || "Collateral add failed", "error")
        }
  }

  const withdrawCLT = async () => {
      const parsedAmount = parseEther(withdrawInput || "0")
      if (!userCollateral || userCollateral <= BigInt(0)) {
          showToast("No collateral to withdraw", "error")
          return
      }
      if (parsedAmount <= BigInt(0)) {
          showToast("Enter a valid withdraw amount", "error")
          return
      }
      try {
          const txHash = await writeContractAsync({
              ...contracts.borrowFi,
              functionName: "withdrawCollateral",
              args: [parsedAmount]
          })
          if (txHash) {
              showToast("Withdraw successful", "success")
          }
      } catch (err) {
          console.error(err)
          showToast((err as Error)?.message || "Withdraw failed", "error")
      }
  }

  const borrowBFI = async () => {
      const parsedAmount = parseEther(borrowInput || "0")
      if (!userCollateral || userCollateral <= BigInt(0) || !userCLT || userCLT <= BigInt(0)) {
          showToast("Add collateral and hold CLT before borrowing", "error")
          return
      }
      if (parsedAmount <= BigInt(0)) {
          showToast("Enter a valid borrow amount", "error")
          return
      }
      try {
          const txHash = await writeContractAsync({
              ...contracts.borrowFi,
              functionName: "borrow",
              args: [parsedAmount]
          })
          if (txHash) {
              showToast("Borrow successful", "success")
          }
      } catch (err) {
          console.error(err)
          showToast((err as Error)?.message || "Borrow failed", "error")
      }
  }

  const repayBFI = async () => {
      const parsedAmount = parseEther(repayInput || "0")
      if (!userLoan || userLoan <= BigInt(0)) {
          showToast("No outstanding loan to repay", "error")
          return
      }
      if (parsedAmount <= BigInt(0)) {
          showToast("Enter a valid repay amount", "error")
          return
      }
      const _repay = async () => {
          const txHash = await writeContractAsync({
              ...contracts.borrowFi,
              functionName: "repay",
              args: [parsedAmount]
          })
          if (txHash) {
              showToast("Repay successful", "success")
          }
      }
      try {
          if (parsedAmount > (bfiAllowance ?? BigInt(0n))) {
              const txHash = await writeContractAsync({
                  ...contracts.borrowToken,
                  functionName: "approve",
                  args: [contracts.borrowFi.address, parsedAmount]
              })
              if (txHash) {
                  await _repay()
              }
          } else {
              await _repay()
          }
      } catch (err) {
          console.error(err)
          showToast((err as Error)?.message || "Repay failed", "error")
      }
  }

  const barData = useMemo(() => [
      { name: "Collateral", value: Number(formatEther(userCollateral ?? BigInt(0))) },
      { name: "Loan", value: Number(formatEther(userLoan ?? BigInt(0))) },
  ], [userCollateral, userLoan])

  const utilization = useMemo(() => {
      const collateral = Number(formatEther(userCollateral ?? BigInt(0)))
      const loan = Number(formatEther(userLoan ?? BigInt(0)))
      if (collateral <= 0) return 0
      return Math.min(100, (loan / collateral) * 100)
  }, [userCollateral, userLoan])

  const pieData = useMemo(() => [
      { name: "Utilized", value: utilization },
      { name: "Available", value: Math.max(0, 100 - utilization) },
  ], [utilization])


  return (
    <div className="px-8 grid gap-6 md:px-16 bg-neutral-100 min-h-screen py-8">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-md px-4 py-2 shadow ${toast.variant === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.message}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-neutral-500">Collateral</p>
              <p className="text-2xl font-semibold">{formatEther(userCollateral ?? BigInt(0))}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-neutral-500">Loan</p>
              <p className="text-2xl font-semibold">{formatEther(userLoan ?? BigInt(0))}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-neutral-500">CLT</p>
              <p className="text-2xl font-semibold">{formatEther(userCLT ?? BigInt(0))}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-sm text-neutral-500">BFI</p>
                  <p className="text-2xl font-semibold">{formatEther(userBFI ?? BigInt(0))}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${isHealthy ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {isHealthy ? "Healthy" : "Not Healthy"}
              </span>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <Tabs.Root defaultValue="borrow">
                  <Tabs.List className="flex justify-center gap-2 border-b border-neutral-200">
                      <Tabs.Trigger value="borrow" className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-600">Borrow</Tabs.Trigger>
                      <Tabs.Trigger value="repay" className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-600">Repay</Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="borrow" className="pt-4">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                          <div className="flex-1">
                              <label className="text-sm text-neutral-600">Amount to borrow</label>
                              <input className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" type="number" value={borrowInput} onChange={(e) => setBorrowInput(e.target.value)} />
                          </div>
                          <button onClick={borrowBFI} className="rounded-md bg-orange-600 text-white px-4 py-2 hover:bg-orange-700">Borrow</button>
                      </div>
                      <div className="mt-3 text-xs text-neutral-500">
                          <p>Available BFI: {formatEther(availableBorrow ?? BigInt(0))}</p>
                      </div>
                  </Tabs.Content>
                  <Tabs.Content value="repay" className="pt-4">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                          <div className="flex-1">
                              <label className="text-sm text-neutral-600">Amount to repay</label>
                              <input className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" type="number" value={repayInput} onChange={(e) => setRepayInput(e.target.value)} />
                          </div>
                          <button onClick={repayBFI} className="rounded-md bg-orange-600 text-white px-4 py-2 hover:bg-orange-700">Repay</button>
                      </div>
                      <div className="mt-3 text-xs text-neutral-500">
                          <p>Outstanding Loan: {formatEther(userLoan ?? BigInt(0))}</p>
                      </div>
                  </Tabs.Content>
              </Tabs.Root>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-500">LTC</p>
                  <p className="text-sm font-medium">{Number(userLTC ?? 0)}</p>
              </div>
              <div className="mt-3 text-sm text-neutral-600 space-y-1">
                  <p>Pool BFI: {formatEther(availableBorrow ?? BigInt(0))}</p>
                  <p>Pool CLT: {formatEther(availableCLT ?? BigInt(0))}</p>
                  <p>Total Borrowed: {formatEther(totalBorrowed ?? BigInt(0))}</p>
                  <p>Total Collateral: {formatEther(totalCollateral ?? BigInt(0))}</p>
              </div>
          </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-neutral-500 mb-3">Collateral</p>
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
              <div className="flex-1">
                  <label className="text-sm text-neutral-600">Add CLT</label>
                  <input className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" type={"number"} value={cltInput} onChange={(e) => setCltInput(e.target.value)} />
              </div>
              <button className="rounded-md bg-orange-600 text-white px-4 py-2 hover:bg-orange-700" onClick={addCLT}>Add</button>
              <div className="flex-1">
                  <label className="text-sm text-neutral-600">Withdraw CLT</label>
                  <input className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" type={"number"} value={withdrawInput} onChange={(e) => setWithdrawInput(e.target.value)} />
              </div>
              <button className="rounded-md bg-neutral-800 text-white px-4 py-2 hover:bg-neutral-900" onClick={withdrawCLT}>Withdraw</button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm h-80">
              <p className="text-sm text-neutral-500 mb-2">Collateral vs Loan</p>
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#fb923c" radius={[6,6,0,0]} />
                  </BarChart>
              </ResponsiveContainer>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm h-80">
              <p className="text-sm text-neutral-500 mb-2">Utilization</p>
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                          <Cell fill="#fb923c" />
                          <Cell fill="#e5e7eb" />
                      </Pie>
                      <Tooltip />
                  </PieChart>
              </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};

export default Main;
