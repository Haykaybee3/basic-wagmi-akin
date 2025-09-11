import Spinner from "../components/ui/Spinner";
import { formatUnits2dpFloor } from "../lib/formatting";

type Props = {
  cltInput: string;
  setCltInput: (v: string) => void;
  withdrawInput: string;
  setWithdrawInput: (v: string) => void;
  onAdd: () => Promise<void> | void;
  onApproveClt: () => Promise<void> | void;
  onWithdraw: () => Promise<void> | void;
  addDisabled: boolean;
  hasCltAllowance: boolean;
  addError: [boolean, string];
  withdrawDisabled: boolean;
  withdrawWarning: string;
  isApproveCltLoading: boolean;
  isAddCltLoading: boolean;
  isWithdrawCltLoading: boolean;
  userCollateral?: bigint;
  userLoan?: bigint;
  cltDecimals: number;
  userCLT?: bigint;
}

const Collateral = ({ cltInput, setCltInput, withdrawInput, setWithdrawInput, onAdd, onApproveClt, onWithdraw, addDisabled, hasCltAllowance, addError, withdrawDisabled, withdrawWarning, isApproveCltLoading, isAddCltLoading, isWithdrawCltLoading, userCollateral, userLoan, cltDecimals, userCLT }: Props) => (
  <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
    <p className="text-sm text-neutral-500 mb-3">Collateral</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
      <div>
        <label className="text-sm text-neutral-600">Add CLT</label>
        <div className="mt-1 relative">
          <input className="w-full rounded-md border border-neutral-300 px-3 pr-14 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" type={"number"} value={cltInput} onChange={(e) => setCltInput((e.target.value || '').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1').replace(/^(\d+)(\.(\d{0,2})?).*$/, (_m, i, d) => i + (d || '')))} />
          <button
            type="button"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100"
            onClick={() => {
              const bal = userCLT ?? BigInt(0);
              setCltInput(formatUnits2dpFloor(bal, cltDecimals));
            }}
          >Max</button>
        </div>
        <div className="min-h-[20px]">
          {addError[1] && <p className="mt-1 text-sm text-red-600">{addError[1]}</p>}
        </div>
        <button 
          className="w-full rounded-md bg-orange-600 text-white px-4 py-2 hover:bg-orange-700 disabled:bg-gray-500 flex items-center justify-center gap-2" 
          disabled={addDisabled || (hasCltAllowance ? isAddCltLoading : isApproveCltLoading)}
          onClick={hasCltAllowance ? onAdd : onApproveClt}
        >
          {hasCltAllowance
            ? (isAddCltLoading ? <Spinner /> : "Add")
            : (isApproveCltLoading ? <Spinner /> : "Approve")}
        </button>
      </div>
      <div>
        <label className="text-sm text-neutral-600">Withdraw CLT</label>
        <div className="mt-1 relative">
          <input className="w-full rounded-md border border-neutral-300 px-3 pr-14 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" type={"number"} value={withdrawInput} onChange={(e) => setWithdrawInput((e.target.value || '').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1').replace(/^(\d+)(\.(\d{0,2})?).*$/, (_m, i, d) => i + (d || '')))} />
          <button
            type="button"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100"
            onClick={() => {
              const currentCollateral = userCollateral ?? BigInt(0);
              const loan = userLoan ?? BigInt(0);
              if (currentCollateral === BigInt(0)) { setWithdrawInput("0"); return; }
              const TEN_THOUSAND = BigInt(10000);
              const SEVEN_THOUSAND = BigInt(7000);
              // minimal new collateral to keep ratio < 7000: floor((loan*10000)/7000) + 1
              const minNewCollateral = ((loan * TEN_THOUSAND) / SEVEN_THOUSAND) + BigInt(1);
              const minNewCollateralBounded = minNewCollateral < BigInt(1) ? BigInt(1) : minNewCollateral;
              if (currentCollateral <= minNewCollateralBounded) { setWithdrawInput("0"); return; }
              const maxWithdraw = currentCollateral - minNewCollateralBounded;
              setWithdrawInput(formatUnits2dpFloor(maxWithdraw, cltDecimals));
            }}
          >Max</button>
        </div>
        <div className="min-h-[20px]">
          {withdrawWarning && <p className="mt-1 text-sm text-yellow-700">{withdrawWarning}</p>}
        </div>
        <button className="w-full rounded-md bg-orange-600 text-white px-4 py-2 hover:bg-orange-700 disabled:bg-gray-500 flex items-center justify-center gap-2" disabled={withdrawDisabled || isWithdrawCltLoading} onClick={onWithdraw}>
          {isWithdrawCltLoading ? <Spinner /> : "Withdraw"}
        </button>
      </div>
    </div>
  </div>
)

export default Collateral;


