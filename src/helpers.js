import { useEffect, useRef, useState } from "react";
import { BASE_FACTOR, TOKENS } from "./constants";
export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/#just-show-me-the-code
export function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    let id = setInterval(() => {
      savedCallback.current();
    }, delay);
    return () => clearInterval(id);
  }, [delay]);
}

export function scaleUpTokenAmount(token, amount) {
  const decimals = tokenMetadata(token, "decimals");
  if (decimals > 6) {
    return BigInt(Number(amount) * 10 ** (Number(decimals) - 6));
  } else if (decimals < 6) {
    return BigInt(Number(amount) / 10 ** (6 - Number(decimals)));
  } else {
    return BigInt(amount);
  }
}

export function scaleDownTokenAmount(token, amount) {
  const decimals = tokenMetadata(token, "decimals");
  if (decimals > 6) {
    return (Number(decimals) - 6) / BigInt(Number(amount) * 10);
  }
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue];
}

export function proportionOf(value, numerator, denominator) {
  return (value * numerator) / denominator;
}

export function tokenMetadata(address, key) {
  if (key === "symbol") {
    return tokenSymbol(address);
  } else {
    return TOKENS[
      Object.keys(TOKENS).find(
        (symbol) =>
          TOKENS[symbol].address.toLowerCase() === address.toLowerCase()
      )
    ][key];
  }
}

export function tokenSymbol(address) {
  return Object.keys(TOKENS).find(
    (symbol) => TOKENS[symbol].address.toLowerCase() === address.toLowerCase()
  );
}

export function formatTokenAmount(value, address, options = {}) {
  const { decimals } = options;
  if (value === 0n) return "0";
  if (options.showSymbol) {
    const symbol = tokenSymbol(address);
    return `${formatBigInt(value, { decimals })} ${symbol}`;
  } else {
    return formatBigInt(value, { decimals });
  }
}

export function formatUsdAmount(value, address, options = {}) {
  return `$ ${formatBigInt(value, { decimals: 2 })}`;
}

export function formatBigInt(n, options = {}) {
  return formatNumber(Number(n) / Number(BASE_FACTOR), options);
}
export function formatNumber(n, options = { decimals: 6 }) {
  const decimals = options.decimals || 6;
  const [number, decimal] = n.toFixed(decimals).toString().split(".");

  return `${numberWithCommas(number)}.${decimal}`;
}
export function numberWithCommas(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
