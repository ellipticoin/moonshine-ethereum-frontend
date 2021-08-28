import TokenSelect from "./TokenSelect";
import { usePrevious } from "./helpers";
import { ArrowDown } from "react-feather";
import TokenAmountInput from "./TokenAmountInput";
import TokenAmount from "./TokenAmount";
import { useState, useEffect, useRef, useMemo } from "react";
import { ERC20 } from "./contracts";
import {
  fetchOutputAmount,
  executeQuickswapSwap,
  QUICKSWAP_ROUTER,
} from "./quickswap";
import { ethers } from "ethers";
import { useCollapse } from "./react-bootstrap.js";
import { useQueryEth, useChainId } from "./ethereum.js";
import Button from "./Button";
import { TOKENS } from "./constants";
import { capitalize } from "lodash";

const {
  utils: { formatUnits, id, hexZeroPad },
  constants: { MaxUint256, AddressZero },
} = ethers;

export default function Swap(props) {
  const { address, pushTransaction } = props;
  const [inputToken, setInputToken] = useState({ address: TOKENS[0].address });
  const [outputToken, setOutputToken] = useState({
    address: TOKENS[1].address,
  });
  const previousInputToken = usePrevious(inputToken);
  const previousOutputToken = usePrevious(outputToken);
  const [inputAmount, setInputAmount] = useState();
  const [loading, setLoading] = useState(false);
  const [outputAmount, setOutputAmount] = useState();
  const [action, setAction] = useState();
  const transactionDetailsEl = useRef(null);
  const inputAmountRef = useRef(null);
  const chainId = useChainId();
  const inputTokenAllowance = useQueryEth(
    ERC20.attach(inputToken.address || AddressZero),
    async (contract) => {
      return contract.allowance(address, QUICKSWAP_ROUTER.address);
    },
    [address],
    [id("Approval(address,address,uint256)"), hexZeroPad(address, 32), null]
  );
  const inputTokenRequiresApproval = useMemo(
    () => inputTokenAllowance < inputAmount,
    [inputTokenAllowance, inputAmount]
  );

  const inputDecimals = useQueryEth(
    ERC20.attach(inputToken.address),
    async (contract) => contract.decimals(),
    [inputToken]
  );
  const outputDecimals = useQueryEth(
    ERC20.attach(outputToken.address),
    async (contract) => contract.decimals(),
    [outputToken]
  );
  const outputBalance = useQueryEth(
    ERC20.attach(outputToken.address),
    async (contract) => contract.balanceOf(address),
    [outputToken.address, address]
  );

  const approveInputToken = async () => {
    if (!inputToken) return;
    try {
      setLoading(true);
      await ERC20.attach(inputToken.address).approve(
        QUICKSWAP_ROUTER.address,
        MaxUint256
      );
      setLoading(false);
    } catch (err) {
      if (err.data && err.data.message) alert(err.data.message);
      if (err) console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    (async function () {
      setOutputAmount(
        await fetchOutputAmount(
          inputToken.address,
          outputToken.address,
          Number(inputAmount)
        )
      );
    })();
  }, [inputToken.address, outputToken.address, inputAmount]);

  const swap = async () => {
    setLoading(true);
    const tx = await executeQuickswapSwap(
      inputToken.address,
      outputToken.address,
      inputAmount,
      outputAmount
    );
    const { transactionHash } = await tx.wait();
    const transactionText = `Swapped ${formatUnits(
      inputAmount,
      inputDecimals
    )} ${inputToken.ticker} for ${outputToken.ticker}`;
    setLoading(false);
    pushTransaction({
      text: transactionText,
      hash: transactionHash,
    });
    setLoading(false);
    setInputAmount(null);
    setAction(null);
    setInputToken({ address: AddressZero });
    setOutputToken({ address: AddressZero });
    inputAmountRef.current.setRawValue("");
  };
  useCollapse(transactionDetailsEl, outputToken !== undefined);
  useEffect(() => {
    if (
      !previousOutputToken ||
      !previousInputToken ||
      (outputToken.address === AddressZero &&
        inputToken.address === AddressZero)
    )
      return;
    if (outputToken.address === inputToken.address) {
      if (previousOutputToken.address === outputToken.address) {
        setOutputToken(previousInputToken);
      } else {
        setInputToken(previousOutputToken);
      }
    }
  }, [
    previousOutputToken,
    previousInputToken,
    outputToken.address,
    inputToken.address,
  ]);

  return (
    <form className="d-flex  flex-column">
      <div className="row">
        <div className="col-sm-12 col-lg-6">
          <TokenSelect
            chainId={chainId}
            onChange={(token) => setInputToken(token)}
            size={4000}
            value={inputToken.address}
            placeholder="Input token"
          />
        </div>
        <div className="col-sm-12 col-lg-6">
          <TokenAmountInput
            label="Input Amount"
            ref={inputAmountRef}
            address={address}
            onChange={(inputAmount) => setInputAmount(inputAmount)}
            tokenAddress={inputToken.address}
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
              <TokenAmount decimals={outputDecimals}>
                {outputBalance}
              </TokenAmount>
            </h4>
          )}
          <TokenSelect
            chainId={chainId}
            onChange={(token) => setOutputToken(token)}
            value={outputToken.address}
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
            <strong>
              {outputAmount && formatUnits(outputAmount, outputDecimals)}
            </strong>
          </div>
        </div>
      </div>
      <div className="d-grid gap-2 mt-2">
        <SubmitButton
          tokenRequiresApproval={inputTokenRequiresApproval}
          swap={swap}
          disabled={!outputAmount}
          loading={loading}
          approve={approveInputToken}
        >
          {capitalize(action || "swap")}
        </SubmitButton>
      </div>
    </form>
  );
}

function SubmitButton(props) {
  const { approve, tokenRequiresApproval, swap, children, loading, disabled } =
    props;
  if (tokenRequiresApproval) {
    return (
      <Button onClick={() => approve()} disabled={disabled} loading={loading}>
        Approve
      </Button>
    );
  } else {
    return (
      <Button onClick={() => swap()} disabled={disabled} loading={loading}>
        {children}
      </Button>
    );
  }
}
