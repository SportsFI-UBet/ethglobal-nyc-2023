import React from "react";
import "./App.css";
import {
  PrivyProvider,
  User,
  PrivyClientConfig,
  useWallets,
} from "@privy-io/react-auth";
import { ZeroDevProvider, usePrivySmartAccount } from "@zerodev/privy";

import { PrivyWagmiConnector, usePrivyWagmi } from "@privy-io/wagmi-connector";
// You can import additional chains from 'wagmi/chains'
// https://wagmi.sh/react/chains
import { polygonMumbai } from "@wagmi/chains";
import {
  Address,
  useAccount,
  configureChains,
  useBalance,
} from "wagmi";
// You may replace this with your preferred providers
// https://wagmi.sh/react/providers/configuring-chains#multiple-providers
import { publicProvider } from "wagmi/providers/public";

// Replace the chains and providers with the ones used by your app.
// https://wagmi.sh/react/providers/configuring-chains
const configureChainsConfig = configureChains(
  [polygonMumbai],
  [publicProvider()]
);

const FundsComponent: React.FC<{ tokenAddress: Address }> = ({
  tokenAddress,
}) => {
  const account = useAccount();
  const balance = useBalance({
    address: account.address,
    token: tokenAddress,
  });

  return (
    <>
      <span>{balance.data?.formatted}</span>
      <span></span>
    </>
  );
};

const MainPage: React.FC = () => {
  const account = usePrivySmartAccount();

  const { wallets } = useWallets();
  const { wallet: activeWallet, setActiveWallet } = usePrivyWagmi();

  const address = account.user?.wallet?.address;
  return (
    <>
      {!account.authenticated && <button onClick={account.login}>Login</button>}
      {account.ready && account.authenticated && (
        <>
          <div>Authenticated!</div>
          <button onClick={account.logout}>Logout</button>
        </>
      )}
      {!!address && <div>Address {address}</div>}
      {!!activeWallet && <div>ActiveWallet {activeWallet.address}</div>}
    </>
  );
};

const Header: React.FC = () => {
  return <></>;
};

const handleLogin = (user: User) => {
  console.log(`User ${user.id} logged in!`);
};

const privyClientConfig: PrivyClientConfig = {
  loginMethods: ["email", "wallet", "google", "twitter"],
  appearance: {
    theme: "light",
    accentColor: "#676FFF",
    logo: import.meta.env.VITE_LOGO,
    showWalletLoginFirst: false,
  },
  fiatOnRamp: {
    useSandbox: true,
  },
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
    noPromptOnSignature: false,
  },
};

function App() {
  return (
    <>
      <Header></Header>
      <ZeroDevProvider
        projectId={import.meta.env.VITE_ZERODEV_PROJECT_ID ?? "BORK"}
      >
        <PrivyProvider
          appId={import.meta.env.VITE_PRIVY_APP_ID ?? "BORK"}
          onSuccess={handleLogin}
          config={privyClientConfig}
        >
          <PrivyWagmiConnector wagmiChainsConfig={configureChainsConfig}>
            <MainPage />
          </PrivyWagmiConnector>
        </PrivyProvider>
      </ZeroDevProvider>
    </>
  );
}

export default App;
