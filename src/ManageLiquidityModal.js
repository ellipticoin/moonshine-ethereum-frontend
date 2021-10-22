import NumberFormat from "react-number-format";
import React, { useCallback, useContext, useRef, useState } from "react";
import { formatUsdAmount, formatTokenAmount } from "./helpers";
import { proportionOf } from "./helpers";
import { BASE_TOKEN_DECIMALS, TOKENS } from "./constants";
import { MOONSHINE_AMM } from "./contracts";
import AppContext from "./AppContext";
import { ChevronRight } from "react-feather";
import { animated, useSpring } from "react-spring";

import { ethers } from "ethers";
import TokenAmountInput from "./ETHInputs/TokenAmountInput";
import Modal from "./Modal";
import Button from "./Button";

const {
  constants: { AddressZero },
} = ethers;

const Input = (props) => (
  <div className="form-floating">
    <input
      type="text"
      className="form-control"
      id="percentageToRemove"
      {...props}
    />
    <label htmlFor="floatingInputValue">Percentage to Remove</label>
  </div>
);
export default function ManageLiquidityModal(props) {
  const { address, show, setShow, liquidityTokens, tokenAddress } = props;
  const liquidityToken = liquidityTokens.find(
    (liquidityToken) => liquidityToken.tokenAddress === tokenAddress
  );
  const { apolloClient } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [percentageToRemove, setPercentageToRemove] = useState(1000000n);
  const [page, setPage] = useState(null);
  const onChangeRef = useRef(null);
  const tokenAmountRef = useRef(null);
  const baseTokenAmountRef = useRef(null);
  const [tokenAmount, setTokenAmount] = useState();
  const [baseTokenAmount, setUsdAmount] = useState();
  const [initialPrice, setInitialPrice] = useState();
  const poolExists = liquidityToken && liquidityToken.totalSupply !== 0n;
  const addLiquidity = useCallback(
    async function (e) {
      e.preventDefault();
      setLoading(true);
      try {
        const tx = await MOONSHINE_AMM.addLiquidity(tokenAmount, tokenAddress);
        await tx.wait();
      } catch (e) {
        alert(e.message);
      }
      await apolloClient.refetchQueries({
        include: ["tokens", "liquidityTokens"],
      });
      setPage(null);
      setTokenAmount(null);
      setLoading(false);
      setShow(false);
    },
    [apolloClient, setShow, tokenAmount, tokenAddress]
  );
  const removeLiquidity = useCallback(
    async function (e) {
      e.preventDefault();
      setLoading(true);
      try {
        const tx = await MOONSHINE_AMM.removeLiquidity(
          percentageToRemove,
          tokenAddress
        );
        await tx.wait();
      } catch (e) {
        alert(e.message);
      }
      await apolloClient.refetchQueries({
        include: ["tokens", "liquidityTokens"],
      });
      setPage(null);
      setTokenAmount(null);
      setLoading(false);
      setShow(false);
    },
    [apolloClient, setShow, percentageToRemove, tokenAddress]
  );
  const createPool = useCallback(
    async function (e) {
      e.preventDefault();
      setLoading(true);
      try {
        const tx = await MOONSHINE_AMM.createPool(
          tokenAmount,
          tokenAddress,
          initialPrice
        );
        await tx.wait();
      } catch (e) {
        alert(e.message);
      }
      setTokenAmount(null);
      setInitialPrice(null);
      setLoading(false);
      await apolloClient.refetchQueries({
        include: ["tokens", "liquidityTokens"],
      });
      setShow(false);
    },
    [apolloClient, setShow, tokenAmount, tokenAddress, initialPrice]
  );

  const props2 = useSpring({
    left: page ? -500 : 0,
    position: "relative",
    top: 0,
    width: 1000,
  });

  return tokenAddress !== AddressZero ? (
    <Modal show={show} setShow={setShow}>
      <div className="modal-header">
        <h5 className="modal-title">Manange Liquidity</h5>
        <Button
          loading={loading}
          type="button"
          aria-label="Close"
          className="btn-close"
          onClick={() => setShow(false)}
        />
      </div>
      <div style={{ overflow: "hidden", padding: 0 }} className="modal-body">
        {poolExists ? (
          <animated.div
            className="d-flex flex-row"
            style={{ width: 1000, ...props2 }}
          >
            <div style={{ width: "50%" }}>
              <div style={{ padding: "1rem" }}>
                <div>
                  <strong>Tokens in Pool:</strong>{" "}
                  {liquidityToken.balance &&
                    formatTokenAmount(
                      liquidityToken.totalSupply
                        ? (liquidityToken.poolSupplyOfToken *
                            liquidityToken.balance) /
                            liquidityToken.totalSupply
                        : 0n,
                      liquidityToken.tokenAddress,
                      { showSymbol: true }
                    )}
                </div>
                <div>
                  <strong>USD in Pool:</strong>{" "}
                  {liquidityToken.totalSupply &&
                    formatUsdAmount(
                      liquidityToken.balance
                        ? (liquidityToken.underlyingPoolSupplyOfUsd *
                            liquidityToken.balance) /
                            liquidityToken.totalSupply
                        : 0n
                    )}
                </div>
              </div>
            </div>
            <div style={{ width: "50%" }}>
              {page === "addLiquidity" ? (
                <div style={{ padding: "1rem" }}>
                  <TokenAmountInput
                    label="Token to Add"
                    ref={tokenAmountRef}
                    address={address}
                    onChange={(newTokenAmount) => {
                      setTokenAmount(newTokenAmount);
                      if (!newTokenAmount) return;
                      const newUsdAmount = proportionOf(
                        newTokenAmount,
                        liquidityToken.underlyingPoolSupplyOfUsd,
                        liquidityToken.poolSupplyOfToken
                      );
                      setUsdAmount(newUsdAmount);
                      if (!onChangeRef.current) {
                        onChangeRef.current = true;
                        baseTokenAmountRef.current.setRawValue(
                          Number(newUsdAmount) / 10 ** BASE_TOKEN_DECIMALS
                        );
                        onChangeRef.current = false;
                      }
                    }}
                    tokenAddress={TOKENS["CUSDC"].address}
                    value={tokenAmount}
                  />
                  <TokenAmountInput
                    label="USDC to Add"
                    ref={baseTokenAmountRef}
                    address={address}
                    onChange={(baseTokenAmount) => {
                      setUsdAmount(baseTokenAmount);
                      if (!baseTokenAmount) return;
                      const newTokenAmount = proportionOf(
                        baseTokenAmount,
                        liquidityToken.poolSupplyOfToken,
                        liquidityToken.underlyingPoolSupplyOfUsd
                      );
                      setTokenAmount(newTokenAmount);
                      if (!onChangeRef.current) {
                        onChangeRef.current = true;
                        tokenAmountRef.current.setRawValue(
                          Number(newTokenAmount) / 10 ** BASE_TOKEN_DECIMALS
                        );
                        onChangeRef.current = false;
                      }
                    }}
                    tokenAddress={TOKENS["CUSDC"].address}
                    value={baseTokenAmount}
                  />
                </div>
              ) : (
                <div style={{ padding: "1rem" }}>
                  <NumberFormat
                    customInput={Input}
                    thousandSeparator={true}
                    allowNegative={false}
                    suffix="%"
                    isAllowed={({ floatValue }) =>
                      !floatValue || floatValue <= 100
                    }
                    defaultValue="100"
                    decimalScale={2}
                    placeholder="Amount"
                    onValueChange={(values) => {
                      if (isNaN(parseFloat(values.value))) return;
                      setPercentageToRemove(
                        BigInt(
                          Math.floor((parseFloat(values.value) * 1000000) / 100)
                        )
                      );
                    }}
                  />
                </div>
              )}
            </div>
          </animated.div>
        ) : (
          <>
            <div style={{ padding: "1rem" }}>
              <TokenAmountInput
                label="Token to Add"
                ref={tokenAmountRef}
                address={address}
                onChange={(newTokenAmount) => setTokenAmount(newTokenAmount)}
                tokenAddress={TOKENS["CUSDC"].address}
                value={tokenAmount}
              />
              <TokenAmountInput
                label="Initial Price"
                ref={baseTokenAmountRef}
                address={address}
                onChange={(newInitialPrice) => {
                  setInitialPrice(newInitialPrice);
                }}
                tokenAddress={TOKENS["CUSDC"].address}
                value={baseTokenAmount}
              />
            </div>
          </>
        )}
      </div>
      <div className="modal-footer">
        {poolExists ? (
          <>
            <div>
              {page ? (
                <Button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPage(null)}
                >
                  Back
                </Button>
              ) : null}
            </div>
            <div>
              {[null, "removeLiquidity"].includes(page) ? (
                <Button
                  loading={loading}
                  type="button"
                  style={{ width: 180 }}
                  className="btn btn-danger"
                  onClick={(e) =>
                    page ? removeLiquidity(e) : setPage("removeLiquidity")
                  }
                >
                  Remove Liquidity <ChevronRight />
                </Button>
              ) : null}
              {[null, "addLiquidity"].includes(page) ? (
                <Button
                  loading={loading}
                  type="button"
                  style={{ width: 180 }}
                  className="btn btn-success"
                  onClick={(e) =>
                    page ? addLiquidity(e) : setPage("addLiquidity")
                  }
                >
                  Add Liquidity <ChevronRight />
                </Button>
              ) : null}
            </div>
          </>
        ) : (
          <Button
            loading={loading}
            type="button"
            style={{ width: 180 }}
            className="btn btn-success"
            onClick={createPool}
          >
            Create Pool <ChevronRight />
          </Button>
        )}
      </div>
    </Modal>
  ) : null;
}
