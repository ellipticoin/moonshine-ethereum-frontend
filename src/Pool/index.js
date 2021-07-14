import { ethers } from "ethers";
import PoolSelect from "../PoolSelect";
import ManageLiquidity from "./ManageLiquidity";
import { useQueryEth } from "../ethereum";
import { AMM } from "../contracts.js";
import { useState } from "react";
const {
  constants: { AddressZero },
  utils: { id, hexZeroPad },
} = ethers;

export default function Pool(props) {
  const { address, chainId } = props;
  const [poolId, setPoolId] = useState(0);
  const pool = useQueryEth(
    AMM,
    (contract) => contract.pools(poolId),
    [poolId],
    [
      [
        id("AddLiquidity(address,uint256,int64)"),
        id("RemoveLiquidity(address,uint256,int64)"),
      ],
      hexZeroPad(address, 32),
    ]
  );
  const poolBalance = useQueryEth(
    AMM,
    async (contract) => contract.balances(poolId, address),
    [poolId, address],
    [
      [
        id("AddLiquidity(address,uint256,int64)"),
        id("RemoveLiquidity(address,uint256,int64)"),
      ],
      hexZeroPad(address, 32),
    ]
  );

  return pool == null ? null : (
    <form className="d-flex  flex-column">
      <div className="row mb-2">
        <div className="col">
          <PoolSelect
            value={poolId}
            onChange={setPoolId}
            placeholder="Token Pool"
          />
          {pool.address === AddressZero ||
          pool.totalSupplyOfBaseToken === undefined ||
          pool.totalSupplyOfToken === undefined ? (
            <div
              className="d-flex justify-content-center align-middle"
              style={{ marginTop: 120, marginBottom: 120 }}
            >
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <ManageLiquidity
              address={address}
              chainId={chainId}
              poolId={poolId}
              poolBalance={poolBalance}
              pool={pool}
            />
          )}
        </div>
      </div>
    </form>
  );
}
