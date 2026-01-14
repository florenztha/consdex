import React, { useState } from 'react'
import { Rocket, CheckCircle, ExternalLink, Copy, Check, AlertCircle } from 'lucide-react'
import { ethers } from 'ethers'
import { useWallet } from '../hooks/useWallet'
import { NEURA_TESTNET } from '../constants/contracts'
import WalletModal from '../components/WalletModal'

// Simple ERC20 bytecode for deployment
const ERC20_BYTECODE = '0x60806040523480156200001157600080fd5b5060405162000c3838038062000c388339810160408190526200003491620001db565b8351849084906200004d906003906020850190620000a1565b50805162000063906004906020840190620000a1565b50506005805460ff191660ff93909316929092179091555062000088338262000091565b50505062000299565b6001600160a01b038216620000ec5760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015260640160405180910390fd5b8060026000828254620001009190620002a1565b90915550506001600160a01b038216600090815260208190526040812080548392906200012f908490620002a1565b90915550506040518181526001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b634e487b7160e01b600052604160045260246000fd5b600082601f830112620001a157600080fd5b81516001600160401b0380821115620001be57620001be62000179565b604051601f8301601f19908116603f01168101908282118183101715620001e957620001e962000179565b816040528381526020925086838588010111156200020657600080fd5b600091505b838210156200022a57858201830151818301840152908201906200020b565b838211156200023c5760008385830101525b9695505050505050565b600080600080608085870312156200025d57600080fd5b84516001600160401b03808211156200027557600080fd5b62000283888389016200018f565b955060208701519150808211156200029a57600080fd5b50620002a9878288016200018f565b935050604085015160ff81168114620002c157600080fd5b6060959095015193969295505050565b634e487b7160e01b600052601160045260246000fd5b60008219821115620002fd57620002fd620002d1565b500190565b61092b80620003126000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c80633950935111610071578063395093511461012357806370a082311461013657806395d89b411461015f578063a457c2d714610167578063a9059cbb1461017a578063dd62ed3e1461018d57600080fd5b806306fdde03146100ae578063095ea7b3146100cc57806318160ddd146100ef57806323b872dd14610101578063313ce56714610114575b600080fd5b6100b66101c6565b6040516100c391906107a4565b60405180910390f35b6100df6100da3660046107f9565b610258565b60405190151581526020016100c3565b6002545b6040519081526020016100c3565b6100df61010f366004610823565b610270565b604051601281526020016100c3565b6100df6101313660046107f9565b610294565b6100f361014436600461085f565b6001600160a01b031660009081526020819052604090205490565b6100b66102d3565b6100df6101753660046107f9565b6102e2565b6100df6101883660046107f9565b61037c565b6100f361019b366004610881565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b6060600380546101d5906108b4565b80601f0160208091040260200160405190810160405280929190818152602001828054610201906108b4565b801561024e5780601f106102235761010080835404028352916020019161024e565b820191906000526020600020905b81548152906001019060200180831161023157829003601f168201915b5050505050905090565b60003361026681858561038a565b5060019392505050565b60003361027e8582856104ae565b610289858585610540565b506001949350505050565b3360008181526001602090815260408083206001600160a01b038716845290915281205490919061026690829086906102ce9087906108ef565b61038a565b6060600480546101d5906108b4565b3360008181526001602090815260408083206001600160a01b03871684529091528120549091908381101561036f5760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b60648201526084015b60405180910390fd5b610289828686840361038a565b600033610266818585610540565b6001600160a01b0383166103ec5760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b6064820152608401610366565b6001600160a01b03821661044d5760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b6064820152608401610366565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6001600160a01b03838116600090815260016020908152604080832093861683529290522054600019811461053a57818110156105295760405162461bcd60e51b8152602060048201526024808201527f45524332303a207472616e7366657220616d6f756e74206578636565647320616044820152636c6c6f7760e01b6064820152608401610366565b61053a848484840361038a565b50505050565b6001600160a01b0383166105a45760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b6064820152608401610366565b6001600160a01b0382166106065760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b6064820152608401610366565b6001600160a01b0383166000908152602081905260409020548181101561067e5760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b6064820152608401610366565b6001600160a01b038085166000908152602081905260408082208585039055918516815290812080548492906106b59084906108ef565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516106ff91815260200190565b60405180910390a361053a565b600060208083528351808285015260005b818110156107395785810183015185820160400152820161071d565b8181111561074b576000604083870101525b50601f01601f1916929092016040019392505050565b80356001600160a01b038116811461077857600080fd5b919050565b6000806040838503121561079057600080fd5b61079983610761565b946020939093013593505050565b6000806000606084860312156107bc57600080fd5b6107c584610761565b92506107d360208501610761565b9150604084013590509250925092565b6000602082840312156107f557600080fd5b6107fe82610761565b9392505050565b6000806040838503121561081857600080fd5b823561079981610761565b634e487b7160e01b600052601160045260246000fd5b6000821982111561084c5761084c610823565b50019056fea2646970667358221220'

