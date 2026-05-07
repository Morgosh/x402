import express from "express";
import cors from "cors";
import { paymentMiddlewareFromConfig } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

const app = express();
const PORT = 3001;

const RECIPIENT = process.env.RECIPIENT_ADDRESS || "0x62d8B1c7FE0c8a6d3a8a8Ac051c24A06b4602e65";

app.use(cors({ origin: ["http://localhost:4670", "http://localhost:5000", "http://localhost:5173"] }));
app.use(express.json());

const facilitator = new HTTPFacilitatorClient({
  url: "https://facilitator.x402.abs.xyz",
});

const routes = {
  "GET /api/protected": {
    accepts: {
      scheme: "exact",
      payTo: RECIPIENT,
      price: "$0.01",
      network: "eip155:2741",
    },
  },
};

const USDC_ABSTRACT = "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1";
const USDC_DECIMALS = 6;

const evmScheme = new ExactEvmScheme();
evmScheme.registerMoneyParser(async (amount, network) => {
  if (network === "eip155:2741") {
    return {
      asset: USDC_ABSTRACT,
      amount: Math.round(amount * 10 ** USDC_DECIMALS).toString(),
      extra: { name: "Bridged USDC (Stargate)", version: "2" },
    };
  }
  return null;
});

const schemes = [{ network: "eip155:2741", server: evmScheme }];

app.use(paymentMiddlewareFromConfig(routes, facilitator, schemes));

app.get("/api/protected", (req, res) => {
  res.json({ success: true, message: "Payment verified. Access granted." });
});

app.listen(PORT, () => {
  console.log(`x402 server running on http://localhost:${PORT}`);
  console.log(`Recipient: ${RECIPIENT}`);
  console.log(`Network: Abstract mainnet (eip155:2741)`);
  console.log(`Facilitator: https://facilitator.x402.abs.xyz`);
});
