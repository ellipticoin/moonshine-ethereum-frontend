import "./App.css";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import AppContext from "./AppContext";
import { sample } from "lodash";
import { BOOTNODES, PROD } from "./constants";
import { useEthereumAddress } from "./ethereum";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import UnsupportedChain from "./UnsupportedChain";
import App from "./App";
export default function AppWrapper() {
  const address = useEthereumAddress();
  const [host] = useState(sample(BOOTNODES));
  const uri = useMemo(() => `${PROD ? "https" : "http"}://${host}`, [host]);
  const [blockNumber] = useState();
  const cache = new InMemoryCache();
  const [apolloClient, setApolloClient] = useState(
    new ApolloClient({
      uri: uri + "/graphql",
      cache,
    })
  );
  const refetchCallback = useCallback(
    (event) => {
      apolloClient.reFetchObservableQueries();
    },
    [apolloClient]
  );
  const eventSourceRef = useRef();
  useEffect(() => {
    if (eventSourceRef.current) return;
    const eventSource = new EventSource(uri);
    eventSourceRef.current = eventSource;
    eventSourceRef.current.addEventListener("block", refetchCallback);
    return () => {
      eventSource.removeEventListener("block", refetchCallback);
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [refetchCallback, uri, eventSourceRef]);
  useEffect(() => {
    const cache = new InMemoryCache();
    setApolloClient(
      new ApolloClient({
        uri: uri + "/graphql",
        cache,
      })
    );
    return function cleanup() {};
  }, [uri]);
  useEffect(() => {
    if (!apolloClient) return;
    apolloClient.reFetchObservableQueries();
  }, [apolloClient, blockNumber]);
  if (!apolloClient) return <></>;
  return address ? (
    <ApolloProvider client={apolloClient}>
      <AppContext.Provider
        value={{
          blockNumber,
          address,
          apolloClient,
        }}
      >
        <App address={address} />
      </AppContext.Provider>
    </ApolloProvider>
  ) : (
    <div>
      <div className="jumbotron">
        <div className="container">
          <UnsupportedChain />
        </div>
      </div>
    </div>
  );
}
