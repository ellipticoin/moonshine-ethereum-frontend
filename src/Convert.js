import TokenSelect from "./TokenSelect";
import { ArrowDown } from "react-feather";
import TokenAmountInput from "./TokenAmountInput";
import RouterABI from "./abis/RouterABI.json";
import { useState, useEffect, useRef, useMemo } from "react";
import { BASE_TOKEN_DECIMALS } from "./constants";
import {
  ERC20,
  useRouter,
  useFeeSubsidyDripAddress,
  useBestPool,
} from "./contracts";
import ExchangeRateCalculator from "./ExchangeRateCalculator";
import { ethers } from "ethers";
import { useCollapse } from "./react-bootstrap.js";
import { useQueryEth, useChainId } from "./ethereum.js";
import Button from "./Button";
import { capitalize } from "lodash";

const {
  utils: { formatUnits },
  constants: { MaxUint256 },
} = ethers;

export default function Convert(props) {
  const { address, pushTransaction } = props;
  const [inputToken, setInputToken] = useState();
  const [outputToken, setOutputToken] = useState();
  const [inputAmount, setInputAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [outputAmount, setOutputAmount] = useState();
  const [action, setAction] = useState();
  const transactionDetailsEl = useRef(null);
  const inputAmountRef = useRef(null);
  const router = useRouter();
  const feeSubsidyDripAddress = useFeeSubsidyDripAddress();
  const inputPool = useBestPool(inputToken && inputToken.address);
  const outputPool = useBestPool(outputToken && outputToken.address);
  const [, chainId] = useChainId();
  const inputTokenAllowance = useQueryEth(async () => {
    if (!router || !inputToken) return;
    return ERC20.attach(inputToken.address).allowance(address, router.address);
  }, [inputToken]);
  const inputTokenRequiresApproval = useMemo(
    () => inputTokenAllowance < inputAmount,
    [inputTokenAllowance, inputAmount]
  );

  const inputDecimals = useQueryEth(
    async () => inputToken && ERC20.attach(inputToken.address).decimals(),
    [inputToken]
  );
  const outputDecimals = useQueryEth(
    async () => inputToken && ERC20.attach(inputToken.address).decimals(),
    [inputToken]
  );
  const outputBalance = useQueryEth(
    async () =>
      outputToken &&
      formatUnits(
        await ERC20.attach(outputToken.address).balanceOf(address),
        outputDecimals
      )
  );
  useEffect(() => {
    if (inputToken && outputToken && inputAmount) {
      const exchangeRateCalculator = new ExchangeRateCalculator({
        inputPool,
        outputPool,
      });
      setOutputAmount(
        formatUnits(
          exchangeRateCalculator.getOutputAmount(inputAmount.toBigInt()),
          outputDecimals
        )
      );
      setAction(exchangeRateCalculator.getAction());
    } else {
      setOutputAmount(undefined);
    }
  }, [
    inputToken,
    outputToken,
    inputAmount,
    outputDecimals,
    inputPool,
    outputPool,
  ]);

  const approveInputToken = async () => {
    if (!inputToken) return;
    try {
      setLoading(true);
      await ERC20.attach(inputToken.address).approve(
        router.address,
        MaxUint256
      );
      setLoading(false);
    } catch (err) {
      if (err.data && err.data.message) alert(err.data.message);
      setLoading(false);
    }
  };

  const convert = async () => {
    const signer = new ethers.providers.Web3Provider(
      window.ethereum
    ).getSigner();
    const routerContract = new ethers.Contract(
      router.address,
      RouterABI,
      signer
    );
    setLoading(true);
    let tx, transactionText;
    try {
      switch (action) {
        case "buy":
          tx = await routerContract.buyWithSubsity(
            outputPool.address,
            inputAmount,
            feeSubsidyDripAddress,
            { gasLimit: 3000000 }
          );
          transactionText = `Bought $${formatUnits(
            inputAmount,
            BASE_TOKEN_DECIMALS
          ).replace(/\.0+/, ".00")} worth of ${outputToken.ticker}`;
          break;
        case "sell":
          tx = await router.sellWithSubsity(
            inputPool.address,
            inputAmount,
            feeSubsidyDripAddress
          );
          transactionText = `Sold ${formatUnits(inputAmount, inputDecimals)} ${
            inputToken.ticker
          }`;
          break;
        case "convert":
          tx = await router.convertWithSubsity(
            inputPool.address,
            outputPool.address,
            inputAmount,
            feeSubsidyDripAddress
          );
          transactionText = `Converted ${formatUnits(
            inputAmount,
            inputDecimals
          )} ${inputToken.ticker} to ${outputToken.ticker}`;
          break;
        default:
          throw new Error("Unknown Action");
      }
      const { transactionHash } = await tx.wait();

      pushTransaction({
        text: transactionText,
        hash: transactionHash,
      });
      setLoading(false);
      setInputAmount(null);
      setInputToken(null);
      setOutputToken(null);
      inputAmountRef.current.setRawValue("");
    } catch (err) {
      if (err.message) alert(err.message);
      setLoading(false);
    }
  };
  useCollapse(transactionDetailsEl, outputToken !== undefined);

  return (
    <form className="d-flex  flex-column">
      <div className="row">
        <div className="col">
          <TokenSelect
            chainId={chainId}
            isOptionDisabled={(token) => token === outputToken}
            onChange={(token) => setInputToken(token)}
            size={4000}
            placeholder="Input token"
          />
        </div>
        <div className="col">
          <TokenAmountInput
            label="Input Amount"
            ref={inputAmountRef}
            address={address}
            onChange={(inputAmount) => setInputAmount(inputAmount)}
            token={inputToken}
            value={inputAmount}
          />
        </div>
      </div>
      <ArrowDown style={{ margin: "0 auto 10px" }} />
      <div className="row mb-2">
        <div className="col form-floating">
          {outputBalance && (
            <h4
              style={{
                right: "68px",
                top: "13px",
                position: "absolute",
                zIndex: 1,
              }}
              className="balance"
            >
              Balance: {outputBalance}
            </h4>
          )}
          <TokenSelect
            chainId={chainId}
            isOptionDisabled={(token) => token === inputToken}
            onChange={(token) => setOutputToken(token)}
            placeholder="Output token"
          />
        </div>
      </div>
      <div ref={transactionDetailsEl} className="list-group mb-3 collapse">
        <div className="list-group-item" aria-current="true">
          <div className="d-flex w-100 justify-content-between">
            <strong className="mb-1">Protocol Fee</strong>
            <span className="text-success">Free while in Beta</span>
          </div>
        </div>
        <div className="list-group-item" aria-current="true">
          <div className="d-flex w-100 justify-content-between">
            <strong className="mb-1">Ouput Amount</strong>
            <strong>{outputAmount}</strong>
          </div>
        </div>
      </div>
      <div className="d-grid gap-2 mt-2">
        <SubmitButton
          tokenRequiresApproval={inputTokenRequiresApproval}
          convert={convert}
          disabled={!outputAmount}
          loading={loading}
          approve={approveInputToken}
        >
          {capitalize(action || "convert")}
        </SubmitButton>
      </div>
    </form>
  );
}

function SubmitButton(props) {
  const {
    approve,
    tokenRequiresApproval,
    convert,
    children,
    loading,
    disabled,
  } = props;
  if (tokenRequiresApproval) {
    return (
      <Button onClick={() => approve()} disabled={disabled} loading={loading}>
        Approve
      </Button>
    );
  } else {
    return (
      <Button onClick={() => convert()} disabled={disabled} loading={loading}>
        {children}
      </Button>
    );
  }
}
