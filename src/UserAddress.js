export default function UserAddress(props) {
  const { metamaskIsConnected, ethereumAcccounts } = props;
  return (
    <form className="d-flex">
      {metamaskIsConnected &&
        ethereumAcccounts.map((ethereumAcccount, i) => (
          <div key={i} className="text-light">
            Connected as: {ethereumAcccount}
          </div>
        ))}
    </form>
  );
}
