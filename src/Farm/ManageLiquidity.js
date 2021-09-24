import { Tab } from "bootstrap";
import { useEffect, useRef } from "react";
import classnames from "classnames";
import Harvest from "./Harvest";
import AddLiquidity from "./AddLiquidity";
import RemoveLiquidity from "./RemoveLiquidity";

export default function ManageLiquidity(props) {
  const { address, chainId, poolBalance, pool, poolId } = props;
  const tabsEl = useRef(null);

  useEffect(() => {
    if ([undefined, null, 0n].includes(poolBalance)) return;
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
      {poolBalance > 0n ? (
        <>
          <ul
            ref={tabsEl}
            className="nav nav-tabs nav-fill flex-column flex-sm-row"
          >
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
                className={classnames("nav-link", {
                  active: poolBalance === 0n,
                })}
                data-bs-target="#add-liquidity"
                aria-current="page"
                href="/"
              >
                Add Liquidity
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
              <Harvest
                address={address}
                chainId={chainId}
                pool={pool}
                poolId={poolId}
                poolBalance={poolBalance}
              />
            </div>
            <div
              className={classnames(
                "tab-pane",
                "fade",
                { active: poolBalance === 0n },
                { show: poolBalance === 0n }
              )}
              id="add-liquidity"
              role="tabpanel"
              aria-labelledby="profile-tab"
            >
              <AddLiquidity address={address} poolId={poolId} pool={pool} />
            </div>
            <div
              className="tab-pane fade"
              id="remove-liquidity"
              role="tabpanel"
              aria-labelledby="messages-tab"
            >
              <RemoveLiquidity
                poolBalance={poolBalance}
                address={address}
                poolId={poolId}
              />
            </div>
          </div>
        </>
      ) : (
        <AddLiquidity address={address} poolId={poolId} pool={pool} />
      )}
    </>
  );
}
