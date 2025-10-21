import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { formatEther } from 'viem'; //  parseEther,
import PsychologyCoinsAbi from '../abi/PsychologyCoins.json';

// Custom hook for checking action completion status
export function useActionStatus(actionId: string) {
  const { address } = useAccount();
  
  const { data: hasCompleted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PSYCHOLOGY_COINS_ABI,
    functionName: 'hasUserCompletedAction',
    args: address && actionId ? [address, actionId] : undefined,
    query: {
      enabled: !!(address && actionId),
    },
  });

  const { data: completionCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PSYCHOLOGY_COINS_ABI,
    functionName: 'getCompletionCount',
    args: address && actionId ? [address, actionId] : undefined,
    query: {
      enabled: !!(address && actionId),
    },
  });

  return {
    hasCompleted: !!hasCompleted,
    completionCount: completionCount ? Number(completionCount) : 0,
  };
}

const PSYCHOLOGY_COINS_ABI = JSON.parse(JSON.stringify(PsychologyCoinsAbi.abi));
const CONTRACT_ADDRESS = '0xB9b909a81E3E3254F1E7Db59CaA88CA369d8c100'; 

export function usePsychologyCoins() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const [isLoading, setIsLoading] = useState(false);

  // Get user's coin balance
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PSYCHOLOGY_COINS_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Get user's total unique actions completed
  const { data: totalActionsCompleted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PSYCHOLOGY_COINS_ABI,
    functionName: 'getTotalActionsCompleted',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Complete an action
  const completeAction = useCallback(async (actionId: string) => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: PSYCHOLOGY_COINS_ABI,
        functionName: 'completeAction',
        args: [actionId],
      });
    } catch (error) {
      console.error('Error completing action:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address, writeContract]);

  // Uncomplete an action
  const uncompleteAction = useCallback(async (actionId: string) => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: PSYCHOLOGY_COINS_ABI,
        functionName: 'uncompleteAction',
        args: [actionId],
      });
    } catch (error) {
      console.error('Error uncompleting action:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address, writeContract]);

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
    // Data
    balance: balance && typeof balance === 'bigint' ? formatEther(balance) : '0',
    totalActionsCompleted: totalActionsCompleted ? Number(totalActionsCompleted) : 0,
    // Actions
    completeAction,
    uncompleteAction,
    isLoading,
    checkActionCompleted,
    getCompletionCount,
  };
}