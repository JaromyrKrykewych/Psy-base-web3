import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract, useSwitchChain } from 'wagmi';
import { formatEther } from 'viem'; //  parseEther,
import { baseSepolia } from 'wagmi/chains';
import PsychologyCoinsAbi from '../abi/PsychologyCoins.json';

const CONTRACT_ADDRESS = '0xB9b909a81E3E3254F1E7Db59CaA88CA369d8c100'; 
const PSYCHOLOGY_COINS_ABI = JSON.parse(JSON.stringify(PsychologyCoinsAbi.abi));

// Custom hook for network management
export function useNetworkCheck() {
  const { chain } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  const isCorrectNetwork = chain?.id === baseSepolia.id;
  
  const switchToBaseSepolia = useCallback(async () => {
    if (!isCorrectNetwork) {
      try {
        await switchChain({ chainId: baseSepolia.id });
      } catch (error) {
        console.error('Error switching network:', error);
        throw error;
      }
    }
  }, [isCorrectNetwork, switchChain]);

  return {
    isCorrectNetwork,
    currentChain: chain,
    switchToBaseSepolia,
    isSwitching: isPending,
  };
}

// Custom hook for checking action completion status
export function useActionStatus(actionId: string) {
  const { address, chain } = useAccount();
  const isCorrectNetwork = chain?.id === baseSepolia.id;
  
  const { data: hasCompleted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PSYCHOLOGY_COINS_ABI,
    functionName: 'hasUserCompletedAction',
    args: address && actionId ? [address, actionId] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!(address && actionId && isCorrectNetwork),
    },
  });

  const { data: completionCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PSYCHOLOGY_COINS_ABI,
    functionName: 'getCompletionCount',
    args: address && actionId ? [address, actionId] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!(address && actionId && isCorrectNetwork),
    },
  });

  return {
    hasCompleted: !!hasCompleted,
    completionCount: completionCount ? Number(completionCount) : 0,
    isCorrectNetwork,
  };
}

export function usePsychologyCoins() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [isLoading, setIsLoading] = useState(false);
  const { isCorrectNetwork, switchToBaseSepolia, isSwitching } = useNetworkCheck();

  // Get user's coin balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PSYCHOLOGY_COINS_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!address && isCorrectNetwork,
    },
  });

  // Get user's total unique actions completed
  const { data: totalActionsCompleted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PSYCHOLOGY_COINS_ABI,
    functionName: 'getTotalActionsCompleted',
    args: address ? [address] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!address && isCorrectNetwork,
    },
  });

  // Complete an action with network check
  const completeAction = useCallback(async (actionId: string) => {
    if (!address) return;
    
    // Check and switch network if needed
    if (!isCorrectNetwork) {
      await switchToBaseSepolia();
      return; // Exit and let user retry after network switch
    }
    
    setIsLoading(true);
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: PSYCHOLOGY_COINS_ABI,
        functionName: 'completeAction',
        args: [actionId],
        chainId: baseSepolia.id,
      });
      
      // Refetch balance after successful transaction
      setTimeout(() => {
        refetchBalance();
      }, 2000); // Wait 2 seconds for transaction to be mined
      
    } catch (error) {
      console.error('Error completing action:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address, writeContractAsync, refetchBalance, isCorrectNetwork, switchToBaseSepolia]);

  // Function to check if user has completed a specific action
  const checkActionCompleted = useCallback((actionId: string) => {
    if (!address || !actionId) return false;
    // You would need to use this in a separate useReadContract hook
    // or implement it as a separate hook/function
    return false; // Placeholder - implement as needed
  }, [address]);

  // Get completion count for a specific action
  const getCompletionCount = useCallback((actionId: string) => {
    if (!address || !actionId) return 0;
    // This would also need a separate implementation
    return 0; // Placeholder - implement as needed
  }, [address]);

  return {
    // Connection state
    isConnected: !!address,
    address,
    // Network state
    isCorrectNetwork,
    switchToBaseSepolia,
    isSwitching,
    // Data
    balance: balance && typeof balance === 'bigint' ? formatEther(balance) : '0',
    totalActionsCompleted: totalActionsCompleted ? Number(totalActionsCompleted) : 0,
    // Actions
    completeAction,
    isLoading,
    checkActionCompleted,
    getCompletionCount,
  };
}