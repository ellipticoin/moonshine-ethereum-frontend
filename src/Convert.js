import TokenSelect from "./TokenSelect";
import { ArrowDown } from "react-feather";
import TokenAmountInput from "./TokenAmountInput";
import { useState, useEffect, useRef } from "react";
import { BASE_TOKEN_ADDRESS, ROUTER_ADDRESS } from "./constants";
import ExchangeRateCalculator from "./ExchangeRateCalculator";
import { usePools } from "./helpers";
import RouterJSON from "./Router.json";
import ERC20JSON from "@openzeppelin/contracts/build/contracts/ERC20";
import { ethers } from "ethers";
import {Collapse} from "bootstrap"
const {
  utils: { formatUnits },
} = ethers;
export default function Convert(props) {
  const { address } = props;
  const [inputToken, setInputToken] = useState();
  const [outputToken, setOutputToken] = useState();
  const [inputAmount, setInputAmount] = useState(null);
  const [inputBalance, setInputBalance] = useState();
  const [outputBalance, setOutputBalance] = useState();
  const [outputDecimals, setOutputDecimals] = useState();
  const [loading, setLoading] = useState(false);
  const [outputAmount, setOutputAmount] = useState();
  const pools = usePools();
  const transactionDetailsEl = useRef(null)
  const inputAmountRef = useRef(null);
  // const inputPool = usePool(inputToken && inputToken.value);
  // const outputPool = usePool(outputToken && outputToken.value);
  // console.log(inputPool)
  // const inputPool = usePool(inputToken);
  // const outputPool = usePool(outputToken);
  //   console.log(inputPool);

  // const exchangeRateCalculator = useExchangeRateCalculator(inputTokenAddress, outputTokenAddress);

  useEffect(() => {
    let outputDecimals;

    async function fetchTokenData() {
      if (inputToken) {
        const signer = new ethers.providers.Web3Provider(
          window.ethereum
        ).getSigner();
        const inputTokenContract = new ethers.Contract(
          inputToken.value,
          ERC20JSON.abi,
          signer
        );
        const inputDecimals = await inputTokenContract.decimals();
        setInputBalance(
          formatUnits(
            await inputTokenContract.balanceOf(address),
            inputDecimals
          )
        );
      }
      if (outputToken) {
        const signer = new ethers.providers.Web3Provider(
          window.ethereum
        ).getSigner();
        const outputTokenContract = new ethers.Contract(
          outputToken.value,
          ERC20JSON.abi,
          signer
        );
        outputDecimals = await outputTokenContract.decimals();
        setOutputDecimals(outputDecimals);
        setOutputBalance(
          formatUnits(
            await outputTokenContract.balanceOf(address),
            outputDecimals
          )
        );
      }
    }
    fetchTokenData();
  });
  useEffect(() => {
    if (inputToken && outputToken && inputAmount) {
      const exchangeRateCalculator = new ExchangeRateCalculator({
        baseToken: BASE_TOKEN_ADDRESS,
        pools,
        inputToken: inputToken.value,
        outputToken: outputToken.value,
      });
      setOutputAmount(
        formatUnits(
          exchangeRateCalculator.getOutputAmount(inputAmount),
          outputDecimals
        )
      );
    } else {
      setOutputAmount(undefined);
    }
  }, [inputToken, outputToken, inputAmount, outputDecimals, pools]);

  const convert = async () => {
    setLoading(true);
    const signer = new ethers.providers.Web3Provider(
      window.ethereum
    ).getSigner();
    const routerContract = new ethers.Contract(
      ROUTER_ADDRESS,
      RouterJSON.abi,
      signer
    );
    const tx = await routerContract.buy(
      await routerContract.pools(0),
      inputAmount
    );
    await tx.wait();
    setLoading(false);
    setInputAmount(null);
    setInputToken(null)
    setOutputToken(null)
  };

  // const outputAmount = inputAmount && exchangeRateCalculator && exchangeRateCalculator.getOutputAmount(inputAmount)

    useEffect(() => {
        var myCollapse = transactionDetailsEl.current
        var bsCollapse = new Collapse(myCollapse, {toggle: false})
        outputAmount ? bsCollapse.show() : bsCollapse.hide()
    }, [outputAmount])
    
  return (
    <form className="d-flex  flex-column">
      <div className="row">
        <div className="col">
          <TokenSelect
            value={inputToken}
            pools={pools}
            onChange={(token) => setInputToken(token)}
            size={4000}
            placeholder="Input token"
          />
        </div>
        <div className="col">
          <div className="form-floating mb-3">
            {inputBalance && (
              <small
                style={{ right: "10px", top: "7px", position: "absolute" }}
                className="balance"
              >
                <strong>Balance: {inputBalance}</strong>
              </small>
            )}
            <TokenAmountInput
              className="form-control"
              id="inputAmount"
              ref={inputAmountRef}
              onChange={(inputAmount) => setInputAmount(inputAmount)}
              tokenAddress={inputToken && inputToken.value}
              value={inputAmount}
            />
            <label htmlFor="inputAmount">Input Amount</label>
          </div>
        </div>
      </div>
      <ArrowDown style={{ margin: "0 auto 10px" }} />
      <div className="row mb-2">
        <div className="col form-floating">
          {outputBalance &&<h4
            style={{
              right: "68px",
              top: "13px",
              position: "absolute",
              zIndex: 1,
            }}
            className="balance"
          >
            Balance: {outputBalance}
          </h4>}
          <TokenSelect
            value={outputToken}
            pools={pools}
            onChange={(token) => setOutputToken(token)}
            size={4000}
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
        <button
          onClick={() => convert()}
          className="btn btn-primary"
          type="button"
        >
          {loading ? (
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            "Convert"
          )}
        </button>
      </div>
    </form>
  );
}
