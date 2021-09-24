import TokenAmountInput from "../TokenAmountInput";
import TokenAmount from "../TokenAmount";
import { getContractAddress } from "../contracts";
import { useMemo, useState } from "react";
import { BASE_TOKEN_DECIMALS } from "../constants";
import { ERC20 } from "../contracts";
import ERC20JSON from "@openzeppelin/contracts/build/contracts/ERC20";
import { ethers } from "ethers";
import { useBaseTokenAddress, useRouter } from "../contracts";
import { useQueryEth } from "../ethereum.js";
import Button from "../Button";

const {
  utils: { parseUnits },
  constants: { MaxUint256 },
} = ethers;

export default function CreatePool(props) {
  const { address, token, chainId } = props;
  const [initialTokenAmount, setInitialTokenAmount] = useState(null);
  const [initialPrice, setInitialPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const baseTokenAddress = useBaseTokenAddress();
  const router = useRouter();
  const baseTokenBalance = useQueryEth(
    ERC20.attach(getContractAddress(chainId, "BaseToken")),
    async (contract) => {
      return contract.balanceOf(address);
    },
    [chainId, address]
  );
  const baseTokenAllowance = useQueryEth(
    ERC20.attach(getContractAddress(chainId, "BaseToken")),
    async (contract) => {
      return contract.allowance(address, getContractAddress(chainId, "Router"));
    },
    [chainId, address]
  );
  const tokenBalance = useQueryEth(
    ERC20.attach(token.address),
    async (contract) => {
      return contract.balanceOf(address);
    },
    [chainId, address]
  );
  const tokenAllowance = useQueryEth(
    ERC20.attach(token.address),
    async (contract) => {
      return contract.allowance(address, getContractAddress(chainId, "Router"));
    },
    [chainId, address]
  );

  const tokenRequiresApproval = useMemo(
    () => tokenAllowance < initialTokenAmount,
    [tokenAllowance, initialTokenAmount]
  );

  const initialBaseTokenAmount = useMemo(() => {
    if (!initialTokenAmount) return;
    if (!initialPrice) return;
    console.log(initialTokenAmount * initialPrice);
    console.log(
      (initialPrice * initialTokenAmount) /
        BigInt(10) ** BigInt(BASE_TOKEN_DECIMALS)
    );
    return (
      (initialTokenAmount * initialPrice) /
      BigInt(10) ** BigInt(BASE_TOKEN_DECIMALS)
    );
  }, [initialTokenAmount, initialPrice]);

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
  if (!address) {
    alert("here");
  }
  return (
    <>
      <div className="row mb-2">
        <div className="col">
          <TokenAmountInput
            label="Initial Token Amount"
            address={address}
            onChange={(initalTokenAmount) =>
              setInitialTokenAmount(initalTokenAmount)
            }
            tokenAddress={token.address}
            value={initialTokenAmount}
          />
        </div>
      </div>
      <div className="row mb-2">
        <div className="col">
          <TokenAmountInput
            label="Initial Price"
            address={address}
            onChange={(initialPrice) => setInitialPrice(initialPrice)}
            tokenAddress={token.address}
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
                  Balance: <TokenAmount>{baseTokenBalance}</TokenAmount>
                </strong>
              </small>
            )}
            <h5 className="align-bottom">
              <TokenAmount decimals={BASE_TOKEN_DECIMALS}>
                {initialBaseTokenAmount}
              </TokenAmount>
            </h5>
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
