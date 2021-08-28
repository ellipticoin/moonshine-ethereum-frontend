import { useRef, useState, useMemo } from "react";
import TokenAmount from "../TokenAmount";
import { proportionOf } from "../helpers";
import chaChing from "./chaching.wav";
import { AMM } from "../contracts.js";
import { getGasPrice } from "../polygon.js";
import Button from "../Button";
import { ethers } from "ethers";
import { useQueryEth, useTimestamp, useBlockNumber } from "../ethereum.js";

const {
  utils: { id },
} = ethers;

export default function PendingYield(props) {
  const { address, pool, poolId, poolBalance, chainId } = props;

  const [lastHarvestedBlockNumber, setLastHarvestedBlockNumber] = useState();
  const [loading, setLoading] = useState(false);
  const chaChingRef = useRef();
  const blockNumber = useBlockNumber();
  const pendingYield = usePendingYield(
    pool,
    poolId,
    poolBalance,
    address,
    chainId
  );
  const tokensInPool = useMemo(
    () => proportionOf(pool.totalSupplyOfToken, poolBalance, pool.totalSupply),
    [pool.totalSupplyOfToken, poolBalance, pool.totalSupply]
  );
  const baseTokensInPool = useMemo(
    () =>
      proportionOf(pool.totalSupplyOfBaseToken, poolBalance, pool.totalSupply),
    [pool.totalSupplyOfBaseToken, poolBalance, pool.totalSupply]
  );
  const shareOfPool = useMemo(
    () => proportionOf(1000000n, poolBalance, pool.totalSupply),
    [poolBalance, pool.totalSupply]
  );
  const yourIssauancePerBlock = useMemo(
    () => proportionOf(pool.yieldPerSecond, poolBalance, pool.totalSupply),
    [pool.yieldPerSecond, poolBalance, pool.totalSupply]
  );
  const harvest = async () => {
    setLoading(true);
    chaChingRef.current.currentTime = 0;
    await chaChingRef.current.play();
    try {
      const tx = await AMM.harvest(poolId, {
        gasPrice: await getGasPrice("fastest"),
      });
      setLastHarvestedBlockNumber(BigInt((await tx.wait()).blockNumber));
    } catch (err) {
      if (err.data && err.data.message) alert(err.data.message);
      if (err) console.log(err);
    }
    setLoading(false);
  };
  return (
    <div>
      <audio ref={chaChingRef} preload="true">
        <source src={chaChing} />
      </audio>
      <div className="list-group my-3">
        <div className="list-group-item d-flex justify-content-between">
          <span className="mb-1">Your Share of Issuance Per Second</span>
          <div>
            <TokenAmount>{pool.yieldPerSecond}</TokenAmount> (total pool
            issuance per second) x{" "}
            {Number(shareOfPool * 100n) / Number(1000000n)} % of pool =
            <TokenAmount>{yourIssauancePerBlock}</TokenAmount>
          </div>
        </div>
        <div className="list-group-item d-flex justify-content-between">
          <span className="mb-1">Tokens in Pool</span>
          <TokenAmount>{tokensInPool}</TokenAmount>
        </div>
        <div className="list-group-item d-flex justify-content-between">
          <span className="mb-1">USDC in Pool</span>
          <TokenAmount>{baseTokensInPool}</TokenAmount>
        </div>
        <div className="list-group-item d-flex justify-content-between">
          <strong className="mb-1">Moonshine Earned</strong>
          <strong className="text-success">
            <TokenAmount ticker="MSX">{pendingYield}</TokenAmount>
          </strong>
        </div>
      </div>
      <div className="d-grid gap-2 mt-2">
        <Button
          disabled={lastHarvestedBlockNumber === blockNumber}
          onClick={(e) => {
            e.preventDefault();
            harvest();
          }}
          loading={loading}
          className="btn btn-success btn-lg"
        >
          Harvest
        </Button>
      </div>
    </div>
  );
}

export function usePendingYield(pool, poolId, poolBalance, address, chainId) {
  const timestamp = useTimestamp(chainId);
  const { totalYieldPerToken, lastCheckpoint, yieldPerSecond, totalSupply } =
    pool;
  const PRECISION = useQueryEth(AMM, (contract) => contract.YIELD_PRECISION());
  const YIELD_START_TIME = useQueryEth(AMM, (contract) =>
    contract.YIELD_START_TIME()
  );

  const yieldDebtByOwner = useQueryEth(
    AMM,
    async (contract) => contract.yieldDebt(poolId, address),
    [poolId, address],
    [id("Harvest(address,int64)")]
  );

  let secondsSinceLastCheckpoint =
    timestamp && lastCheckpoint
      ? lastCheckpoint < YIELD_START_TIME
        ? timestamp - YIELD_START_TIME
        : timestamp - lastCheckpoint
      : null;

  if (timestamp < YIELD_START_TIME) {
    return 0n;
  } else if (
    timestamp !== null &&
    poolBalance !== undefined &&
    totalYieldPerToken !== undefined &&
    PRECISION &&
    yieldPerSecond !== undefined &&
    yieldDebtByOwner !== undefined &&
    secondsSinceLastCheckpoint !== undefined &&
    totalSupply
  ) {
    if (secondsSinceLastCheckpoint < 0n) {
      secondsSinceLastCheckpoint = 0n;
    }

    return (
      (poolBalance * totalYieldPerToken) / PRECISION +
      (poolBalance * secondsSinceLastCheckpoint * yieldPerSecond) /
        totalSupply -
      yieldDebtByOwner
    );
  } else {
    return null;
  }
}
