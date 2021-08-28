import { components as reactSelectComponents } from "react-select";
import Select from "react-select";
import { PROD } from "./constants";
import rinkarbyTokenList from "./rinkarbyTokenList.json";
import rinkebyTokenList from "./rinkebyTokenList.json";
import mumbaiTokenList from "./mumbaiTokenList.json";
import polygonTokenList from "./polygonTokenList.json";
import React, { useEffect, useState } from "react";

const tokenOptions = async (includeBaseToken) => {
  const tokens = PROD
    ? await fetch(
        "https://unpkg.com/quickswap-default-token-list@1.0.91/build/quickswap-default.tokenlist.json"
      )
        .then((response) => response.json())
        .then(({ tokens }) => tokens)
    : await developmentTokenList();

  return tokens
    .filter(
      ({ name, chainId, symbol }) =>
        // name.toLowerCase().includes(inputValue.toLowerCase()) &&
        (!PROD || chainId === 137) &&
        (includeBaseToken === undefined || symbol !== "USDC")
    )
    .map(({ address, logoURI, symbol, name }, index) => ({
      id: (index + 1).toString(),
      name,
      icon: logoURI,
      label: symbol,
      value: address,
    }));
};
const developmentTokenList = async () => {
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  switch (chainId) {
    case "0x66eeb":
      return rinkarbyTokenList;
    case "0x4":
      return rinkebyTokenList;
    case "0x13881":
      return mumbaiTokenList;
    case "0x89":
      return polygonTokenList;
    default:
  }
};

const styles = {
  control: (provided) => ({
    ...provided,
    height: "calc(3.5rem + 2px)",
    paddingLeft: ".75rem",
    fontSize: "1rem",
  }),
};
function filterOption({ label, chainId, value, data }, inputValue) {
  return (
    label.toLowerCase().includes(inputValue.toLowerCase()) ||
    data.name.toLowerCase().includes(inputValue.toLowerCase())
  );
}
export default function TokenSelect(props) {
  const { onChange, includeBaseToken, placeholder } = props;
  const [tokens, setTokens] = useState([]);
  useEffect(() => {
    let isCancelled = false;
    async function fetchTokens() {
      const newTokens = await tokenOptions(includeBaseToken);
      if (!isCancelled) {
        setTokens(newTokens);
      }
    }
    fetchTokens();
    return () => {
      isCancelled = true;
    };
  }, [includeBaseToken]);
  return tokens.length ? (
    <div className="mb-3">
      <Select
        placeholder={placeholder}
        components={{ Option: IconOption, SingleValue: IconSingleValue }}
        options={props.tokens || tokens}
        filterOption={filterOption}
        onChange={(selection) => {
          onChange({
            address: selection.value,
            ticker: selection.label,
          });
        }}
        value={tokens.find(({ value }) => value === props.value) || null}
        styles={styles}
      />
    </div>
  ) : null;
}

const { Option, SingleValue } = reactSelectComponents;

const IconSingleValue = function (props) {
  const [value] = props.getValue();
  return (
    <SingleValue {...props}>
      <div style={{ display: "flex" }}>
        <img
          src={value.icon}
          style={{
            height: 24,
            width: 24,
            marginRight: "12px",
            borderRadius: "100%",
          }}
          alt={value.label}
        />
        <div>
          <strong>{value.name}</strong> ({value.label})
        </div>
      </div>
    </SingleValue>
  );
};

const IconOption = function (props) {
  return (
    <Option {...props}>
      <div style={{ display: "flex" }}>
        <img
          src={props.data.icon}
          style={{
            height: 24,
            width: 24,
            margin: "12px 20px 0 10px",
            borderRadius: "100%",
          }}
          alt={props.data.label}
        />
        <div>
          <strong>{props.data.label}</strong>
          <div>{props.data.name}</div>
        </div>
      </div>
    </Option>
  );
};
