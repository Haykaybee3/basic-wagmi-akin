import { erc20Abi, type Abi, type Address } from "viem";
import borrowFiAbi from "./abis/borrowFi";

type TContracts = Record<
  string,
  {
    address: Address;
    abi: Abi;
  }
>;

const contracts = {
  borrowFi: {
    address: "0x306b3300A32C023d13D0846DD6Ffb4f5dfa89643",
    abi: borrowFiAbi,
  },
  cltToken: {
    address: "0x2593ef305026896ACD54b8E2Ef15d5a7D69F4D65",
    abi: erc20Abi,
  },
  borrowToken: {
    address: "0xE4A344e73188C792Ea7e273a1BA0406f09350024",
    abi: erc20Abi,
  },
} as const satisfies TContracts;

export default contracts;
