# 🔍 1inch Aggregator Inspector

A comprehensive Web3 tool for analyzing 1inch swap routes with deep analytics including per-hop slippage, gas cost estimation, and router contract security scanning.

## 🚀 Features

### Route Breakdown
- **Protocol Analysis**: Parse DEX names, token paths, and percent allocation from 1inch API
- **Route Visualization**: Clear breakdown of which DEXs are used and their allocation percentages
- **Gas Estimation**: Per-hop gas cost analysis

### Per-hop Slippage & Gas Analysis
- **Foundry Simulation**: Uses mainnet fork to simulate actual swap execution
- **Slippage Calculation**: Compute slippage per hop based on input/output ratios
- **Gas Tracking**: Log gas estimation per DEX leg
- **Fallback Analysis**: Estimated values when simulation fails

### Router Security Scan
- **Contract Verification**: Check if router contract is verified on Etherscan
- **Proxy Detection**: Identify EIP-1967, TransparentUpgradeableProxy, and UUPS patterns
- **Dangerous Opcodes**: Scan for delegatecall, selfdestruct, callcode, etc.
- **Risk Scoring**: Comprehensive risk assessment with recommendations

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Simulation**: Foundry (mainnet fork)
- **Frontend**: Vanilla HTML + JavaScript + CSS
- **APIs**: 1inch Swap API, Etherscan API
- **Blockchain**: Ethereum Mainnet

## 📁 Project Structure

```
1inchaggretor/
├── backend/
│   ├── server.js                 # Main Express server
│   └── services/
│       ├── 1inchAnalyzer.js     # 1inch API integration
│       ├── simulationService.js  # Foundry simulation logic
│       └── securityScanner.js    # Router security analysis
├── foundry/
│   ├── src/
│   │   └── SimulateSwap.sol     # Foundry simulation contract
│   ├── foundry.toml             # Foundry configuration
│   └── remappings.txt           # Foundry dependencies
├── frontend/
│   └── index.html               # Main application UI
├── package.json                 # Node.js dependencies
├── foundry.toml                # Foundry configuration
├── env.example                 # Environment variables template
└── README.md                   # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. Setup Environment

```bash
# Copy environment template
cp env.example .env

# Edit .env with your API keys
nano .env
```

> See `env.example` for all required environment variables.  
> Example `.env` file:

```env
ETHERSCAN_API_KEY=your_etherscan_api_key_here
TENDERLY_ACCESS_KEY=your_tenderly_access_key_here
MAINNET_RPC_URL=https://mainnet.infura.io/v3/your_key_here
PORT=3000
NODE_ENV=development
```

### 3. Install Foundry Dependencies

```bash
cd foundry
forge install foundry-rs/forge-std
```

### 4. Start the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Visit `http://localhost:3000` to access the application.

## 🔧 How It Works

### 1. Route Analysis Flow

1. **User Input**: Token addresses, amount, and wallet address
2. **1inch API Call**: Fetch swap quote and transaction data
3. **Protocol Parsing**: Extract DEX breakdown from protocols array
4. **Route Visualization**: Display per-hop allocation and gas estimates

### 2. Simulation Process

1. **Foundry Setup**: Create mainnet fork with whale account
2. **Dynamic Script Generation**: Create Solidity test based on route data
3. **Swap Execution**: Simulate the actual swap transaction
4. **Slippage Calculation**: Compare input/output ratios
5. **Gas Analysis**: Track gas usage per hop

### 3. Security Scanning

1. **Contract Verification**: Check Etherscan for source code
2. **Proxy Detection**: Analyze for upgradeable patterns
3. **Opcode Analysis**: Scan bytecode for dangerous operations
4. **Risk Assessment**: Calculate comprehensive risk score

## 📊 API Endpoints

### POST `/api/analyze-route`
Analyze a 1inch swap route with full simulation and security analysis.

**Request Body:**
```json
{
  "fromToken": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "toToken": "0xA0b86a33E6441b8C4F8B4C4C4C4C4C4C4C4C4C",
  "amount": "1000000000000000000",
  "fromAddress": "0x..."
}
```

**Response:**
```json
{
  "routeAnalysis": {
    "routeBreakdown": { /* protocol breakdown */ },
    "tx": { /* transaction data */ }
  },
  "simulationResults": {
    "perHopSlippage": [ /* slippage per hop */ ],
    "gasEstimates": [ /* gas per hop */ ]
  },
  "securityAnalysis": {
    "riskLevel": "MEDIUM",
    "riskScore": 45,
    "riskFactors": [ /* security issues */ ]
  }
}
```

### GET `/api/health`
Health check endpoint.

## 🔍 Usage Examples

### Example 1: WETH to USDC Swap
```javascript
// Input
fromToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" // WETH
toToken: "0xA0b86a33E6441b8C4F8B4C4C4C4C4C4C4C4C4C" // USDC
amount: "1000000000000000000" // 1 ETH
fromAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
```

### Example 2: USDC to DAI Swap
```javascript
// Input
fromToken: "0xA0b86a33E6441b8C4F8B4C4C4C4C4C4C4C4C4C" // USDC
toToken: "0x6B175474E89094C44Da98b954EedeAC495271d0F" // DAI
amount: "1000000" // 1 USDC
fromAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
```

## 🛡️ Security Features

### Risk Scoring System
- **SAFE (0-19)**: Low risk, verified contracts
- **LOW (20-39)**: Minor concerns, mostly safe
- **MEDIUM (40-59)**: Some risk factors present
- **HIGH (60-79)**: Multiple risk factors, caution advised
- **CRITICAL (80-100)**: High risk, avoid if possible

### Security Checks
- ✅ Contract verification status
- ✅ Proxy pattern detection
- ✅ Dangerous opcode scanning
- ✅ Source code analysis
- ✅ Risk factor identification

## 🔧 Development

### Adding New DEX Support
1. Update `estimateGasForDex()` in `simulationService.js`
2. Add gas estimates for the new DEX
3. Test with actual 1inch routes

### Extending Security Analysis
1. Add new patterns to `detectProxyPatterns()`
2. Include additional opcodes in `analyzeDangerousOpcodes()`
3. Update risk scoring algorithm

### Customizing Simulation
1. Modify `createSimulationScript()` for different scenarios
2. Add new test functions to `SimulateSwap.sol`
3. Update output parsing in `parseFoundryOutput()`

## 🐛 Troubleshooting

### Common Issues

**1. Foundry not found**
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**2. API rate limits**
- Get your own API keys for 1inch and Etherscan
- Implement rate limiting in production

**3. Simulation failures**
- Check RPC endpoint connectivity
- Verify token addresses are correct
- Ensure sufficient balance for simulation

**4. Security scan errors**
- Verify Etherscan API key
- Check contract address format
- Handle unverified contracts gracefully

## 📈 Performance Considerations

- **Caching**: Implement Redis for API responses
- **Rate Limiting**: Add rate limiting for production use
- **Error Handling**: Graceful fallbacks for API failures
- **Monitoring**: Add logging and metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- 1inch for their comprehensive API
- Foundry team for the excellent testing framework
- Etherscan for contract verification data
- OpenZeppelin for security patterns reference

---

**⚠️ Disclaimer**: This tool is for educational and analysis purposes. Always verify results independently before making financial decisions.