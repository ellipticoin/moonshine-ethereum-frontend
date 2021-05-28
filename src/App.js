import "./App.css";
import logo from "./logo.svg";
import { PROD } from "./constants";
import { useEthereumAccounts, ethRequestAccounts } from "./ethereum";
import Convert from "./Convert";
import Mint from "./Mint";
import Pool from "./Pool";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

function App() {
  const [, ethereumAcccounts] = useEthereumAccounts();
  const metamaskUnlocked = ethereumAcccounts && ethereumAcccounts.length > 0;
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
                  Convert
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
          <form className="d-flex">
            {metamaskUnlocked ? (
              ethereumAcccounts.map((ethereumAcccount, i) => (
                <div key={i} className="text-light">
                  Connected as: {ethereumAcccount}
                </div>
              ))
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  ethRequestAccounts();
                }}
                className="btn btn-light"
                type="submit"
              >
                Connect To MetaMask
              </button>
            )}
          </form>
        </div>
      </nav>
      <div>
        <div className="jumbotron vertical-center">
          <div className="container p-3">
            <Switch>
              <Route path="/mint">
                <Mint />
              </Route>
              <Route path="/pool">
                <Pool address={ethereumAcccounts[0]} />
              </Route>
              <Route path="/">
                <Convert address={ethereumAcccounts[0]} />
              </Route>
            </Switch>
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
