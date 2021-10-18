import { useEffect, useRef, useState } from "react";
import { BASE_FACTOR, TOKEN_METADATA, USD } from "./constants";
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
  console.log(token);
  if (token.decimals > 6) {
    return BigInt(Number(amount) * 10 ** (Number(token.decimals) - 6));
  } else if (token.decimals < 6n) {
    return BigInt(Number(amount) / 10 ** (6 - Number(token.decimals)));
  } else {
    return BigInt(amount);
  }
}

export function scaleDownTokenAmount(token, amount) {
  console.log(token);
  if (token.decimals > 6) {
    return (Number(token.decimals) - 6) / BigInt(Number(amount) * 10);
  }
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
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

export function value(value, tokenAddress, options = {}) {
  const { decimals } = options;
  const number = Number(value) / Number(BASE_FACTOR);
  if (number === 0 && options.zeroString) return options.zeroString;
  if (options.showCurrency) {
    if (tokenAddress === USD.address) {
      console.log(formatNumber(0, { decimals: 2 }));
      // console.log(number)
      // console.log(`$ ${formatNumber(number, { decimals: 2 })} USD`)
      return `$ ${formatNumber(number, { decimals: 2 })} USD`;
    } else {
      return `${formatNumber(number, { decimals })} ${
        TOKEN_METADATA[tokenAddress].ticker
      }`;
    }
  } else {
    return formatNumber(number, { decimals });
  }
}

export function formatBigInt(n, options = {}) {
  return formatNumber(Number(n) / Number(BASE_FACTOR), options);
}
export function formatNumber(n, options = {}) {
  const decimals = n < 1 ? 2 : options.decimals || 6;

  const [number, decimal] = n.toFixed(decimals).toString().split(".");
  return `${numberWithCommas(number)}.${decimal}`;
}
export function numberWithCommas(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
