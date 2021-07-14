import { ethers } from "ethers";

const {
  utils: { formatUnits, commify },
} = ethers;

export default function TokenAmount(props) {
  const { children, decimals = 6, ticker, prefix } = props;
  const label = typeof decimals === "string" ? decimals : ticker;

  if ([undefined, null].includes(children)) return <></>;
  let formatedValue;
  if (children === 0n) {
    formatedValue = "0";
  } else {
    formatedValue = commify(formatUnits(children, decimals));
    formatedValue = formatedValue.padEnd(formatedValue.indexOf(".") + 3, "0");
  }
  return `${prefix ? `${prefix} ` : ""} ${formatedValue}${
    label ? ` ${label}` : ""
  }`;
}
