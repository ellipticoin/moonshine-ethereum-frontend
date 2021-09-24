import { MOONSHINE_CHAIN_ID, POLYGON_CHAIN_ID } from "./constants";
import Withdraw from "./Withdraw";
import Deposit from "./Deposit";
import UnsupportedChain from "./UnsupportedChain";

export default function Bridge(props) {
  switch (props.chainId) {
    case MOONSHINE_CHAIN_ID:
      return <Withdraw {...props} />;
    case POLYGON_CHAIN_ID:
      return <Deposit {...props} />;
    default:
      return <UnsupportedChain />;
  }
}
