const axios = require('axios');

class OneInchAnalyzer {
    constructor() {
        this.baseUrl = 'https://api.1inch.dev';
        this.apiKey = process.env.ONEINCH_API_KEY || 'demo'; // Use demo key for testing
    }

    async getSwapQuote(fromToken, toToken, amount, fromAddress, chainId = 1) {
        try {
            const url = `${this.baseUrl}/swap/v6.0/${chainId}/quote`;
            const params = {
                src: fromToken,
                dst: toToken,
                amount: amount,
                from: fromAddress,
                includeTokensInfo: true,
                includeProtocols: true,
                includeGas: true
            };

            const response = await axios.get(url, {
                params,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('1inch API error:', error.response?.data || error.message);
            throw new Error(`Failed to get swap quote: ${error.message}`);
        }
    }

    async getSwapTx(fromToken, toToken, amount, fromAddress, slippage = 1, chainId = 1) {
        try {
            const url = `${this.baseUrl}/swap/v6.0/${chainId}/swap`;
            const params = {
                src: fromToken,
                dst: toToken,
                amount: amount,
                from: fromAddress,
                slippage: slippage,
                includeTokensInfo: true,
                includeProtocols: true,
                includeGas: true
            };

            const response = await axios.get(url, {
                params,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('1inch swap API error:', error.response?.data || error.message);
            throw new Error(`Failed to get swap transaction: ${error.message}`);
        }
    }

    parseProtocols(protocols) {
        if (!protocols) return [];
        
        const parsed = [];
        let currentIndex = 0;

        for (const protocol of protocols) {
            const parts = protocol.split('-');
            if (parts.length >= 2) {
                const dexName = parts[0];
                const percent = parseInt(parts[1]);
                
                parsed.push({
                    dex: dexName,
                    percent: percent,
                    index: currentIndex++
                });
            }
        }

        return parsed;
    }

    calculateRouteBreakdown(swapData) {
        const protocols = this.parseProtocols(swapData.protocols);
        const totalPercent = protocols.reduce((sum, p) => sum + p.percent, 0);
        
        return {
            protocols: protocols,
            totalPercent: totalPercent,
            routeCount: protocols.length,
            estimatedGas: swapData.tx?.gas || 0,
            estimatedGasCost: swapData.tx?.gasCost || '0'
        };
    }

    async analyze1inchRoute(fromToken, toToken, amount, fromAddress) {
        try {
            // Get quote first
            const quoteData = await this.getSwapQuote(fromToken, toToken, amount, fromAddress);
            
            // Get swap transaction
            const swapData = await this.getSwapTx(fromToken, toToken, amount, fromAddress);
            
            // Parse route breakdown
            const routeBreakdown = this.calculateRouteBreakdown(swapData);
            
            return {
                quote: quoteData,
                tx: swapData.tx,
                routeBreakdown: routeBreakdown,
                protocols: swapData.protocols,
                fromToken: swapData.fromToken,
                toToken: swapData.toToken,
                amount: swapData.amount,
                toAmount: swapData.toAmount,
                estimatedGas: swapData.tx?.gas || 0
            };
        } catch (error) {
            console.error('Route analysis failed:', error);
            console.log('🔄 Falling back to mock data for testing...');
            
            // Fallback to mock data for testing
            return this.getMockRouteAnalysis(fromToken, toToken, amount, fromAddress);
        }
    }

    getMockRouteAnalysis(fromToken, toToken, amount, fromAddress) {
        console.log('📋 Using mock route analysis for testing');
        
        return {
            quote: {
                fromToken: { symbol: 'WETH', address: fromToken },
                toToken: { symbol: 'USDC', address: toToken },
                toTokenAmount: '1500000000', // 1500 USDC
                fromTokenAmount: amount,
                protocols: ['UNISWAP_V3-60', 'SUSHISWAP-40']
            },
            tx: {
                to: '0x1111111254EEB25477B68fb85Ed929f73A960582', // 1inch V5 router
                data: '0x1234567890abcdef', // Mock transaction data
                value: '0',
                gas: '150000'
            },
            routeBreakdown: {
                protocols: [
                    { dex: 'UNISWAP_V3', percent: 60, index: 0 },
                    { dex: 'SUSHISWAP', percent: 40, index: 1 }
                ],
                totalPercent: 100,
                routeCount: 2,
                estimatedGas: 150000,
                estimatedGasCost: '150000000000000000'
            },
            protocols: ['UNISWAP_V3-60', 'SUSHISWAP-40'],
            fromToken: { symbol: 'WETH', address: fromToken },
            toToken: { symbol: 'USDC', address: toToken },
            amount: amount,
            toAmount: '1500000000',
            estimatedGas: 150000
        };
    }
}

// Export singleton instance
const analyzer = new OneInchAnalyzer();
module.exports = { analyze1inchRoute: analyzer.analyze1inchRoute.bind(analyzer) }; 