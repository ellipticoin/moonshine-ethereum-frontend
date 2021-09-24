import { components as reactSelectComponents } from "react-select";
import Select from "react-select";
import { TOKENS } from "./constants";
import React from "react";

const OPTIONS = TOKENS.map((token, index) => ({
  name: token.name,
  label: token.ticker,
  icon: token.logoURI,
  value: token.address,
}));

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
  const { onChange, placeholder } = props;

  return (
    <div className="mb-3">
      <Select
        placeholder={placeholder}
        components={{ Option: IconOption, SingleValue: IconSingleValue }}
        options={props.tokens || OPTIONS}
        filterOption={filterOption}
        onChange={(selection) => {
          onChange({
            address: selection.value,
            ticker: selection.label,
          });
        }}
        value={
          OPTIONS.find(({ value }) =>
            value.toLowerCase() === props.value
              ? props.value.toLowerCase()
              : null
          ) || null
        }
        styles={styles}
      />
    </div>
  );
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
