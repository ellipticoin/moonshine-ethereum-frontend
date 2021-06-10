import NetworkSelect from "./NetworkSelect";
import {ethSwitchChain} from "./ethereum"
const styles = {
  container: (provided) => ({
  display: "inline-block",
  width: "300px",
  
 ...provided,
})
}
export default function UserAddress(props) {
  const { metamaskIsConnected, address } = props;
  if (!address) return <></>;
  const shortenedAddress = `${address.substr(0, 5)}...${address.substr(38)}`;

  return (
    <form className="d-flex">
      {metamaskIsConnected && (
        <div className="text-light">
          Connected as: {shortenedAddress} on <NetworkSelect mirrorCurrentNetwork={true} onChange={({value}) => ethSwitchChain(value)} styles={styles}/>
        </div>
      )}
    </form>
  );
}
