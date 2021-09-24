import "./App.css";
import { POLYGON_CHAIN_ID, MOONSHINE_CHAIN_ID } from "./constants";
import { MSX } from "./contracts";
import Portfolio from "./Portfolio";
import Toast from "./Toast";
import Bridge from "./Bridge";
import InstallMetaMask from "./InstallMetaMask";
import UnsupportedChain from "./UnsupportedChain";
import Farm from "./Farm/index";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import { useEffect } from "react";
import NavBar from "./NavBar";
import { useLocalStorage } from "./helpers";
import { useChainId } from "./ethereum";

function App(props) {
  const { address } = props;
  const [tokenAdded, setTokenAdded] = useLocalStorage("tokenAdded", false);
  const chainId = useChainId();
  const transactions = [];
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
    <>
      <Router>
        <NavBar chainId={chainId} address={address} />
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
            <div className="container">
              {window.ethereum ? (
                [MOONSHINE_CHAIN_ID, POLYGON_CHAIN_ID].includes(chainId) ? (
                  <Switch>
                    <Route path="/bridge">
                      <Bridge address={address} chainId={chainId} />
                    </Route>
                    <Route path="/farm">
                      <Farm {...props} />
                    </Route>
                    <Route path="/">
                      <Portfolio address={address} chainId={chainId} />
                    </Route>
                  </Switch>
                ) : (
                  <UnsupportedChain />
                )
              ) : (
                <InstallMetaMask />
              )}
            </div>
          </div>
        </div>
      </Router>
    </>
  );
}

export default App;
