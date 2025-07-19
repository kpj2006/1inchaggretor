const axios = require('axios');

class SecurityScanner {
    constructor() {
        this.etherscanApiKey = process.env.ETHERSCAN_API_KEY;
        this.baseUrl = 'https://api.etherscan.io/api';
    }

    async scanRouterSecurity(routerAddress) {
        try {
            console.log(`🔒 Scanning router security for: ${routerAddress}`);
            
            if (!routerAddress) {
                return this.getDefaultSecurityReport();
            }

            // Get contract source code
            const sourceCode = await this.getContractSourceCode(routerAddress);
            
            // Get contract bytecode
            const bytecode = await this.getContractBytecode(routerAddress);
            
            // Analyze contract security
            const securityAnalysis = await this.analyzeContractSecurity(
                routerAddress, 
                sourceCode, 
                bytecode
            );
            
            return securityAnalysis;
        } catch (error) {
            console.error('Security scan failed:', error);
            return this.getDefaultSecurityReport(error.message);
        }
    }

    async getContractSourceCode(address) {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    module: 'contract',
                    action: 'getsourcecode',
                    address: address,
                    apikey: this.etherscanApiKey
                }
            });

            const data = response.data;
            if (data.status === '1' && data.result && data.result.length > 0) {
                return data.result[0];
            }
            
            return null;
        } catch (error) {
            console.error('Failed to get source code:', error);
            return null;
        }
    }

    async getContractBytecode(address) {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    module: 'proxy',
                    action: 'eth_getCode',
                    address: address,
                    apikey: this.etherscanApiKey
                }
            });

            return response.data.result;
        } catch (error) {
            console.error('Failed to get bytecode:', error);
            return null;
        }
    }

    async analyzeContractSecurity(address, sourceCode, bytecode) {
        const analysis = {
            address: address,
            isVerified: false,
            isProxy: false,
            riskScore: 0,
            riskFactors: [],
            securityChecks: {},
            recommendations: []
        };

        // Check if contract is verified
        if (sourceCode && sourceCode.SourceCode) {
            analysis.isVerified = true;
            analysis.securityChecks.verified = true;
        } else {
            analysis.riskScore += 20;
            analysis.riskFactors.push('Contract not verified');
            analysis.recommendations.push('Contract source code is not verified on Etherscan');
        }

        // Check for proxy patterns
        const proxyPatterns = this.detectProxyPatterns(sourceCode, bytecode);
        analysis.isProxy = proxyPatterns.isProxy;
        analysis.securityChecks.proxy = proxyPatterns;

        if (proxyPatterns.isProxy) {
            analysis.riskScore += 10;
            analysis.riskFactors.push('Contract uses proxy pattern');
            analysis.recommendations.push('Verify proxy implementation and admin controls');
        }

        // Analyze dangerous opcodes
        const dangerousOpcodes = this.analyzeDangerousOpcodes(bytecode);
        analysis.securityChecks.dangerousOpcodes = dangerousOpcodes;

        if (dangerousOpcodes.length > 0) {
            analysis.riskScore += dangerousOpcodes.length * 15;
            analysis.riskFactors.push(`Contains ${dangerousOpcodes.length} dangerous opcodes`);
            analysis.recommendations.push('Review dangerous opcodes: ' + dangerousOpcodes.join(', '));
        }

        // Check for delegatecall usage
        if (dangerousOpcodes.includes('delegatecall')) {
            analysis.riskScore += 25;
            analysis.riskFactors.push('Uses delegatecall - high risk');
            analysis.recommendations.push('Delegatecall allows arbitrary code execution - extreme caution required');
        }

        // Check for selfdestruct usage
        if (dangerousOpcodes.includes('selfdestruct')) {
            analysis.riskScore += 30;
            analysis.riskFactors.push('Contains selfdestruct - critical risk');
            analysis.recommendations.push('Selfdestruct can destroy contract and funds - avoid');
        }

        // Analyze source code for security issues
        if (sourceCode && sourceCode.SourceCode) {
            const sourceAnalysis = this.analyzeSourceCode(sourceCode.SourceCode);
            analysis.securityChecks.sourceCode = sourceAnalysis;
            
            if (sourceAnalysis.issues.length > 0) {
                analysis.riskScore += sourceAnalysis.issues.length * 5;
                analysis.riskFactors.push(`Source code has ${sourceAnalysis.issues.length} potential issues`);
            }
        }

        // Determine risk level
        analysis.riskLevel = this.getRiskLevel(analysis.riskScore);
        
        return analysis;
    }

    detectProxyPatterns(sourceCode, bytecode) {
        const patterns = {
            isProxy: false,
            pattern: null,
            implementation: null,
            admin: null
        };

        if (!sourceCode || !sourceCode.SourceCode) {
            return patterns;
        }

        const source = sourceCode.SourceCode.toLowerCase();
        
        // Check for EIP-1967 proxy pattern
        if (source.includes('eip1967') || source.includes('_implementation') || source.includes('_admin')) {
            patterns.isProxy = true;
            patterns.pattern = 'EIP-1967';
        }
        
        // Check for OpenZeppelin TransparentUpgradeableProxy
        if (source.includes('transparentupgradeableproxy') || source.includes('transparentproxy')) {
            patterns.isProxy = true;
            patterns.pattern = 'TransparentUpgradeableProxy';
        }
        
        // Check for UUPS proxy
        if (source.includes('uups') || source.includes('upgradeable')) {
            patterns.isProxy = true;
            patterns.pattern = 'UUPS';
        }

        return patterns;
    }

    analyzeDangerousOpcodes(bytecode) {
        if (!bytecode) return [];

        const dangerousOpcodes = [
            'delegatecall', 'callcode', 'selfdestruct', 'suicide',
            'create', 'create2', 'staticcall'
        ];

        const found = [];
        const bytecodeLower = bytecode.toLowerCase();

        dangerousOpcodes.forEach(opcode => {
            if (bytecodeLower.includes(opcode)) {
                found.push(opcode);
            }
        });

        return found;
    }

    analyzeSourceCode(sourceCode) {
        const analysis = {
            issues: [],
            functions: [],
            modifiers: []
        };

        const source = sourceCode.toLowerCase();

        // Check for common security issues
        const securityIssues = [
            { pattern: 'reentrancy', description: 'Potential reentrancy vulnerability' },
            { pattern: 'unchecked', description: 'Unchecked arithmetic operations' },
            { pattern: 'delegatecall', description: 'Dangerous delegatecall usage' },
            { pattern: 'selfdestruct', description: 'Selfdestruct function present' },
            { pattern: 'suicide', description: 'Suicide function present' },
            { pattern: 'tx.origin', description: 'Using tx.origin instead of msg.sender' },
            { pattern: 'block.timestamp', description: 'Using block.timestamp for randomness' },
            { pattern: 'block.number', description: 'Using block.number for randomness' }
        ];

        securityIssues.forEach(issue => {
            if (source.includes(issue.pattern)) {
                analysis.issues.push(issue.description);
            }
        });

        return analysis;
    }

    getRiskLevel(riskScore) {
        if (riskScore >= 80) return 'CRITICAL';
        if (riskScore >= 60) return 'HIGH';
        if (riskScore >= 40) return 'MEDIUM';
        if (riskScore >= 20) return 'LOW';
        return 'SAFE';
    }

    getDefaultSecurityReport(error = null) {
        return {
            address: 'Unknown',
            isVerified: false,
            isProxy: false,
            riskScore: 50,
            riskLevel: 'MEDIUM',
            riskFactors: ['Unable to analyze contract'],
            securityChecks: {
                verified: false,
                proxy: { isProxy: false, pattern: null },
                dangerousOpcodes: [],
                sourceCode: { issues: [] }
            },
            recommendations: [
                'Unable to perform security analysis',
                'Consider manual review of contract',
                'Verify contract address is correct'
            ],
            error: error
        };
    }
}

const securityScanner = new SecurityScanner();
module.exports = { scanRouterSecurity: securityScanner.scanRouterSecurity.bind(securityScanner) }; 