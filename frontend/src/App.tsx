import React from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { PrivyProvider, User, usePrivy } from "@privy-io/react-auth";
import { ZeroDevProvider, usePrivySmartAccount } from "@zerodev/privy";

const MainPage: React.FC = () => {
  const account = usePrivySmartAccount();

  const address = account.user?.wallet?.address;
  return (
    <>
      {!account.authenticated && (
        <button onClick={account.login}>Login</button>
      )}
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

// This method will be passed to the PrivyProvider as a callback
// that runs after successful login.
const handleLogin = (user: User) => {
  console.log(`User ${user.id} logged in!`);
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
          config={{
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
          }}
        >
          <MainPage></MainPage>
        </PrivyProvider>
      </ZeroDevProvider>
    </>
  );
}

export default App;
