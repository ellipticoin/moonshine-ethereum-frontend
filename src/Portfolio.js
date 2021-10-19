import { useState } from "react";
import {
  useGetBlockchainState,
  useGetLiquidityTokens,
  useGetTokens,
} from "./queries";
import { BASE_FACTOR, TOKENS } from "./constants";
import { formatBigInt, value, tokenMetadata } from "./helpers";
import BuyModal from "./BuyModal";
import SellModal from "./SellModal";
import ManageLiquidityModal from "./ManageLiquidityModal";

export default function MoonshineBalances(props) {
  const { address } = props;
  const { data: { liquidityTokens } = { liquidityTokens: TOKENS } } =
    useGetLiquidityTokens(address);
  const { usdExchangeRate } = useGetBlockchainState();
  const [hideZeroBalances, setHideZeroBalances] = useState(false);
  const [hideZeroLiquidityBalances, setHideZeroLiquidityBalances] =
    useState(false);
  const [activeToken, setActiveToken] = useState();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showManageLiquidityModal, setShowManageLiquidityModal] =
    useState(false);
  const { data: { tokens } = { tokens: TOKENS } } = useGetTokens(address);
  const tokenBalance = tokens.reduce((sum, token) => {
    const price =
      token.address === TOKENS["CUSDC"].address ? BASE_FACTOR : token.price;
    let total = (token.balance * price) / BASE_FACTOR;
    return sum + total;
  }, 0n);

  const totalLiquidityBalance = liquidityTokens.reduce(
    (sum, liquidityToken) => {
      if (liquidityToken.balance === 0n) return sum;
      let total =
        ((liquidityToken.underlyingPoolSupplyOfUsd * liquidityToken.balance) /
          liquidityToken.totalSupply) *
        2n;

      return sum + total;
    },
    0n
  );

  const portfolioBalance = tokenBalance + totalLiquidityBalance;

  return (
    <>
      <div className="d-flex flex-column">
        <header>
          <h1>Your Portfolio</h1>
          <h1>
            Net Worth:{" "}
            {value(portfolioBalance, "CUSDC", {
              showCurrency: true,
            })}
          </h1>
        </header>
        <h2 className="d-flex justify-content-between">
          Tokens
          <div class="form-check mt-2">
            <label
              class="form-check-label"
              for="hideZeroBalances"
              style={{ fontSize: "12px", marginBottom: "0" }}
            >
              Hide Zero Balances
            </label>
            <input
              type="checkbox"
              checked={hideZeroBalances}
              onChange={() => setHideZeroBalances(!hideZeroBalances)}
              class="form-check-input"
              id="hideZeroBalances"
            />
          </div>
        </h2>
        <div className="table-wrapper">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th scope="col" className="text-center">
                  Name
                </th>
                <th scope="col" className="text-end">
                  Number of Tokens
                </th>
                <th scope="col" className="text-end">
                  Price
                </th>
                <th scope="col" className="text-center" width="200px">
                  Actions
                </th>
                <th scope="col" className="text-end" width="200px">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {tokens
                .filter((token) => token.balance !== 0n || !hideZeroBalances)
                .map((token) => (
                  <tr key={token.address}>
                    <th scope="row">
                      <img
                        alt={tokenMetadata(token.address, "name")}
                        style={{
                          width: 20,
                          borderRadius: "100%",
                          marginRight: "10px",
                        }}
                        src={tokenMetadata(token.address, "logoURI")}
                      />
                      {tokenMetadata(token.address, "name")}
                    </th>
                    <td className="text-end">{formatBigInt(token.balance)}</td>
                    <td className="text-end">
                      {value(token.price, "CUSDC", {
                        showCurrency: true,
                        decimals: 2,
                      })}
                    </td>
                    {token.address === TOKENS["CUSDC"].address ? (
                      <td></td>
                    ) : (
                      <td className="d-flex justify-content-between flex-row">
                        <>
                          <button
                            className="btn btn-primary btn-sm btn-block w-100"
                            style={{ margin: "0 2px" }}
                            onClick={() => {
                              setActiveToken(token.address);
                              setShowBuyModal(true);
                            }}
                          >
                            Buy
                          </button>
                          <button
                            className="btn btn-primary btn-sm btn-block w-100"
                            style={{ margin: "0 2px" }}
                            onClick={() => {
                              setActiveToken(token.address);
                              setShowSellModal(true);
                            }}
                          >
                            Sell
                          </button>
                        </>
                      </td>
                    )}
                    <td className="text-end">
                      {value(
                        (token.balance * token.price) / BASE_FACTOR,
                        "CUSDC",
                        { showCurrency: true }
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <strong className="align-self-end" style={{ marginRight: 10 }}>
          Total Token Balances:{" "}
          {value(tokenBalance, "CUSDC", { showCurrency: true })}
        </strong>
        <h2 className="d-flex justify-content-between">
          Your Liquidity
          <div class="form-check mt-2">
            <label
              class="form-check-label"
              for="hideZeroLiquidityBalances"
              style={{ fontSize: "12px", marginBottom: "0" }}
            >
              Hide Zero Balances
            </label>
            <input
              type="checkbox"
              checked={hideZeroLiquidityBalances}
              onChange={() =>
                setHideZeroLiquidityBalances(!hideZeroLiquidityBalances)
              }
              class="form-check-input"
              id="hideZeroLiquidityBalances"
            />
          </div>
        </h2>
        <div className="table-wrapper">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th scope="col" className="text-center">
                  Name
                </th>
                <th scope="col" className="text-end">
                  Tokens in Pool
                </th>
                <th scope="col" className="text-center" width="200px">
                  Actions
                </th>
                <th scope="col" className="text-end" width="200px">
                  Total Value in Pool
                </th>
              </tr>
            </thead>
            <tbody>
              {liquidityTokens
                .filter(
                  (liquidityToken) =>
                    liquidityToken.balance !== 0n || !hideZeroLiquidityBalances
                )
                .map((liquidityToken) => (
                  <tr key={liquidityToken.tokenAddress}>
                    <th scope="row">
                      <img
                        alt={tokenMetadata(liquidityToken.tokenAddress, "name")}
                        style={{
                          width: 20,
                          borderRadius: "100%",
                          marginRight: "10px",
                        }}
                        src={tokenMetadata(
                          liquidityToken.tokenAddress,
                          "logoURI"
                        )}
                      />
                      {tokenMetadata(liquidityToken.tokenAddress, "name")}
                    </th>
                    <td className="text-end">
                      <div>
                        {liquidityToken.balance &&
                          value(
                            liquidityToken.totalSupply
                              ? (liquidityToken.poolSupplyOfToken *
                                  liquidityToken.balance) /
                                  liquidityToken.totalSupply
                              : 0n,
                            tokenMetadata(
                              liquidityToken.tokenAddress,
                              "symbol"
                            ),
                            { showCurrency: true }
                          )}
                      </div>
                      <div>
                        {liquidityToken.totalSupply &&
                          value(
                            liquidityToken.balance
                              ? (liquidityToken.underlyingPoolSupplyOfUsd *
                                  liquidityToken.balance) /
                                  liquidityToken.totalSupply
                              : 0n,
                            "CUSDC",
                            { showCurrency: true }
                          )}
                      </div>
                    </td>
                    {liquidityToken.tokenAddress === TOKENS["CUSDC"].address ? (
                      <td></td>
                    ) : (
                      <td
                        className="d-flex justify-content-center flex-sm-column flex-md-row align-middle"
                        style={{ verticalAlign: "middle" }}
                      >
                        <button
                          className="btn btn-primary btn-sm btn-block"
                          style={{ margin: "10px 2px" }}
                          onClick={() => {
                            setActiveToken(liquidityToken.tokenAddress);
                            setShowManageLiquidityModal(true);
                          }}
                        >
                          {liquidityToken.totalSupply === 0n
                            ? "Create Pool"
                            : "Manage Liquidity"}
                        </button>
                      </td>
                    )}
                    <td className="text-end">
                      {value(
                        liquidityToken.underlyingPoolSupplyOfUsd
                          ? Number(
                              (liquidityToken.underlyingPoolSupplyOfUsd *
                                liquidityToken.balance *
                                2n) /
                                liquidityToken.totalSupply
                            )
                          : 0n,
                        "CUSDC",
                        { showCurrency: true }
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <strong className="align-self-end" style={{ marginRight: 10 }}>
          Total Liquidity Balance:{" "}
          {value(totalLiquidityBalance, "CUSDC", {
            showCurrency: true,
          })}
        </strong>
      </div>
      <BuyModal
        usdExchangeRate={usdExchangeRate}
        liquidityTokens={liquidityTokens}
        setShow={setShowBuyModal}
        show={showBuyModal}
        address={address}
        token={activeToken}
      />
      <SellModal
        usdExchangeRate={usdExchangeRate}
        liquidityTokens={liquidityTokens}
        setShow={setShowSellModal}
        show={showSellModal}
        address={address}
        token={activeToken}
      />
      <ManageLiquidityModal
        usdExchangeRate={usdExchangeRate}
        liquidityTokens={liquidityTokens}
        setShow={setShowManageLiquidityModal}
        show={showManageLiquidityModal}
        address={address}
        tokenAddress={activeToken}
      />
    </>
  );
}
