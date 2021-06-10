import TokenSelect from "../TokenSelect";
import ManageLiquidity from "./ManageLiquidity";
import CreatePool from "./CreatePool";
import { useBestPool, POOL } from "../contracts";
import { useState, useEffect } from "react";

export default function Pool(props) {
  const { address } = props;
  const [token, setToken] = useState();
  const [liquidityTokenBalance, setLiquidityTokenBalance] = useState();
  const pool = useBestPool(token && token.address);
  useEffect(() => {
    async function fetchLiquidityTokenData() {
      if (!pool.address) return;
      const liquidityTokenBalance = await POOL.attach(pool.address).balanceOf(
        address
      );
      setLiquidityTokenBalance(BigInt(liquidityTokenBalance.toString()));
    }
    fetchLiquidityTokenData();
  });

  return (
    <form className="d-flex  flex-column">
      <div className="row mb-2">
        <div className="col">
          <TokenSelect
            value={token}
            onChange={(token) => setToken(token)}
            placeholder="Token"
            includeBaseToken={false}
          />
          {liquidityTokenBalance > 0n ? (
            <ManageLiquidity
              address={address}
              liquidityTokenBalance={liquidityTokenBalance}
              pool={pool}
            />
          ) : (
            <CreatePool address={address} token={token} />
          )}
        </div>
      </div>
    </form>
  );
}
