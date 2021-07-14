import { useState } from "react";
import Select from "react-select";
import { PROD } from "./constants";
import rinkarbyTokenList from "./rinkarbyTokenList.json";
import rinkebyTokenList from "./rinkebyTokenList.json";

const styles = {
  control: (provided) => ({
    ...provided,
    height: "calc(3.5rem + 2px)",
    paddingLeft: ".75rem",
    fontSize: "1rem",
  }),
};
const options = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "vanilla", label: "Vanilla" },
];

export default function NetworkSelect(props) {
  const { onChange } = props;
  const [network, setNetowrk] = useState();
  return (
    <div className="mb-3">
      <Select
        options={options}
        onChange={(network) => {
          onChange(network);
        }}
        value={network}
        styles={styles}
      />
    </div>
  );
}
