const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { analyze1inchRoute } = require('./services/1inchAnalyzer');
const { simulateSwap } = require('./services/simulationService');
const { scanRouterSecurity } = require('./services/securityScanner');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/../frontend/index.html');
});

// API Routes
app.post('/api/analyze-route', async (req, res) => {
    try {
        const { fromToken, toToken, amount, fromAddress } = req.body;
        
        if (!fromToken || !toToken || !amount || !fromAddress) {
            return res.status(400).json({ 
                error: 'Missing required parameters: fromToken, toToken, amount, fromAddress' 
            });
        }

        console.log('🔍 Starting route analysis...', { fromToken, toToken, amount, fromAddress });

        // Get 1inch route analysis
        const routeAnalysis = await analyze1inchRoute(fromToken, toToken, amount, fromAddress);
        console.log('✅ 1inch route analysis completed');
        
        // Simulate the swap for slippage analysis
        const simulationResults = await simulateSwap(routeAnalysis);
        console.log('✅ Foundry simulation completed');
        
        // Scan router security
        const securityAnalysis = await scanRouterSecurity(routeAnalysis.tx.to);
        console.log('✅ Security analysis completed');
        
        const result = {
            routeAnalysis,
            simulationResults,
            securityAnalysis,
            timestamp: new Date().toISOString()
        };

        console.log('🎉 Complete analysis finished');
        res.json(result);
    } catch (error) {
        console.error('Route analysis error:', error);
        res.status(500).json({ 
            error: 'Failed to analyze route',
            details: error.message 
        });
    }
});

// Test endpoint for full pipeline (POST)
app.post('/api/test-pipeline', async (req, res) => {
    try {
        console.log('🧪 Testing full pipeline...');
        
        // Test data
        const testData = {
            fromToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
            toToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',   // USDC
            amount: '1000000000000000000', // 1 WETH
            fromAddress: '0x28C6c06298d514Db089934071355E5743bf21d60' // Test address
        };

        console.log('📊 Test parameters:', testData);

        // Step 1: 1inch Analysis
        console.log('Step 1: Calling 1inch API...');
        const routeAnalysis = await analyze1inchRoute(
            testData.fromToken, 
            testData.toToken, 
            testData.amount, 
            testData.fromAddress
        );
        console.log('✅ 1inch analysis complete');

        // Step 2: Foundry Simulation
        console.log('Step 2: Running Foundry simulation...');
        const simulationResults = await simulateSwap(routeAnalysis);
        console.log('✅ Foundry simulation complete');

        // Step 3: Security Analysis
        console.log('Step 3: Running security analysis...');
        const securityAnalysis = await scanRouterSecurity(routeAnalysis.tx.to);
        console.log('✅ Security analysis complete');

        const result = {
            success: true,
            testData,
            routeAnalysis,
            simulationResults,
            securityAnalysis,
            timestamp: new Date().toISOString()
        };

        console.log('🎉 Pipeline test completed successfully!');
        res.json(result);
    } catch (error) {
        console.error('Pipeline test failed:', error);
        res.status(500).json({ 
            error: 'Pipeline test failed',
            details: error.message 
        });
    }
});

// Test endpoint for full pipeline (GET - easier for testing)
app.get('/api/test-pipeline', async (req, res) => {
    try {
        console.log('🧪 Testing full pipeline (GET)...');
        
        // Test data
        const testData = {
            fromToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
            toToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',   // USDC
            amount: '1000000000000000000', // 1 WETH
            fromAddress: '0x28C6c06298d514Db089934071355E5743bf21d60' // Test address
        };

        console.log('📊 Test parameters:', testData);

        // Step 1: 1inch Analysis
        console.log('Step 1: Calling 1inch API...');
        const routeAnalysis = await analyze1inchRoute(
            testData.fromToken, 
            testData.toToken, 
            testData.amount, 
            testData.fromAddress
        );
        console.log('✅ 1inch analysis complete');

        // Step 2: Foundry Simulation
        console.log('Step 2: Running Foundry simulation...');
        const simulationResults = await simulateSwap(routeAnalysis);
        console.log('✅ Foundry simulation complete');

        // Step 3: Security Analysis
        console.log('Step 3: Running security analysis...');
        const securityAnalysis = await scanRouterSecurity(routeAnalysis.tx.to);
        console.log('✅ Security analysis complete');

        const result = {
            success: true,
            testData,
            routeAnalysis,
            simulationResults,
            securityAnalysis,
            timestamp: new Date().toISOString()
        };

        console.log('🎉 Pipeline test completed successfully!');
        res.json(result);
    } catch (error) {
        console.error('Pipeline test failed:', error);
        res.status(500).json({ 
            error: 'Pipeline test failed',
            details: error.message 
        });
    }
});

app.get('/api/token-info/:address', async (req, res) => {
    try {
        const { address } = req.params;
        // Basic token info endpoint for frontend
        res.json({ address, symbol: 'TOKEN', decimals: 18 });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get token info' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 1inch Aggregator Inspector running on port ${PORT}`);
    console.log(`📊 Visit http://localhost:${PORT} to analyze routes`);
    console.log(`🧪 Test pipeline: GET http://localhost:${PORT}/api/test-pipeline`);
}); 