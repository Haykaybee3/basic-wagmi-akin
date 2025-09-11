import { sanitizeDecimalInput } from "../lib/validation";
import Spinner from "../components/ui/Spinner";
import { formatUnits2dpFloor } from "../lib/formatting";

type Props = {
  repayInput: string;
  setRepayInput: (v: string) => void;
  onRepay: () => Promise<void> | void;
  isLoading: boolean;
  buttonState: "approve" | "repay";
  repayError: [boolean, string];
  userLoan?: bigint;
  userBFI?: bigint;
  bfiDecimals?: number;
}

const Repay = ({ repayInput, setRepayInput, onRepay, isLoading, buttonState, repayError, userLoan, bfiDecimals = 18 }: Props) => (
  <div className="pt-4">
    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
      <div className="flex-1">
        <label className="text-sm text-neutral-600">Amount to repay</label>
        <div className="mt-1 relative">
          <input className="w-full rounded-md border border-neutral-300 px-3 pr-14 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" inputMode="decimal" value={repayInput} onChange={(e) => setRepayInput(sanitizeDecimalInput(e.target.value, 2))} />
          <button type="button" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100" onClick={() => {
            const max = userLoan ?? BigInt(0);
            setRepayInput(formatUnits2dpFloor(max, bfiDecimals));
          }}>Max</button>
        </div>
      </div>
      <button
        className="rounded-md bg-orange-600 text-white px-4 py-2 hover:bg-orange-700 disabled:bg-gray-500 flex items-center justify-center gap-2"
        disabled={isLoading || (!!repayError[0] && buttonState !== "approve")}
        onClick={onRepay}
      >
        {isLoading ? <Spinner /> : (buttonState === "approve" ? "Approve" : "Repay")}
      </button>
    </div>
    {repayError[1] && <p className="mt-2 text-sm text-red-600">{repayError[1]}</p>}
  </div>
)

export default Repay;


