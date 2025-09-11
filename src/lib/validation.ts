export const isZero = (v: bigint) => v === BigInt(0);
export const lt = (a: bigint, b: bigint) => a < b;
export const gt = (a: bigint, b: bigint) => a > b;

export const sanitizeDecimalInput = (value: string, maxDecimals: number) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const parts = trimmed.replace(/[^0-9.]/g, '').split('.');
  const integer = parts[0] || "0";
  const decimals = parts[1] ? parts[1].slice(0, Math.max(0, maxDecimals)) : "";
  return decimals ? `${integer}.${decimals}` : integer;
}


