import logo from "./logo.svg";
import classNames from "classnames";
import ChainSwitcher from "./ChainSwitcher";
import { animated, useSpring } from "react-spring";
import UserAddress from "./UserAddress";
import {
  ETHEREUM_CHAIN_ID,
  MOONSHINE_CHAIN_ID,
  POLYGON_CHAIN_ID,
} from "./constants";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useCollapse } from "./react-bootstrap.js";
import { ChevronUp } from "react-feather";
import { useLocation } from "react-router-dom";

export default function NavBar(props) {
  const { address, chainId } = props;
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const menuEl = useCollapse(menuIsOpen);
  return (
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
          {[MOONSHINE_CHAIN_ID, POLYGON_CHAIN_ID].includes(chainId) ? (
            <Chevron />
          ) : null}
          <ul className="navbar-nav">
            <NavItems address={address} chainId={chainId} />
          </ul>
        </div>
      </div>
      {address ? <UserAddress address={address} chainId={chainId} /> : null}
    </nav>
  );
}

export function Chevron() {
  const { pathname } = useLocation();
  const left =
    {
      bridge: 180
      // bridge: 243,
      // farm: 180,
    }[pathname.slice(1)] || 104;
  const styles = useSpring({ left, position: "absolute", top: 50 });
  return (
    <animated.div style={styles}>
      <ChevronUp color="white" />
    </animated.div>
  );
}
export function NavItems(props) {
  const { chainId } = props;

  return [MOONSHINE_CHAIN_ID, POLYGON_CHAIN_ID, ETHEREUM_CHAIN_ID].includes(
    chainId
  ) ? (
    <>
      <li className="nav-item">
        <Link className="nav-link" to="/">
          Portfolio
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/bridge">
          Bridge
        </Link>
      </li>

      <ChainSwitcher className="nav-item d-lg-none" chainId={chainId} />
      <li className="nav-item"></li>
    </>
  ) : null;
}
