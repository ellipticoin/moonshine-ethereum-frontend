import TokenAmountInput from "../TokenAmountInput";
import { useState, useEffect, useMemo } from "react";
import { BASE_TOKEN_DECIMALS } from "../constants";
import { ERC20 } from "../contracts";
import ERC20JSON from "@openzeppelin/contracts/build/contracts/ERC20";
import { ethers, BigNumber } from "ethers";
import { useBaseTokenAddress, useRouter } from "../contracts";
import Button from "../Button";

const {
  utils: { formatUnits, parseUnits },
  constants: { WeiPerEther, MaxUint256 },
} = ethers;

export default function CreatePool(props) {
  const { address, token } = props;
  const [decimals, setDecimals] = useState();
  const [initialTokenAmount, setInitialTokenAmount] = useState(null);
  const [initialPrice, setInitialPrice] = useState(null);
  const [tokenBalance, setTokenBalance] = useState();
  const [baseTokenBalance, setBaseTokenBalance] = useState();
  const [loading, setLoading] = useState(false);
  const [tokenAllowance, setTokenAllowance] = useState();
  const [baseTokenAllowance, setBaseTokenAllowance] = useState();
  const baseTokenAddress = useBaseTokenAddress();
  const router = useRouter();

  useEffect(() => {
    let isCancelled = false;
    async function fetchTokenData() {
      if (!token) return;
      const signer = new ethers.providers.Web3Provider(
        window.ethereum
      ).getSigner();
      const tokenContract = new ethers.Contract(
        token.address,
        ERC20JSON.abi,
        signer
      );
      const decimals = await tokenContract.decimals();
      const baseTokenBalance = BigInt(
        (await ERC20.attach(baseTokenAddress).balanceOf(address)).toString()
      );
      const tokenBalance = BigInt(
        (await tokenContract.balanceOf(address)).toString()
      );
      const tokenAllowance = BigInt(
        (await tokenContract.allowance(address, router.address)).toString()
      );
      const baseTokenAllowance = BigInt(
        (
          await ERC20.attach(baseTokenAddress).allowance(
            address,
            router.address
          )
        ).toString()
      );
      if (!isCancelled) {
        setBaseTokenBalance(baseTokenBalance);
        setTokenBalance(tokenBalance);
        setTokenAllowance(tokenAllowance);
        setBaseTokenAllowance(baseTokenAllowance);
        setDecimals(decimals);
      }
    }
    fetchTokenData();
    return () => {
      isCancelled = true;
    };
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
    const tx = await ERC20.attach(baseTokenAddress).approve(
      router.address,
      MaxUint256
    );
    await tx.wait();
    setLoading(false);
  };

  const approveToken = async () => {
    setLoading(true);
    const signer = new ethers.providers.Web3Provider(
      window.ethereum
    ).getSigner();
    const tokenContract = new ethers.Contract(token, ERC20JSON.abi, signer);
    const tx = await tokenContract.approve(router.address, MaxUint256);
    await tx.wait();
    setLoading(false);
  };

  const createPool = async () => {
    setLoading(true);
    const tx = await router.createPool(
      token,
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
          <TokenAmountInput
            label="Initial Token Amount"
            onChange={(initalTokenAmount) =>
              setInitialTokenAmount(initalTokenAmount)
            }
            tokenAddress={token}
            address={address}
            value={initialTokenAmount}
          />
        </div>
      </div>
      <div className="row mb-2">
        <div className="col">
          <TokenAmountInput
            label="Initial Price"
            onChange={(initialPrice) => setInitialPrice(initialPrice)}
            value={initialPrice}
          />
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
      <Button
        onClick={() => createPool()}
        className="btn btn-primary"
        type="button"
        loading={loading}
      >
        Create Pool
      </Button>
    );
  }
}