function TokenDeployPage() {
  const { address, isConnected, getProvider } = useWallet()
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedToken, setDeployedToken] = useState(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    totalSupply: '',
    decimals: '18',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleDeploy = async () => {
    if (!formData.name || !formData.symbol || !formData.totalSupply) {
      setError('Please fill in all required fields')
      return
    }

    setIsDeploying(true)
    setError(null)

    try {
      const provider = getProvider()
      const signer = await provider.getSigner()
      
      // Create contract factory
      const factory = new ethers.ContractFactory(
        [
          'constructor(string memory name_, string memory symbol_, uint8 decimals_, uint256 totalSupply_)',
          'function name() view returns (string)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)',
          'function totalSupply() view returns (uint256)',
          'function balanceOf(address) view returns (uint256)',
          'function transfer(address to, uint256 amount) returns (bool)',
          'function approve(address spender, uint256 amount) returns (bool)',
          'function transferFrom(address from, address to, uint256 amount) returns (bool)',
        ],
        ERC20_BYTECODE,
        signer
      )

      const totalSupplyWei = ethers.parseUnits(
        formData.totalSupply,
        parseInt(formData.decimals)
      )

      // Deploy contract
      const contract = await factory.deploy(
        formData.name,
        formData.symbol,
        parseInt(formData.decimals),
        totalSupplyWei
      )

      await contract.waitForDeployment()
      const contractAddress = await contract.getAddress()

      setDeployedToken({
        address: contractAddress,
        name: formData.name,
        symbol: formData.symbol,
        decimals: formData.decimals,
        totalSupply: formData.totalSupply,
      })

      setFormData({
        name: '',
        symbol: '',
        totalSupply: '',
        decimals: '18',
      })
    } catch (err) {
      console.error('Deploy error:', err)
      setError(err.message || 'Failed to deploy token')
    } finally {
      setIsDeploying(false)
    }
  }

  const copyAddress = () => {
    if (deployedToken) {
      navigator.clipboard.writeText(deployedToken.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Rocket className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-4">Deploy Your Token</h1>
        <p className="text-text-secondary mb-6">
          Connect your wallet to deploy custom ERC20 tokens on Neura Testnet.
        </p>
        <button
          onClick={() => setShowWalletModal(true)}
          className="btn-primary"
        >
          Connect Wallet
        </button>
        <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Deploy Token</h1>
        <p className="text-text-secondary">Create and deploy your own ERC20 token</p>
      </div>

      {/* Success Card */}
      {deployedToken && (
        <div className="card mb-6 bg-gradient-to-r from-success/10 to-primary/10 border-success/30">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-success/20 rounded-xl">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-success mb-2">Token Deployed Successfully!</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Name:</span>
                  <span className="font-medium">{deployedToken.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Symbol:</span>
                  <span className="font-medium">{deployedToken.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Supply:</span>
                  <span className="font-medium">{deployedToken.totalSupply}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Contract:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">
                      {deployedToken.address.slice(0, 10)}...{deployedToken.address.slice(-8)}
                    </span>
                    <button onClick={copyAddress} className="p-1 hover:bg-surface rounded">
                      {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <a
                href={`${NEURA_TESTNET.blockExplorer}/token/${deployedToken.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-primary hover:text-secondary transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Form */}
      <div className="card">
        <h3 className="font-semibold text-lg mb-6">Token Details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Token Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., My Awesome Token"
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Token Symbol <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              placeholder="e.g., MAT"
              className="input-field w-full uppercase"
              maxLength={10}
            />
          </div>

          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Total Supply <span className="text-error">*</span>
            </label>
            <input
              type="number"
              name="totalSupply"
              value={formData.totalSupply}
              onChange={handleChange}
              placeholder="e.g., 1000000"
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Decimals
            </label>
            <select
              name="decimals"
              value={formData.decimals}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="18">18 (Standard)</option>
              <option value="8">8</option>
              <option value="6">6</option>
              <option value="0">0</option>
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-error/20 border border-error/30 rounded-xl text-error text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleDeploy}
            disabled={isDeploying || !formData.name || !formData.symbol || !formData.totalSupply}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isDeploying ? (
              <span className="flex items-center justify-center gap-2">
                <Rocket className="w-5 h-5 animate-bounce" />
                Deploying...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Rocket className="w-5 h-5" />
                Deploy Token
              </span>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-surface-light rounded-xl">
          <h4 className="font-medium mb-2">What happens when you deploy?</h4>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• A new ERC20 token contract is created on Neura Testnet</li>
            <li>• All tokens are minted to your wallet address</li>
            <li>• The token is automatically registered on the block explorer</li>
            <li>• You can add liquidity and trade on Constellation DEX</li>
          </ul>
        </div>
      </div>

      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
    </div>
  )
}

export default TokenDeployPage
