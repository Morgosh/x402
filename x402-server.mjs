import express from "express";
import cors from "cors";
import { paymentMiddleware, network } from "@x402/express";

const app = express();
const PORT = 3001;

// Replace with your actual recipient wallet address
const RECIPIENT = process.env.RECIPIENT_ADDRESS || "0x0000000000000000000000000000000000000001";

app.use(cors({ origin: ["http://localhost:4670", "http://localhost:5173"] }));
app.use(express.json());

app.use(
  paymentMiddleware(
    RECIPIENT,
    { "GET /api/protected": "$0.01" },
    {
      network: network.abstractMainnet,
      facilitatorUrl: "https://facilitator.x402.abs.xyz",
    }
  )
);

app.get("/api/protected", (req, res) => {
  res.json({ success: true, message: "Payment verified. Access granted." });
});

app.listen(PORT, () => {
  console.log(`x402 server running on http://localhost:${PORT}`);
  console.log(`Recipient: ${RECIPIENT}`);
  console.log(`Network: Abstract mainnet`);
  console.log(`Facilitator: https://facilitator.x402.abs.xyz`);
});
