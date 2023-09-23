import React from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { PrivyProvider, User, PrivyClientConfig } from "@privy-io/react-auth";
import { ZeroDevProvider, usePrivySmartAccount } from "@zerodev/privy";

import { PrivyWagmiConnector } from "@privy-io/wagmi-connector";
// You can import additional chains from 'wagmi/chains'
// https://wagmi.sh/react/chains
import { polygonMumbai } from "@wagmi/chains";
import { configureChains } from "wagmi";
// You may replace this with your preferred providers
// https://wagmi.sh/react/providers/configuring-chains#multiple-providers
import { publicProvider } from "wagmi/providers/public";

// Replace the chains and providers with the ones used by your app.
// https://wagmi.sh/react/providers/configuring-chains
const configureChainsConfig = configureChains(
  [polygonMumbai],
  [publicProvider()]
);

const MainPage: React.FC = () => {
  const account = usePrivySmartAccount();

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
    </>
  );
};

const Header: React.FC = () => {
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
    </>
  );
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
