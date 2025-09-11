import * as Tabs from "@radix-ui/react-tabs";
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Toast from "../components/ui/Toast";
import SummaryCards from "../components/ui/SummaryCards";
import Borrow from "../features/Borrow";
import Repay from "../features/Repay";
import Collateral from "../features/Collateral";
import { formatUnits2dp, formatUnits2dpFloor } from "../lib/formatting";

type Props = {
  chainId?: number;
  isSwitchingChain: boolean;
  onSwitchNetwork: () => Promise<void> | void;
  toast: { message: string; variant: "success" | "error" } | null;

  // summary cards
  userCollateral: bigint | undefined;
  userLoan: bigint | undefined;
  userCLT: bigint | undefined;
  userBFI: bigint | undefined;
  cltDecimals: number;
  isHealthy: boolean;
  availableBorrow: bigint | undefined;
  availableCLT: bigint | undefined;
  totalBorrowed: bigint | undefined;
  totalCollateral: bigint | undefined;
  ltcRatio: number;
  borrowable: bigint;

  // charts data
  barData: Array<{ name: string; value: number }>;
  pieData: Array<{ name: string; value: number }>;

  // borrow data
  borrowInput: string;
  setBorrowInput: (v: string) => void;
  onBorrow: () => Promise<void> | void;
  isBorrowLoading: boolean;
  parsedBorrowAmount: bigint;
  simulateBorrowError?: Error | null;
  getParsedError: (e: unknown) => string;
  bfiDecimals: number;

  // repay data
  repayInput: string;
  setRepayInput: (v: string) => void;
  onRepay: () => Promise<void> | void;
  isRepayLoading: boolean;
  repayButtonState: "approve" | "repay";
  repayError: [boolean, string];
  // needed for Max on repay
  // userLoan and userBFI already exist above in summary cards section

  // collateral data    
  cltInput: string;
  setCltInput: (v: string) => void;
  withdrawInput: string;
  setWithdrawInput: (v: string) => void;
  onAddClt: () => Promise<void> | void;
  onApproveClt: () => Promise<void> | void;
  onWithdrawClt: () => Promise<void> | void;
  addDisabled: boolean;
  hasCltAllowance: boolean;
  isAddSimulating: boolean;
  addCltError: [boolean, string];
  withdrawDisabled: boolean;
  withdrawWarning: string;
  isApproveCltLoading: boolean;
  isAddCltLoading: boolean;
  isWithdrawCltLoading: boolean;
  // pass through for withdraw Max
  // userLoan and userCollateral are already present above
}

const Dashboard = (props: Props) => {
  return (
    <div className="px-8 grid gap-6 md:px-16 bg-neutral-100 min-h-screen py-8">
      {props.chainId && props.chainId !== 11155111 && (
        <div className="rounded-md bg-yellow-100 text-yellow-800 px-4 py-2">
          Wrong network. Please switch to Sepolia.
          <button
            className="ml-2 inline-flex rounded bg-yellow-600 text-white px-2 py-1 text-xs disabled:opacity-50"
            disabled={props.isSwitchingChain}
            onClick={() => props.onSwitchNetwork()}
          >Switch</button>
        </div>
      )}
      {props.toast && (<Toast message={props.toast.message} variant={props.toast.variant} />)}

      <SummaryCards
        collateral={props.userCollateral ?? BigInt(0)}
        loan={props.userLoan ?? BigInt(0)}
        clt={props.userCLT ?? BigInt(0)}
        bfi={props.userBFI ?? BigInt(0)}
        healthy={props.isHealthy}
        cltDecimals={props.cltDecimals}
        bfiDecimals={props.bfiDecimals}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <Tabs.Root defaultValue="borrow">
            <Tabs.List className="flex justify-center gap-2 border-b border-neutral-200">
              <Tabs.Trigger value="borrow" className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-600">Borrow</Tabs.Trigger>
              <Tabs.Trigger value="repay" className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-600">Repay</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="borrow" className="pt-4">
              <Borrow
                borrowInput={props.borrowInput}
                setBorrowInput={props.setBorrowInput}
                onBorrow={props.onBorrow}
                isLoading={props.isBorrowLoading}
                availableBorrow={props.availableBorrow}
                parsedBorrowAmount={props.parsedBorrowAmount}
                borrowable={props.borrowable}
                simulateBorrowError={props.simulateBorrowError as any}
                getParsedError={props.getParsedError}
                bfiDecimals={props.bfiDecimals}
              />
            </Tabs.Content>
            <Tabs.Content value="repay" className="pt-4">
              <Repay
                repayInput={props.repayInput}
                setRepayInput={props.setRepayInput}
                onRepay={props.onRepay}
                isLoading={props.isRepayLoading}
                buttonState={props.repayButtonState}
                repayError={props.repayError}
                userLoan={props.userLoan}
                userBFI={props.userBFI}
                bfiDecimals={props.bfiDecimals}
              />
              <div className="mt-3 text-xs text-neutral-500">
                <p>Outstanding Loan: {formatUnits2dp(props.userLoan, props.bfiDecimals)}</p>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">LTC</p>
            <p
              className="text-sm font-medium"
              title="Calculated from on-chain amounts; values shown are floored to 2dp."
            >{(props.ltcRatio / 100).toFixed(2)}%</p>
          </div>
          <div className="mt-3 text-sm text-neutral-600 space-y-1">
            <p>Pool BFI: {formatUnits2dp(props.availableBorrow, props.bfiDecimals)}</p>
            <p>Pool CLT: {formatUnits2dp(props.availableCLT, props.cltDecimals)}</p>
            <p>Total Borrowed: {formatUnits2dp(props.totalBorrowed, props.bfiDecimals)}</p>
            <p>Total Collateral: {formatUnits2dp(props.totalCollateral, props.cltDecimals)}</p>
            <p>Borrowable: {formatUnits2dpFloor(props.borrowable, props.bfiDecimals)}</p>
          </div>
        </div>
      </div>

      <Collateral
        cltInput={props.cltInput}
        setCltInput={props.setCltInput}
        withdrawInput={props.withdrawInput}
        setWithdrawInput={props.setWithdrawInput}
        onAdd={props.onAddClt}
        onApproveClt={props.onApproveClt}
        onWithdraw={props.onWithdrawClt}
        addDisabled={props.addDisabled}
        hasCltAllowance={props.hasCltAllowance}
        addError={props.addCltError}
        withdrawDisabled={props.withdrawDisabled}
        withdrawWarning={props.withdrawWarning}
        isApproveCltLoading={props.isApproveCltLoading}
        isAddCltLoading={props.isAddCltLoading}
        isWithdrawCltLoading={props.isWithdrawCltLoading}
        userCollateral={props.userCollateral}
        userLoan={props.userLoan}
        cltDecimals={props.cltDecimals}
        userCLT={props.userCLT}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm h-80">
          <p className="text-sm text-neutral-500 mb-2">Collateral vs Loan</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={props.barData}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => Math.round(Number(v)).toString()} allowDecimals={false} domain={[0, 'auto']} />
              <Tooltip />
              <Bar dataKey="value" fill="#fb923c" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm h-80">
          <p className="text-sm text-neutral-500 mb-2">Utilization</p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={props.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                <Cell fill="#fb923c" />
                <Cell fill="#e5e7eb" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Dashboard;


