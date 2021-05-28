import { components as reactSelectComponents } from "react-select";
import AsyncSelect from "react-select/async";
import { PROD, BASE_TOKEN_ADDRESS } from "./constants";
import {usePools} from "./helpers"
import developmentTokenList from "./developmentTokenList.json";
import React, { Component } from "react";

const tokenOptions = async (inputValue, includeBaseToken) => {
  const tokens = PROD
    ? await fetch("https://gateway.ipfs.io/ipns/tokens.uniswap.org")
        .then((response) => response.json())
        .then(({ tokens }) => tokens)
    : developmentTokenList;

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

const styles = {
  control: (provided) => ({
    ...provided,
    height: "calc(3.5rem + 2px)",
    paddingLeft: ".75rem",
    fontSize: "1rem",
  }),
};

export default class WithPromises extends Component {
  render() {
    const { includeBaseToken, pools } = this.props;
    return (
      <div className="mb-3">
        <AsyncSelect
          {...this.props}
          cacheOptions
          defaultOptions
          loadOptions={(inputValue) =>
            tokenOptions(inputValue, includeBaseToken, pools)
          }
          components={{ Option: IconOption, SingleValue: IconSingleValue }}
          isOptionDisabled={option => !pools.some((pool) => (pool.token === option.value) || option.value === BASE_TOKEN_ADDRESS)}
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
