import { MSX } from "./contracts";
import { BASE_TOKEN_DECIMALS } from "./constants";
import TokenAmount from "./TokenAmount";
import { useQueryEth } from "./ethereum";
const {
  utils: { id, hexZeroPad },
} = require("ethers");
export default function UserAddress(props) {
  const { metamaskIsConnected, address } = props;
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

  return metamaskIsConnected ? (
    <>
      <h3 className="mx-2 mt-2">
        <span className="badge">{shortenedAddress}</span>
      </h3>
      <div className="text-end">
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
  ) : null;
}
