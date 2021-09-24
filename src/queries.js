import { BASE_FACTOR, LIQUIDITY_TOKENS, TOKENS } from "./constants.js";
import { ethers } from "ethers";
import { gql, useQuery } from "@apollo/client";
import cbor from "cbor";

const { arrayify } = ethers.utils;

const GET_BLOCKCHAIN_STATE = gql`
  query blockchainState {
    blockchainState {
      bridgeAddress
      usdExchangeRate
    }
  }
`;
export const GET_TOKENS = gql`
  query tokens($tokens: [Address!]!, $address: Address!) {
    tokens(tokens: $tokens, address: $address) {
      address
      balance
      price
      underlyingExchangeRate
      totalSupply
    }
  }
`;
export const GET_LIQUIDITY_TOKENS = gql`
  query liquidityTokens($tokens: [Address!]!, $address: Address!) {
    liquidityTokens(tokens: $tokens, address: $address) {
      tokenAddress
      balance
      totalSupply
      poolSupplyOfToken
      poolSupplyOfUsd
      underlyingPoolSupplyOfUsd
    }
  }
`;

export const GET_BLOCK_NUMBER = gql`
  query blockNumber {
    blockNumber
  }
`;

export const GET_ISSUANCE_REWARDS = gql`
  query issuanceRewards($address: Bytes!) {
    issuanceRewards(address: $address)
  }
`;

const GET_NEXT_TRANSACTION_NUMBER = gql`
  query nextTransactionNumber($address: Bytes!) {
    nextTransactionNumber(address: $address)
  }
`;

const GET_PENDING_REDEEM_REQUESTS = gql`
  query pendingRedeemRequests($address: Bytes!) {
    pendingRedeemRequests(address: $address) {
      id
      sender
      token
      amount
      expirationBlockNumber
      signature
    }
  }
`;

export const GET_PROPOSALS = gql`
  query proposals {
    proposals {
      id
      title
      subtitle
      content
      actions
      votes {
        voter
        weight
        choice
      }
      result
    }
  }
`;

export const GET_ORDERS = gql`
  query orders {
    orders {
      id
      orderType
      amount
      token
      price
    }
  }
`;

export function useGetBlockchainState(apolloClient) {
  const {
    data: { blockchainState: { usdExchangeRate } } = {
      blockchainState: {
        bridgeAddress: null,
        usdExchangeRate: null,
      },
    },
  } = useQuery(GET_BLOCKCHAIN_STATE, { client: apolloClient });
  let bridgeContract;

  return {
    bridgeContract,
    usdExchangeRate: BigInt(usdExchangeRate || 0),
  };
}

export function useGetTokens(address) {
  let {
    data: { tokens } = { tokens: TOKENS },
    error,
    loading,
  } = useQuery(GET_TOKENS, {
    variables: {
      tokens: TOKENS.map(({ address }) => address),
      address,
    },
  });
  tokens = tokens.map((token) => ({
    ...token,
    balance: BigInt(token.balance || 0),
    price: BigInt(token.price || 0),
    underlyingExchangeRate: BigInt(token.underlyingExchangeRate || BASE_FACTOR),
    totalSupply: BigInt(token.totalSupply || 0),
  }));
  return { data: { tokens }, error, loading };
}

export function useGetLiquidityTokens(address) {
  let { data: { liquidityTokens } = { liquidityTokens: [] }, error } = useQuery(
    GET_LIQUIDITY_TOKENS,
    {
      variables: {
        tokens: LIQUIDITY_TOKENS.map(({ address }) => address),
        address,
      },
    }
  );
  liquidityTokens = liquidityTokens.map((liquidityToken) => ({
    ...liquidityToken,
    balance: BigInt(liquidityToken.balance),
    totalSupply: BigInt(liquidityToken.totalSupply),
    poolSupplyOfToken: BigInt(liquidityToken.poolSupplyOfToken),
    poolSupplyOfUsd: BigInt(liquidityToken.poolSupplyOfUsd),
    underlyingPoolSupplyOfUsd: BigInt(liquidityToken.underlyingPoolSupplyOfUsd),
  }));

  return { data: { liquidityTokens }, error };
}

export function useGetBlockNumber() {
  const { data: { blockNumber } = { blockNumber: null } } =
    useQuery(GET_BLOCK_NUMBER);
  return blockNumber ? BigInt(blockNumber) : null;
}
export function useGetIssuanceRewards(address) {
  let { data: { issuanceRewards } = 0n } = useQuery(GET_ISSUANCE_REWARDS, {
    variables: {
      address: Buffer.from(arrayify(address)).toString("base64"),
    },
  });
  issuanceRewards = BigInt(issuanceRewards || 0);

  return { data: { issuanceRewards } };
}

export function useGetNextTransactionNumber(address) {
  const result = useQuery(GET_NEXT_TRANSACTION_NUMBER, {
    variables: {
      address: Buffer.from(arrayify(address)).toString("base64"),
    },
  });

  return {
    ...result,
    data: {
      ...result.data,
      nextTransactionNumber:
        (result.data && parseInt(result.data.nextTransactionNumber)) || 0,
    },
  };
}

export function usePendingRedeemRequests(address) {
  const result = useQuery(GET_PENDING_REDEEM_REQUESTS, {
    variables: {
      address: Buffer.from(arrayify(address)).toString("base64"),
    },
  });

  return {
    ...result,
    data: {
      ...result.data,
      nextTransactionNumber:
        (result.data && parseInt(result.data.nextTransactionNumber)) || 0,
    },
  };
}

export function useGetProposals() {
  const { data: { proposals } = { proposals: [] } } = useQuery(GET_PROPOSALS);
  return proposals.map((proposal) => ({
    ...proposal,
    actions: proposal.actions.map((action) =>
      cbor.decode(Buffer.from(action, "base64"))
    ),
    votes: proposal.votes.map((vote) => ({
      ...vote,
      voter: Buffer.from(vote.voter, "base64"),
      weight: BigInt(vote.weight),
    })),
    id: Number(proposal.id),
  }));
}

export function useGetOrders() {
  const { data: { orders } = { orders: [] } } = useQuery(GET_ORDERS);
  return orders.map((order) => ({
    ...order,
    amount: BigInt(order.amount),
    price: BigInt(order.price),
    id: Number(order.id),
  }));
}
