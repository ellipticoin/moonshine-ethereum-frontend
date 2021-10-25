import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import ExchangeCalculator from "./ExchangeCalculator";
import { tokenMetadata, parseError } from "./helpers.js";
import { BASE_FACTOR, MAX_SLIPPAGE, TOKENS } from "./constants";
import { MOONSHINE_AMM } from "./contracts";
import AppContext from "./AppContext";
import TokenAmountInput from "./ETHInputs/TokenAmountInput";
import Modal from "./Modal";

export default function BuyModal(props) {
  const { address, show, setShow, liquidityTokens, usdExchangeRate, token } =
    props;
  const { apolloClient } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [inputAmount, setInputAmount] = useState();
  const inputAmountRef = useRef(null);
  const exchangeRateCalculator = useMemo(() => {
    if (liquidityTokens.length === 0) return;
    let exchangeRateCalculator = new ExchangeCalculator({
      liquidityTokens,
      usdExchangeRate,
      usdAddress: TOKENS["CUSDC"].address,
    });
    if (!inputAmount || inputAmount === 0n) return;

    return exchangeRateCalculator;
  }, [usdExchangeRate, inputAmount, liquidityTokens]);
  const outputAmount = useMemo(() => {
    if (!token) return;
    if (!exchangeRateCalculator) return;
    return (
      (exchangeRateCalculator.getOutputAmount(
        inputAmount,
        TOKENS["CUSDC"].address,
        token
      ) *
        (BASE_FACTOR - MAX_SLIPPAGE)) /
      BASE_FACTOR
    );
  }, [token, exchangeRateCalculator, inputAmount]);
  const buy = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const tx = await MOONSHINE_AMM.buy(inputAmount, token, outputAmount);
        await tx.wait();
        setInputAmount(null);
        setLoading(false);
        await apolloClient.refetchQueries({
          include: ["tokens", "liquidityTokens"],
        });
        setShow(false);
      } catch (error) {
        alert(parseError(error));
        setLoading(false);
      }
    },
    [apolloClient, inputAmount, outputAmount, token, setShow]
  );

  return token ? (
    <Modal show={show} setShow={setShow}>
      <div className="modal-header">
        <h5 className="modal-title">Buy {tokenMetadata(token, "name")}</h5>
        <button
          type="button"
          aria-label="Close"
          className="btn-close"
          onClick={() => setShow(false)}
        />
      </div>
      <div className="modal-body">
        {loading ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <form className="needs-validation" noValidate>
            <div className="row g-3">
              <div className="col-sm-6">
                {show ? (
                  <TokenAmountInput
                    label="Amount to Buy In USD"
                    ref={inputAmountRef}
                    address={address}
                    onChange={(inputAmount) => setInputAmount(inputAmount)}
                    tokenAddress={TOKENS["CUSDC"].address}
                    value={inputAmount}
                  />
                ) : null}
              </div>
            </div>
          </form>
        )}
      </div>
      <div className="modal-footer">
        <div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShow(false)}
          >
            Cancel
          </button>
        </div>
        <div>
          <button type="button" className="btn btn-primary" onClick={buy}>
            Buy
          </button>
        </div>
      </div>
    </Modal>
  ) : null;
}
