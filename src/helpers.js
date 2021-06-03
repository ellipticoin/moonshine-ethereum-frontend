import { useEffect, useState } from "react";
import { ROUTER_ADDRESS } from "./constants";
import RouterJSON from "./Router.json";
import PoolJSON from "./Pool.json";
import { ethers } from "ethers";

export function usePool(token) {
  const pools = usePools();
  if (!token) return;
  return pools.filter((pool) => pool.token === token.value)[0];
}

export function usePools() {
  const [pools, setPools] = useState([]);
  useEffect(() => {
    async function fetchPool() {
      const signer = new ethers.providers.Web3Provider(
        window.ethereum
      ).getSigner();
      const routerContract = new ethers.Contract(
        ROUTER_ADDRESS,
        RouterJSON.abi,
        signer
      );
      const poolsLength = await routerContract.getPoolsLength();
      const pools = await Promise.all(
        Array.from({ length: poolsLength }, async (x, i) => {
          const contract = new ethers.Contract(
            await routerContract.pools(i),
            PoolJSON.abi,
            signer
          );
          const { address } = contract;
          const token = await contract.token();
          // return 1
          return {
            address,
            token,
            baseTokenBalance: await routerContract.baseTokenBalances(address),
            tokenBalance: await routerContract.tokenBalances(address),

            contract,
          };
        })
      );
      setPools(pools);
    }
    fetchPool();
  }, []);
  return pools;
}
