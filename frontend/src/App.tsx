import React from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { PrivyProvider, User, usePrivy } from "@privy-io/react-auth";
import { usePrivySmartAccount } from "@zerodev/privy";

const MainPage: React.FC = () => {
  // const smartAccount = usePrivySmartAccount();
  const smartAccount = usePrivy();

  const address = smartAccount.user?.wallet?.address;
  return (
    <>
      {!smartAccount.authenticated && (
        <button onClick={smartAccount.login}>Login</button>
      )}
      {smartAccount.ready && smartAccount.authenticated && (
        <>
          <div>Authenticated!</div>
          <button onClick={smartAccount.logout}>Logout</button>
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
        }}
      >
        <MainPage></MainPage>
      </PrivyProvider>
    </>
  );
}

export default App;
