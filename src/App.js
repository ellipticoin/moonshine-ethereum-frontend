import "./App.css";
import logo from "./logo.svg";
import { switchToPolygon } from "./ethereum";
import { PROD, POLYGON_CHAIN_ID, ETHEREUM_CHAIN_ID } from "./constants";
import classNames from "classnames";
import { MSX } from "./contracts";
import { useRef } from "react";
import {
  switchChain,
  useEthereumAccounts,
  ethRequestAccounts,
  useMetaMaskIsConnected,
} from "./ethereum";
import Swap from "./Swap";
import Toast from "./Toast";
import Mint from "./Mint";
import Deposit from "./Deposit";
import UnlockMetaMask from "./UnlockMetaMask";
import InstallMetaMask from "./InstallMetaMask";
import Pool from "./Pool/index";
import UserAddress from "./UserAddress";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCollapse } from "./react-bootstrap.js";
import { useLocalStorage } from "./helpers";
import { useChainId } from "./ethereum";

function App() {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [tokenAdded, setTokenAdded] = useLocalStorage("tokenAdded", false);
  const ethereumAcccounts = useEthereumAccounts();
  const chainId = useChainId();
  const [transactions, setTransactions] = useState([]);
  const metamaskIsConnected = useMetaMaskIsConnected();
  const pushTransaction = (transaction) => {
    setTransactions([...transactions, transaction]);
  };
  const menuEl = useRef(null);
  useCollapse(menuEl, menuIsOpen);
  useEffect(() => {
    async function addToken() {
      try {
        if (!tokenAdded) {
          await new Promise((r) => setTimeout(r, 2000));
          await window.ethereum.request({
            method: "wallet_watchAsset",
            params: {
              type: "ERC20",
              options: {
                address: MSX.address,
                symbol: "MSX",
                decimals: 6,
                image:
                  "https://polygon.moonshine.exchange/static/media/logo.d5a83f30.svg",
              },
            },
          });
          setTokenAdded(true);
        }
      } catch (e) {
        console.log(e);
      }
    }

    if (chainId === POLYGON_CHAIN_ID && !tokenAdded) {
      addToken();
    }
  }, [chainId, tokenAdded, setTokenAdded]);

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            <img alt="" style={{ width: "50px" }} src={logo} />
          </a>
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setMenuIsOpen(!menuIsOpen)}
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            ref={menuEl}
            className={classNames([
              "collapse",
              "navbar-collapse",
              { menuIsOpen: "show" },
            ])}
            id="navbarNav"
          >
            <ul className="navbar-nav">
             {chainId === POLYGON_CHAIN_ID ? (
              <><li className="nav-item">
                <Link className="nav-link" to="/">
                  Swap
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/pool">
                  Pool
                </Link>
              </li></>): 
              <li className="nav-item">
                <button className="nav-link">
                  Bridge
                </button>
              </li>
 }
              <li className="nav-item d-block d-sm-none">
                {chainId === POLYGON_CHAIN_ID ? (
                  <button
                    onClick={() => switchChain(ETHEREUM_CHAIN_ID)}
                    className="nav-link"
                  >
                    Switch To Ethereum
                  </button>
                ) : (
                  <button
                    onClick={() => switchToPolygon(ethereumAcccounts[0])}
                    className="nav-link"
                  >
                    Switch To Polygon
                  </button>
                )}
              </li>
              {!PROD && (
                <li className="nav-item">
                  <Link className="nav-link" to="/mint">
                    Mint
                  </Link>
                </li>
              )}
              <li className="nav-item"></li>
            </ul>
          </div>
        </div>
        {ethereumAcccounts && ethereumAcccounts[0] ? (
          <UserAddress
            metamaskIsConnected={metamaskIsConnected}
            address={ethereumAcccounts[0]}
            chainId={chainId}
            ethRequestAccounts={ethRequestAccounts}
          />
        ) : null}
      </nav>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="bg-dark position-relative bd-example-toasts"
      >
        <div
          className="toast-container d-none d-lg-block position-absolute p-3 w-100"
          id="toastPlacement"
        >
          {transactions.map((transaction, i) => (
            <Toast className="d-none d-lg-block" key={i}>
              <div>{transaction.text}</div>
              <div>
                <a
                  href={`https://rinkeby-arb-explorer.netlify.app/tx/${transaction.hash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Transaction
                </a>
              </div>
            </Toast>
          ))}
        </div>
      </div>
      <div>
        <div className="jumbotron">
          <div className="container p-3">
            {metamaskIsConnected === null && !tokenAdded ? (
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ height: "236px" }}
              >
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : metamaskIsConnected ? (
              <Switch>
                <Route path="/mint">
                  <Mint address={ethereumAcccounts[0]} chainId={chainId} />
                </Route>
                <Route path="/pool">
                  <Pool address={ethereumAcccounts[0]} chainId={chainId} />
                </Route>
                <Route path="/">
                  <Swap
                    address={ethereumAcccounts[0]}
                    pushTransaction={pushTransaction}
                  />
                </Route>
              </Switch>
            ) : window.ethereum ? (
              chainId === ETHEREUM_CHAIN_ID && ethereumAcccounts[0] ? (
                <Deposit address={ethereumAcccounts[0]} />
              ) : (
                <UnlockMetaMask />
              )
            ) : (
              <InstallMetaMask />
            )}
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
