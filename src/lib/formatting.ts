import { formatEther } from "viem";

export const formatWei = (value?: bigint) => formatEther(value ?? BigInt(0));

export const formatUnits2dp = (value?: bigint, decimals?: number) => {
  const v = value ?? BigInt(0);
  const d = typeof decimals === 'number' ? decimals : 18;
  const cent = BigInt(10) ** BigInt(Math.max(0, d - 2));
  const cents = (v + (cent / BigInt(2))) / cent; // rounded
  const integerPart = cents / BigInt(100);
  const decimalPart = Number(cents % BigInt(100));
  return `${integerPart}.${decimalPart.toString().padStart(2, '0')}`;
}

export const formatUnits2dpFloor = (value?: bigint, decimals?: number) => {
  const v = value ?? BigInt(0);
  const d = typeof decimals === 'number' ? decimals : 18;
  const cent = BigInt(10) ** BigInt(Math.max(0, d - 2));
  const cents = v / cent; // floor
  const integerPart = cents / BigInt(100);
  const decimalPart = Number(cents % BigInt(100));
  return `${integerPart}.${decimalPart.toString().padStart(2, '0')}`;
}

export const formatBorrowable = (value?: bigint) => {
  const v = value ?? BigInt(0);
  const thresholdWei = BigInt(1_000_000_000_000);
  if (v < thresholdWei) return "0";
  return formatEther2dpFloor(v);
};

export const formatEther2dp = (value?: bigint) => {
  const v = value ?? BigInt(0);
  const WEI_PER_ETHER = BigInt(1_000_000_000_000_000_000);
  const WEI_PER_CENT = BigInt(10_000_000_000_000_00); // 1e16
  const SNAP_EPSILON = BigInt(1_000_000_000_000); // 1e12 wei

  const whole = v / WEI_PER_ETHER;
  const remainder = v % WEI_PER_ETHER;
  if (remainder <= SNAP_EPSILON || (WEI_PER_ETHER - remainder) <= SNAP_EPSILON) {
    const snapped = remainder <= SNAP_EPSILON ? whole : (whole + BigInt(1));
    return `${snapped}.00`;
  }

  const cents = (v + (WEI_PER_CENT / BigInt(2))) / WEI_PER_CENT; // rounded to 2dp in cents
  const integerPart = cents / BigInt(100);
  const decimalPart = Number(cents % BigInt(100));
  const dec = decimalPart.toString().padStart(2, '0');
  return `${integerPart}.${dec}`;
};

export const formatEther2dpFloor = (value?: bigint) => {
  const v = value ?? BigInt(0);
  const WEI_PER_CENT = BigInt(10_000_000_000_000_00); // 1e16
  const cents = v / WEI_PER_CENT; // floor to 2dp
  const integerPart = cents / BigInt(100);
  const decimalPart = Number(cents % BigInt(100));
  const dec = decimalPart.toString().padStart(2, '0');
  return `${integerPart}.${dec}`;
};


