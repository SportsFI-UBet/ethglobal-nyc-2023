import { defineConfig } from "@wagmi/cli";
import { react, foundry } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/abis.ts",
  plugins: [react(), foundry({
    project: "../contracts",
    include: [
        "ParimutuelBetting.sol/**/*.json",
        "ERC20.sol/**/*.json",
    ]
  })],
})
