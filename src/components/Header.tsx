import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header = () => {
  return (
    <div className="py-4 px-12 flex items-center justify-between">
      <h1 className="text-2xl font-extrabold flex items-center gap-1">
        <span className="text-orange-600">Borrow</span>
        <span className="text-white bg-neutral-900 px-1 rounded">Fi</span>
      </h1>
      <ConnectButton />
    </div>
  );
};

export default Header;
