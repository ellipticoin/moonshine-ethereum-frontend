import { MSX } from "./contracts";
import { POLYGON_CHAIN_ID } from "./constants";
import { BASE_TOKEN_DECIMALS } from "./constants";
import TokenAmount from "./TokenAmount";
import ChainSwitcher from "./ChainSwitcher";
import { useQueryEth } from "./ethereum";
import "bootstrap/dist/js/bootstrap.min.js";

const {
  utils: { id, hexZeroPad },
} = require("ethers");

export default function UserAddress(props) {
  const { address, chainId } = props;
  const shortenedAddress =
    address && `${address.substr(0, 5)}...${address.substr(38)}`;
  const moonshineBalance = useQueryEth(
    MSX,
    async (contract) => {
      return contract.balanceOf(address);
    },
    [address],
    [id("Transfer(address,address,uint256)"), null, hexZeroPad(address, 32)]
  );

  const balance = 0n;

  // useQueryEth(
  //     ERC20.attach(getContractAddress(chainId, "BaseToken")),
  //     async (contract) => {
  //       return contract.balanceOf(address);
  //     },
  //     [chainId, address],
  //     [id("Transfer(address,address,uint256)"), null, hexZeroPad(address, 32)]
  //   );

  return address ? (
    <>
      {chainId === POLYGON_CHAIN_ID ? (
        <>
          <div className="text-end d-none d-lg-block">
            <h5 className="mt-1 mb-0">
              <span className="badge">
                <TokenAmount
                  decimals={BASE_TOKEN_DECIMALS}
                  prefix="$ "
                  ticker="USDC"
                >
                  {balance}
                </TokenAmount>
              </span>
            </h5>
            <h5>
              <span className="badge">
                <TokenAmount decimals={BASE_TOKEN_DECIMALS} ticker="MSX">
                  {moonshineBalance}
                </TokenAmount>
              </span>
            </h5>
          </div>
        </>
      ) : null}
      <div className="btn-group mx-2 d-none d-lg-block">
        <button
          type="button"
          className="btn btn-light dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {shortenedAddress}
        </button>
        <ul className="dropdown-menu dropdown-menu-end">
          <ChainSwitcher chainId={chainId} buttonStyle={{ width: 200 }} />
        </ul>
      </div>
    </>
  ) : null;
}
