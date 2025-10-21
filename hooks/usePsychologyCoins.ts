import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { formatEther } from 'viem'; //  parseEther,
import abi from '../out/PsychologyCoins.sol/PsychologyCoins.json';

const PSYCHOLOGY_COINS_ABI = JSON.parse(JSON.stringify(abi.abi));
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

  // Check if user has completed action before
  const { data: hasCompletedBefore } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PSYCHOLOGY_COINS_ABI,
    functionName: 'hasUserCompletedAction',
    args: address ? [address, ''] : undefined, // You'll pass the actionId when calling
    query: {
      enabled: false,
    },
  });

  return {
    balance: balance && typeof balance === 'bigint' ? formatEther(balance) : '0',
    completeAction,
    uncompleteAction,
    isLoading,
    hasCompletedBefore,
  };
}