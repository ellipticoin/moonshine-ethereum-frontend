import {
  CHAIN_INFO,
  ETHEREUM_CHAIN_ID,
  MOONSHINE_CHAIN_ID,
  POLYGON_CHAIN_ID,
} from "./constants";
import { switchChain } from "./ethereum";
import { useMemo } from "react";
export default function ChainSwitcher(props) {
  const { chainId, className, buttonStyle } = props;
  const otherChainIds = useMemo(
    () =>
      ({
        [POLYGON_CHAIN_ID]: [ETHEREUM_CHAIN_ID, MOONSHINE_CHAIN_ID],
        [ETHEREUM_CHAIN_ID]: [POLYGON_CHAIN_ID, MOONSHINE_CHAIN_ID],
        [MOONSHINE_CHAIN_ID]: [ETHEREUM_CHAIN_ID, POLYGON_CHAIN_ID],
      }[chainId] || [POLYGON_CHAIN_ID, MOONSHINE_CHAIN_ID]),
    [chainId]
  );
  return otherChainIds.length ? (
    <>
      {otherChainIds.map((chainId) => (
        <li key={chainId} className={className}>
          <button
            className="nav-link"
            style={buttonStyle || {}}
            onClick={() => switchChain(chainId)}
          >
            Switch To {CHAIN_INFO[chainId].name}
          </button>
        </li>
      ))}
    </>
  ) : null;
}
// (
//   <li key={chainId} className="nav-item">
//       <button
//         className="nav-link"
//         onClick={() => switchChain(chainId)}
//       >
//         Switch To {CHAIN_INFO[chainId].name}
//       </button>
//     </li>
//   )
