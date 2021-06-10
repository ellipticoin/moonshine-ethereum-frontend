import { useRef, useState } from "react";
import { MOONSHINE_DECIMALS } from "../constants";
import { POOL, YIELD_FARMABLE } from "../contracts";
import { ethers } from "ethers";
import chaChing from "./chaching.wav";
import { useQueryEth, useTimestamp, useBlockNumber } from "../ethereum.js";
const {
  utils: { formatUnits },
} = ethers;
export default function PendingYield(props) {
  const { address, pool } = props;
  const [lastHarvestedBlockNumber, setLastHarvestedBlockNumber] = useState();
  const [nonce, setNonce] = useState(0);
  const chaChingRef = useRef();
  const blockNumber = useBlockNumber();
  const pendingYield = usePendingYield(pool.address, address, nonce);
  const harvest = async () => {
    const tx = await YIELD_FARMABLE.attach(pool.address).harvest();
    setLastHarvestedBlockNumber(BigInt((await tx.wait()).blockNumber));
    chaChingRef.current.currentTime = 0;
    await chaChingRef.current.play();
    setNonce(nonce + 1);
  };
  return (
    <div>
      <div className="list-group my-3">
        <div className="list-group-item" aria-current="true">
          <div className="d-flex w-100 justify-content-between">
            <h4>
              Moonshine Earned:{" "}
              {pendingYield !== null &&
                formatUnits(pendingYield, MOONSHINE_DECIMALS)}
            </h4>
          </div>
        </div>
      </div>
      <div className="d-grid gap-2 mt-2">
        <button
          disabled={lastHarvestedBlockNumber === blockNumber}
          onClick={(e) => {
            e.preventDefault();
            harvest();
          }}
          className="btn btn-success btn-lg"
        >
          Harvest
          <audio ref={chaChingRef} preload="true">
            <source src={chaChing} />
          </audio>
        </button>
      </div>
    </div>
  );
}

export function usePendingYield(poolAddress, address, nonce) {
  const timestamp = useTimestamp(nonce);
  const balanceOfOwner = useQueryEth(() =>
    POOL.attach(poolAddress).balanceOf(address)
  );
  const totalYieldPerToken = useQueryEth(
    YIELD_FARMABLE.attach(poolAddress).totalYieldPerToken,
    [nonce]
  );
  const PRECISION = useQueryEth(YIELD_FARMABLE.attach(poolAddress).PRECISION);
  const lastCheckpoint = useQueryEth(
    YIELD_FARMABLE.attach(poolAddress).lastCheckpoint,
    [nonce]
  );
  const yieldHarvestedByOwner = useQueryEth(
    () => YIELD_FARMABLE.attach(poolAddress).yieldHarvested(address),
    [nonce]
  );
  const yieldPerSecond = useQueryEth(
    YIELD_FARMABLE.attach(poolAddress).yieldPerSecond
  );
  const totalSupply = useQueryEth(POOL.attach(poolAddress).totalSupply);
  let secondsSinceLastCheckpoint =
    timestamp && lastCheckpoint ? timestamp - lastCheckpoint : null;
  if (
    timestamp !== null &&
    balanceOfOwner !== null &&
    totalYieldPerToken !== null &&
    PRECISION &&
    yieldPerSecond !== null &&
    yieldHarvestedByOwner !== null &&
    secondsSinceLastCheckpoint !== null &&
    totalSupply
  ) {
    if (secondsSinceLastCheckpoint < 0n) {
      secondsSinceLastCheckpoint = 0n;
    }
    return (
      (balanceOfOwner * totalYieldPerToken) / PRECISION +
      (balanceOfOwner * secondsSinceLastCheckpoint * yieldPerSecond) /
        totalSupply -
      yieldHarvestedByOwner
    );
  } else {
    return null;
  }
}
