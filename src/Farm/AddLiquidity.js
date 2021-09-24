import { useMemo, useRef, useState } from "react";
import TokenAmountInput from "../ETHInputs/TokenAmountInput";
import { ethers } from "ethers";
import { getGasPrice } from "../polygon.js";
import { AMM, ERC20, USDC } from "../contracts.js";
import { proportionOf } from "../helpers";
import { useQueryEth } from "../ethereum.js";
import { BASE_TOKEN_DECIMALS } from "../constants";
import DepositButton from "./DepositButton";
const {
  constants: { MaxUint256 },
  utils: { id, hexZeroPad },
} = ethers;
export default function AddLiquidity(props) {
  const { address, pool, poolId } = props;
  const onChangeRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const tokenToAddRef = useRef(null);
  const baseTokenToAddRef = useRef(null);
  const [tokenToAdd, setTokenToAdd] = useState();
  const [baseTokenToAdd, setBaseTokenToAdd] = useState();
  const [depositToSafe, setDepositToSafe] = useState(false);
  const baseTokenAllowance = useQueryEth(
    USDC,
    async (contract) => {
      return contract.allowance(address, AMM.address);
    },
    [address],
    [id("Approval(address,address,uint256)"), hexZeroPad(address, 32), null]
  );
  const tokenAllowance = useQueryEth(
    ERC20.attach(pool.token),
    async (contract) => {
      return contract.allowance(address, AMM.address);
    },
    [address],
    [id("Approval(address,address,uint256)"), hexZeroPad(address, 32), null]
  );

  const addLiquidity = async () => {
    setLoading(true);
    const tx = await AMM.addLiquidity(poolId, tokenToAdd, depositToSafe, {
      gasPrice: await getGasPrice("fastest"),
    });
    try {
      await tx.wait();
    } catch (err) {
      if (err.data && err.data.message) alert(err.data.message);
      if (err) console.log(err);

      setLoading(false);
    }
    setLoading(false);
  };
  const approveBaseToken = async () => {
    setLoading(true);
    const tx = await USDC.approve(AMM.address, MaxUint256, {
      gasPrice: await getGasPrice("fastest"),
    });
    try {
      await tx.wait();
      setLoading(false);
    } catch (err) {
      if (err.data && err.data.message) alert(err.data.message);
      if (err) console.log(err);
      setLoading(false);
    }
  };

  const approveToken = async () => {
    setLoading(true);
    const tokenContract = ERC20.attach(pool.token);
    const tx = await tokenContract.approve(AMM.address, MaxUint256, {
      gasPrice: await getGasPrice("fastest"),
    });
    try {
      await tx.wait();
      setLoading(false);
    } catch (err) {
      if (err.data && err.data.message) alert(err.data.message);
      if (err) console.log(err);
      setLoading(false);
    }
  };
  const baseTokenRequiresApproval = useMemo(
    () => baseTokenAllowance < baseTokenToAdd,
    [baseTokenAllowance, baseTokenToAdd]
  );
  const tokenRequiresApproval = useMemo(
    () => tokenAllowance < tokenToAdd,
    [tokenAllowance, tokenToAdd]
  );

  return (
    <div className="mt-4">
      <TokenAmountInput
        label="Token to Add"
        ref={tokenToAddRef}
        address={address}
        onChange={(tokenToAdd) => {
          setTokenToAdd(tokenToAdd);
          if (!tokenToAdd) return;
          const newBaseTokenToAdd = proportionOf(
            tokenToAdd,
            pool.totalSupplyOfBaseToken,
            pool.totalSupplyOfToken
          );
          setBaseTokenToAdd(newBaseTokenToAdd);
          if (!onChangeRef.current) {
            onChangeRef.current = true;
            baseTokenToAddRef.current.setRawValue(
              Number(newBaseTokenToAdd) / 10 ** BASE_TOKEN_DECIMALS
            );
            onChangeRef.current = false;
          }
        }}
        tokenAddress={pool.token}
        value={tokenToAdd}
      />
      <TokenAmountInput
        label="USDC to Add"
        ref={baseTokenToAddRef}
        address={address}
        onChange={(baseTokenToAdd) => {
          setBaseTokenToAdd(baseTokenToAdd);
          if (!baseTokenToAdd) return;
          const newTokenToAdd = proportionOf(
            baseTokenToAdd,
            pool.totalSupplyOfToken,
            pool.totalSupplyOfBaseToken
          );
          setTokenToAdd(newTokenToAdd);
          if (!onChangeRef.current) {
            onChangeRef.current = true;
            tokenToAddRef.current.setRawValue(
              Number(newTokenToAdd) / 10 ** BASE_TOKEN_DECIMALS
            );
            onChangeRef.current = false;
          }
        }}
        tokenAddress={USDC.address}
        value={baseTokenToAdd}
      />
      <div className="form-check">
        <input
          type="checkbox"
          onChange={() => setDepositToSafe(!depositToSafe)}
          checked={depositToSafe}
          className="form-check-input"
        />
        <label title="" className="form-check-label">
          Deposit Directly To Safe
        </label>
      </div>

      <div className="d-grid gap-2 mt-4">
        <DepositButton
          onClick={addLiquidity}
          loading={loading}
          approveBaseToken={() => approveBaseToken()}
          approveToken={() => approveToken()}
          tokenRequiresApproval={tokenRequiresApproval}
          baseTokenRequiresApproval={baseTokenRequiresApproval}
        >
          Add Liquidity
        </DepositButton>
      </div>
    </div>
  );
}
