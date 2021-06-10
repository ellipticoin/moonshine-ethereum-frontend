import { Tab } from "bootstrap";
import { useEffect, useRef } from "react";
import { ethers } from "ethers";
import PendingYield from "./PendingYield";
const {
  utils: { formatUnits },
} = ethers;

export default function ManageLiquidity(props) {
  const { address, liquidityTokenBalance, pool } = props;
  const tabsEl = useRef(null);

  useEffect(() => {
    var triggerTabList = [].slice.call(
      tabsEl.current.querySelectorAll("button")
    );
    triggerTabList.forEach(function (triggerEl) {
      var tabTrigger = new Tab(triggerEl);

      triggerEl.addEventListener("click", function (event) {
        event.preventDefault();
        tabTrigger.show();
      });
    });
  });

  return (
    <>
      <h3 className="mb-4">
        Liquidity Tokens in Pool: {formatUnits(liquidityTokenBalance)}
      </h3>
      <ul ref={tabsEl} className="nav nav-pills nav-fill">
        <li className="nav-item">
          <button
            className="nav-link active"
            data-bs-target="#harvest"
            aria-current="page"
            href="/"
          >
            Harvest
          </button>
        </li>
        <li className="nav-item">
          <button
            className="nav-link"
            data-bs-target="#add-liquidity"
            aria-current="page"
            href="/"
          >
            Add Liqudity
          </button>
        </li>
        <li className="nav-item">
          <button
            className="nav-link"
            data-bs-target="#remove-liquidity"
            href="/"
          >
            Remove Liquidity
          </button>
        </li>
      </ul>
      <div className="tab-content">
        <div
          className="tab-pane fade show active"
          id="harvest"
          role="tabpanel"
          aria-labelledby="home-tab"
        >
          <PendingYield address={address} pool={pool} />
        </div>
        <div
          className="tab-pane fade"
          id="add-liquidity"
          role="tabpanel"
          aria-labelledby="profile-tab"
        >
          Add Liquidity
        </div>
        <div
          className="tab-pane fade"
          id="remove-liquidity"
          role="tabpanel"
          aria-labelledby="messages-tab"
        >
          Remove Liquidity
        </div>
      </div>
    </>
  );
}
