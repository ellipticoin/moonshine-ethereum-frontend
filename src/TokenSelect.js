import { components as reactSelectComponents } from "react-select";
import AsyncSelect from "react-select/async";
import { PROD } from "./constants";
import rinkarbyTokenList from "./rinkarbyTokenList.json";
import rinkebyTokenList from "./rinkebyTokenList.json";
import React, { Component } from "react";

const tokenOptions = async (inputValue, includeBaseToken) => {
  const tokens = PROD
    ? await fetch("https://gateway.ipfs.io/ipns/tokens.uniswap.org")
        .then((response) => response.json())
        .then(({ tokens }) => tokens)
    : await developmentTokenList();

  return tokens
    .filter(
      ({ name, chainId, symbol }) =>
        name.toLowerCase().includes(inputValue.toLowerCase()) &&
        (!PROD || chainId === 1) &&
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
    default:
      throw new Error("Unknown Network");
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

export default class WithPromises extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.setSelection = this.setSelection.bind(this);
  }

  setSelection(e) {
    this.setState();
  }
  render() {
    const { onChange, includeBaseToken, isOptionDisabled, chainId } =
      this.props;
    return (
      <div className="mb-3">
        <AsyncSelect
          {...this.props}
          cacheOptions
          defaultOptions
          loadOptions={(inputValue) =>
            tokenOptions(inputValue, includeBaseToken, chainId)
          }
          onChange={(selection) => {
            onChange({
              address: selection.value,
              ticker: selection.label,
            });
            this.setSelection(selection);
          }}
          value={this.state.selection}
          components={{ Option: IconOption, SingleValue: IconSingleValue }}
          isOptionDisabled={
            (option) => isOptionDisabled && isOptionDisabled(option.value)
            // !pools.some(
            //   (pool) =>
            //     pool.token === option.value ||
            //     option.value === BASE_TOKEN_ADDRESS
            // )
          }
          styles={styles}
        />
      </div>
    );
  }
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
