import { useEffect, useState } from "react";
import Select from "react-select";
import networkInfo from "./networkInfo";

const styles = {
  control: (provided) => ({
    ...provided,
    height: "calc(3.5rem + 2px)",
    paddingLeft: ".75rem",
    fontSize: "1rem",
  }),
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected
      ? state.provided
      : state.isDisabled
      ? "#aaa"
      : "#000",
  }),
};
const options = networkInfo.map(
  ({ bridgeChainIds, chainId, name, contractAddresses }) => ({
    bridgeChainIds,
    label: name,
    value: chainId,
    disabled: contractAddresses === undefined,
  })
);

export default function NetworkSelect(props) {
  const { onChange, mirrorCurrentNetwork, isOptionDisabled } = props;
  const [option, setOption] = useState();
  useEffect(() => {
    async function fetchChainId() {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (mirrorCurrentNetwork) {
        const option = options.find(({ value }) => value === chainId);
        setOption(option);
      } else {
        if (chainId === "0x4") {
          const option = options.find(({ value }) => value === "0x13881");
          setOption(option);
        } else {
          const option = options.find(({ value }) => value === "0x4");
          setOption(option);
        }
      }
    }

    fetchChainId();
    window.ethereum.on("chainChanged", fetchChainId);
  }, [mirrorCurrentNetwork]);
  useEffect(() => {
    if (option) {
      onChange(option.value);
    }
  }, [option, onChange]);
  return (
    <Select
      options={options}
      placeholder="Select Network..."
      onChange={(option) => {
        setOption(option);
      }}
      isOptionDisabled={(option) =>
        option.disabled || (isOptionDisabled && isOptionDisabled(option))
      }
      value={option}
      styles={{ ...styles, ...props.styles }}
    />
  );
}
