import { formatUnits2dpFloor } from "../../lib/formatting";

type Props = {
  collateral: bigint;
  loan: bigint;
  clt: bigint;
  bfi: bigint;
  healthy: boolean;
  cltDecimals: number;
  bfiDecimals: number;
}

const SummaryCards = ({ collateral, loan, clt, bfi, healthy, cltDecimals, bfiDecimals }: Props) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-neutral-500">Collateral</p>
      <p className="text-2xl font-semibold">{formatUnits2dpFloor(collateral, cltDecimals)}</p>
    </div>
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-neutral-500">Loan</p>
      <p className="text-2xl font-semibold">{formatUnits2dpFloor(loan, bfiDecimals)}</p>
    </div>
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-neutral-500">CLT</p>
      <p className="text-2xl font-semibold">{formatUnits2dpFloor(clt, cltDecimals)}</p>
    </div>
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-neutral-500">BFI</p>
        <p className="text-2xl font-semibold">{formatUnits2dpFloor(bfi, bfiDecimals)}</p>
      </div>
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${healthy ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {healthy ? "Healthy" : "Not Healthy"}
      </span>
    </div>
  </div>
)

export default SummaryCards;


