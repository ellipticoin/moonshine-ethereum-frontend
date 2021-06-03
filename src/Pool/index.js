import TokenSelect from "../TokenSelect";
import ManageLiquidity from "./ManageLiquidity";
import CreatePool from "./CreatePool";
import { usePools, usePool } from "../helpers";
import { useState, useEffect } from "react";

export default function Pool(props) {
  const { address } = props;
  const [token, setToken] = useState();
  const [liquidityTokenBalance, setLiquidityTokenBalance] = useState();
  const pools = usePools();
  const pool = usePool(token);
  useEffect(() => {
    async function fetchLiquidityTokenData() {
      if (!pool) return;
      const liquidityTokenBalance = await pool.contract.balanceOf(address);
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
            pools={pools}
            onChange={(token) => setToken(token)}
            placeholder="Token"
            includeBaseToken={false}
          />
          {liquidityTokenBalance > 0n ? (
            <ManageLiquidity liquidityTokenBalance={liquidityTokenBalance} />
          ) : (
            <CreatePool address={address} token={token} pools={pools} />
          )}
        </div>
      </div>
    </form>
  );
}
