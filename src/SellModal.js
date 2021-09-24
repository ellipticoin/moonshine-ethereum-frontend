import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import ExchangeCalculator from "./ExchangeCalculator";
import { BASE_FACTOR, MAX_SLIPPAGE, TOKEN_METADATA, USD } from "./constants";
import { MOONSHINE_AMM } from "./contracts";
import AppContext from "./AppContext";
import TokenAmountInput from "./ETHInputs/TokenAmountInput";
import Modal from "./Modal";

export default function SellModal(props) {
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
      usdAddress: USD.address,
    });
    if (!inputAmount || inputAmount === 0n) return;

    return exchangeRateCalculator;
  }, [usdExchangeRate, inputAmount, liquidityTokens]);
  const outputAmount = useMemo(() => {
    if (!exchangeRateCalculator) return;
    return (
      (exchangeRateCalculator.getOutputAmount(inputAmount, token, USD.address) *
        (BASE_FACTOR - MAX_SLIPPAGE)) /
      BASE_FACTOR
    );
  }, [token, exchangeRateCalculator, inputAmount]);
  const sell = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const tx = await MOONSHINE_AMM.sell(inputAmount, token, outputAmount);
        await tx.wait();
        setInputAmount(null);
        setLoading(false);
        await apolloClient.refetchQueries({
          include: ["tokens", "liquidityTokens"],
        });
        setShow(false);
      } catch (e) {
        alert(e.message);
        setLoading(false);
      }
    },
    [apolloClient, inputAmount, outputAmount, token, setShow]
  );

  return token ? (
    <Modal show={show} setShow={setShow}>
      <div className="modal-header">
        <h5 className="modal-title">Sell {TOKEN_METADATA[token].name}</h5>
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
                    label={`Amount to Sell In ${TOKEN_METADATA[token].ticker}`}
                    ref={inputAmountRef}
                    address={address}
                    onChange={(inputAmount) => setInputAmount(inputAmount)}
                    tokenAddress={USD.address}
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
          <button type="button" className="btn btn-primary" onClick={sell}>
            Sell
          </button>
        </div>
      </div>
    </Modal>
  ) : null;
}
