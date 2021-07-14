import "./App.css";
import logo from "./logo.svg";
import { PROD, POLYGON_CHAIN_ID } from "./constants";
import { MSX } from "./contracts";
import {
  useEthereumAccounts,
  ethRequestAccounts,
  useMetaMaskIsConnected,
} from "./ethereum";
import Swap from "./Swap";
import Toast from "./Toast";
import Mint from "./Mint";
import UnlockMetaMask from "./UnlockMetaMask";
import Pool from "./Pool/index";
import UserAddress from "./UserAddress";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLocalStorage } from "./helpers";
import { useChainId } from "./ethereum";

function App() {
  const [tokenAdded, setTokenAdded] = useLocalStorage("tokenAdded", false);
  const ethereumAcccounts = useEthereumAccounts();
  const chainId = useChainId();
  const [transactions, setTransactions] = useState([]);
  const metamaskIsConnected = useMetaMaskIsConnected();
  const pushTransaction = (transaction) => {
    setTransactions([...transactions, transaction]);
  };
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
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Swap
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/pool">
                  Pool
                </Link>
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
        {metamaskIsConnected && tokenAdded ? (
          <UserAddress
            metamaskIsConnected={metamaskIsConnected}
            address={metamaskIsConnected && ethereumAcccounts[0]}
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
          className="toast-container position-absolute p-3 w-100"
          id="toastPlacement"
        >
          {transactions.map((transaction, i) => (
            <Toast key={i}>
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
        <div className="jumbotron vertical-center">
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
            ) : (
              <UnlockMetaMask
                tokenAdded={tokenAdded}
                setTokenAdded={setTokenAdded}
              />
            )}
          </div>
        </div>
      </div>
    </Router>
  );
}
// <nav className="navbar fixed-top navbar-expand-lg">
//   <div className="container-fluid">
//     <img alt="" style={{ width: "50px" }} src={logo} />
//
//     <button
//       className="navbar-toggler"
//       type="button"
//       data-toggle="collapse"
//       data-target="#navbarSupportedContent"
//       aria-controls="navbarSupportedContent"
//       aria-expanded="false"
//       aria-label="Toggle navigation"
//     >
//       <span className="navbar-toggler-icon"></span>
//     </button>
//     <div
//       className="collapse navbar-collapse"
//       id="navbarSupportedContent"
//     >
//       <ul className="navbar-nav mr-auto mb-2 mb-lg-0">
//         <li className="nav-item">
//           <Link className="nav-link" to="/">
//             Swap
//           </Link>
//         </li>
//         <li className="nav-item">
//           <Link className="nav-link" to="/">
//             Pool
//           </Link>
//         </li>
//         {!PROD && (
//           <li className="nav-item">
//             <Link className="nav-link" to="/">
//               Mint
//             </Link>
//           </li>
//         )}
//       </ul>
//     </div>
//   </div>
// </nav>

export default App;
