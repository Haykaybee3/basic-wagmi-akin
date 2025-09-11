import { sanitizeDecimalInput } from "../lib/validation";
import Spinner from "../components/ui/Spinner";
import { formatUnits2dp, formatUnits2dpFloor } from "../lib/formatting";


type Props = {
  borrowInput: string;
  setBorrowInput: (v: string) => void;
  onBorrow: () => Promise<void> | void;
  isLoading: boolean;
  availableBorrow: bigint | undefined;
  parsedBorrowAmount: bigint;
  simulateBorrowError?: Error | null;
  getParsedError: (e: unknown) => string;
  borrowable: bigint;
  bfiDecimals: number;
}

const Borrow = ({ borrowInput, setBorrowInput, onBorrow, isLoading, availableBorrow, parsedBorrowAmount, simulateBorrowError, getParsedError, borrowable, bfiDecimals }: Props) => (
  <div className="pt-4">
    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
      <div className="flex-1">
        <label className="text-sm text-neutral-600">Amount to borrow</label>

        <div className="mt-1 relative">
          <input className="w-full rounded-md border border-neutral-300 px-3 pr-14 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" inputMode="decimal" min={1} value={borrowInput} onChange={(e) => setBorrowInput(sanitizeDecimalInput(e.target.value, 2))} />
          <button type="button" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100" onClick={() => setBorrowInput(formatUnits2dpFloor(borrowable, bfiDecimals))}>Max</button>
        </div>
      </div>
      <button onClick={onBorrow} disabled={(() => {
        if (parsedBorrowAmount === BigInt(0)) return true
        const CENT = BigInt(10) ** BigInt(Math.max(0, bfiDecimals - 2))
        const headroom = (borrowable / CENT) * CENT
        if (parsedBorrowAmount > headroom) return true
        return false
      })()} className="rounded-md bg-orange-600 text-white px-4 py-2 hover:bg-orange-700 disabled:bg-gray-500">
        {isLoading ? <Spinner /> : "Borrow"}
      </button>
    </div>
    <div className="mt-3 text-xs text-neutral-500">
      <p>Available BFI: {formatUnits2dp(availableBorrow, bfiDecimals)}</p>
      <p>Borrowable: {formatUnits2dpFloor(borrowable, bfiDecimals)}</p>
    </div>
    {(() => {
      const amt = parsedBorrowAmount
      if (amt === BigInt(0)) return null
      const CENT = BigInt(10) ** BigInt(Math.max(0, bfiDecimals - 2))
      const headroom = (borrowable / CENT) * CENT
      if (amt > headroom) return <p className="mt-2 text-sm text-red-600">Amount exceeds borrowable</p>
      if (simulateBorrowError) return <p className="mt-2 text-sm text-red-600">{getParsedError(simulateBorrowError)}</p>
      return null
    })()}
  </div>
)

export default Borrow;


