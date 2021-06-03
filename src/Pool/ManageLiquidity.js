import { Tab } from "bootstrap";
import { useEffect, useRef, useState } from "react";
import chaChing from "./chaching.wav";
import { ethers } from "ethers";
const {
  utils: { formatUnits },
} = ethers;

export default function ManageLiquidity(props) {
   const {liquidityTokenBalance} = props
  const tabsEl = useRef(null);
  const chaChingRef = useRef();
 const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(interval)
  }, [count]);

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

  const harvest = async () => {
    chaChingRef.current.currentTime = 0;
    await chaChingRef.current.play();
    setCount(0)
  }
  return (
    <>
      <h3 className="mb-4">Liquidity Tokens in Pool: {formatUnits(liquidityTokenBalance)}</h3>
      <ul ref={tabsEl} className="nav nav-pills nav-fill">
        <li className="nav-item">
          <button
            className="nav-link active"
            data-bs-target="#harvest"
            aria-current="page"
            href="/"
          >
            Harvest
            <audio ref={chaChingRef} preload="true">
              <source src={chaChing} />
            </audio>
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
      <div class="tab-content">
        <div
          class="tab-pane fade show active"
          id="harvest"
          role="tabpanel"
          aria-labelledby="home-tab"
        >
          <div className="list-group mb-3 mt-3 w-50">
            <div className="list-group-item" aria-current="true">
              <div className="d-flex w-100 justify-content-between">
                <h4 className="mt-2">Moonshine Earned: {count}</h4>
                <button onClick={(e) => {e.preventDefault(); harvest()}}className="btn btn-success btn-lg">Harvest</button>
              </div>
            </div>
          </div>
        </div>
        <div
          class="tab-pane fade"
          id="add-liquidity"
          role="tabpanel"
          aria-labelledby="profile-tab"
        >
          Add Liquidity
        </div>
        <div
          class="tab-pane fade"
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
