import TokenAmountInput from "../TokenAmountInput";
import { useState, useEffect, useMemo } from "react";
import {
  ROUTER_ADDRESS,
  BASE_TOKEN_ADDRESS,
  BASE_TOKEN_DECIMALS,
} from "../constants";
import ERC20JSON from "@openzeppelin/contracts/build/contracts/ERC20";
import RouterJSON from "../Router.json";
import { ethers, BigNumber } from "ethers";
const {
  utils: { formatUnits, parseUnits },
  constants: { WeiPerEther, MaxUint256 },
} = ethers;

export default function CreatePool(props) {
  const { address, token } = props;
  const [decimals, setDecimals] = useState();
  const [initialTokenAmount, setInitialTokenAmount] = useState();
  const [initialPrice, setInitialPrice] = useState();
  const [tokenBalance, setTokenBalance] = useState();
  const [baseTokenBalance, setBaseTokenBalance] = useState();
  const [loading, setLoading] = useState(false);
  const [tokenAllowance, setTokenAllowance] = useState(BigNumber.from(0));
  const [baseTokenAllowance, setBaseTokenAllowance] = useState(
    BigNumber.from(0)
  );

  useEffect(() => {
    async function fetchTokenData() {
      if (!token) return;
      const signer = new ethers.providers.Web3Provider(
        window.ethereum
      ).getSigner();
      const tokenContract = new ethers.Contract(
        token.value,
        ERC20JSON.abi,
        signer
      );
      const baseTokenContract = new ethers.Contract(
        BASE_TOKEN_ADDRESS,
        ERC20JSON.abi,
        signer
      );
      const decimals = await tokenContract.decimals();
      setBaseTokenBalance(
        BigInt((await baseTokenContract.balanceOf(address)).toString())
      );
      setTokenBalance(
        BigInt((await tokenContract.balanceOf(address)).toString())
      );
      setTokenAllowance(
        BigInt(
          (await tokenContract.allowance(address, ROUTER_ADDRESS)).toString()
        )
      );
      setBaseTokenAllowance(
        BigInt(
          (
            await baseTokenContract.allowance(address, ROUTER_ADDRESS)
          ).toString()
        )
      );
      setDecimals(decimals);
    }
    fetchTokenData();
  });
  const tokenRequiresApproval = useMemo(
    () => tokenAllowance < initialTokenAmount,
    [tokenAllowance, initialTokenAmount]
  );

  const initialBaseTokenAmount = useMemo(() => {
    if (!initialTokenAmount) return;
    if (!initialPrice) return;
    console.log(decimals);
    return initialTokenAmount
      .mul(initialPrice)
      .div(WeiPerEther)
      .mul(10 ** BASE_TOKEN_DECIMALS)
      .div(10 ** decimals);
  }, [initialTokenAmount, initialPrice, decimals]);

  const baseTokenRequiresApproval = useMemo(
    () => baseTokenAllowance < initialBaseTokenAmount,
    [baseTokenAllowance, initialBaseTokenAmount]
  );

  const approveBaseToken = async () => {
    setLoading(true);
    const signer = new ethers.providers.Web3Provider(
      window.ethereum
    ).getSigner();
    const baseTokenContract = new ethers.Contract(
      BASE_TOKEN_ADDRESS,
      ERC20JSON.abi,
      signer
    );
    const tx = await baseTokenContract.approve(ROUTER_ADDRESS, MaxUint256);
    await tx.wait();
    setLoading(false);
  };

  const approveToken = async () => {
    setLoading(true);
    const signer = new ethers.providers.Web3Provider(
      window.ethereum
    ).getSigner();
    const tokenContract = new ethers.Contract(
      token.value,
      ERC20JSON.abi,
      signer
    );
    const tx = await tokenContract.approve(ROUTER_ADDRESS, MaxUint256);
    await tx.wait();
    setLoading(false);
  };

  const createPool = async () => {
    setLoading(true);
    const signer = new ethers.providers.Web3Provider(
      window.ethereum
    ).getSigner();
    const routerContract = new ethers.Contract(
      ROUTER_ADDRESS,
      RouterJSON.abi,
      signer
    );
    const tx = await routerContract.createPool(
      token.value,
      parseUnits("0.003"),
      initialBaseTokenAmount,
      initialTokenAmount,
      `${token.label} Moonshine Liquidity Token`,
      `MSX${token.name}`
    );
    await tx.wait();
    setLoading(false);
  };

  return (
    <>
      <div className="row mb-2">
        <div className="col">
          <div className="form-floating mb-3">
            {tokenBalance && (
              <small
                style={{ right: "10px", top: "7px", position: "absolute" }}
                className="balance"
              >
                <strong>
                  Balance:{" "}
                  {formatUnits(
                    BigNumber.from(tokenBalance.toString()),
                    decimals
                  )}
                </strong>
              </small>
            )}
            <TokenAmountInput
              className="form-control"
              id="inputAmount"
              onChange={(initalTokenAmount) =>
                setInitialTokenAmount(initalTokenAmount)
              }
              tokenAddress={token && token.value}
              value={initialTokenAmount}
            />
            <label htmlFor="inputAmount">Initial Token Amount</label>
          </div>
        </div>
      </div>
      <div className="row mb-2">
        <div className="col">
          <div className="form-floating mb-3">
            <TokenAmountInput
              className="form-control"
              id="inputAmount"
              onChange={(initialPrice) => setInitialPrice(initialPrice)}
              value={initialPrice}
            />
            <label htmlFor="inputAmount">Initial Price</label>
          </div>
        </div>
      </div>
      <div className="list-group mb-3 transaction-details">
        <div
          className="list-group-item d-flex w-100 justify-content-between"
          aria-current="true"
        >
          <div className="d-flex">
            <img
              className="mt-1 mb-0"
              src={
                "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
              }
              style={{
                height: 30,
                width: 30,
                marginRight: "12px",
                borderRadius: "100%",
              }}
              alt={"USDc"}
            />
            <h4 className="mb-0 mt-1">USDc to Add</h4>
          </div>
          <div>
            {tokenBalance && (
              <small
                style={{ right: "10px", top: "7px", position: "absolute" }}
                className="balance"
              >
                <strong>
                  Balance:{" "}
                  {formatUnits(
                    BigNumber.from(baseTokenBalance.toString()),
                    BASE_TOKEN_DECIMALS
                  )}
                </strong>
              </small>
            )}
            <h4 className="align-bottom mt-4">
              {initialBaseTokenAmount &&
                formatUnits(initialBaseTokenAmount, BASE_TOKEN_DECIMALS)}
            </h4>
          </div>
        </div>
      </div>
      <div className="d-grid gap-2 mt-2">
        <SubmitButton
          createPool={createPool}
          loading={loading}
          approveBaseToken={() => approveBaseToken()}
          approveToken={() => approveToken()}
          tokenRequiresApproval={tokenRequiresApproval}
          baseTokenRequiresApproval={baseTokenRequiresApproval}
        />
      </div>
    </>
  );
}
function SubmitButton(props) {
  const {
    createPool,
    loading,
    tokenRequiresApproval,
    baseTokenRequiresApproval,
    approveBaseToken,
    approveToken,
  } = props;
  if (baseTokenRequiresApproval) {
    return (
      <button
        onClick={() => approveBaseToken()}
        className="btn btn-primary"
        type="button"
      >
        {loading ? (
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          "Approve Base Token"
        )}
      </button>
    );
  } else if (tokenRequiresApproval) {
    return (
      <button
        onClick={() => approveToken()}
        className="btn btn-primary"
        type="button"
      >
        {loading ? (
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          "Approve Token"
        )}
      </button>
    );
  } else {
    return (
      <button
        onClick={() => createPool()}
        className="btn btn-primary"
        type="button"
      >
        {loading ? (
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          "Create Pool"
        )}
      </button>
    );
  }
}
