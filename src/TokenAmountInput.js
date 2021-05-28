import { forwardRef, useState, useEffect } from "react";
import { ethers } from "ethers";
import { BASE_TOKEN_ADDRESS, BASE_TOKEN_DECIMALS } from "./constants";
import ERC20JSON from "@openzeppelin/contracts/build/contracts/ERC20";
import Cleave from "cleave.js/react";
const {
  utils: { parseUnits },
} = ethers;

export default forwardRef((props, ref) => {
  const { onChange, tokenAddress, options } = props;
  const [decimals, setDecimals] = useState();
  useEffect(() => {
    async function fetchDecimals() {
      if (!tokenAddress) return;
      const signer = new ethers.providers.Web3Provider(
        window.ethereum
      ).getSigner();
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20JSON.abi,
        signer
      );
      const decimals = await tokenContract.decimals();
      setDecimals(decimals);
    }
    if (tokenAddress === BASE_TOKEN_ADDRESS) {
      setDecimals(BASE_TOKEN_DECIMALS);
    } else {
      fetchDecimals();
    }
  }, [setDecimals, tokenAddress]);
  return (
    <Cleave
      className="form-control"
      ref={ref}
      placeholder="0.0"
      options={{
        ...options,
        numeral: true,
        numeralDecimalScale: 18,
        numeralThousandsGroupStyle: "thousand",
      }}
      onChange={(event) => {
        onChange(
          event.target.rawValue === ""
            ? null
            : parseUnits(event.target.rawValue.replace(/^\./g, "0."), decimals)
        );
      }}
    ></Cleave>
  );
});
// };
