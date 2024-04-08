import { useEffect, useRef, useState } from 'react'
import { TFetchTransactionsResponse, TUseTransactionsTransfer } from '@renderer/@types/hooks'
import { IAccountState } from '@renderer/@types/store'
import { useQueries } from '@tanstack/react-query'

import { useAccountsSelector } from './useAccountSelector'
import { useBsAggregator } from './useBsAggregator'

type TProps = {
  accounts: IAccountState[]
}

export const useTransactions = ({ accounts }: TProps) => {
  const { bsAggregator } = useBsAggregator()
  const { accountsRef: allAccountRef } = useAccountsSelector()
  const [page, setPage] = useState(1)

  const combinedQueries = useQueries({
    queries: accounts.map(account => ({
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryKey: ['transactions', account.address, page],
      queryFn: async (): Promise<TFetchTransactionsResponse> => {
        const service = bsAggregator.getBlockchainByName(account.blockchain)
        try {
          const data = await service.blockchainDataService.getTransactionsByAddress({
            address: account.address,
            page,
          })
          const totalPages = Math.ceil(data.totalCount / data.limit)

          const transfers: TUseTransactionsTransfer[] = []
          data.transactions.forEach(transaction => {
            transaction.transfers.forEach(transfer => {
              if (transfer.type === 'nft') return

              transfers.push({
                ...transfer,
                time: transaction.time,
                hash: transaction.hash,
                account,
                toAccount: allAccountRef.current.find(a => a.address === transfer.to),
                fromAccount: allAccountRef.current.find(a => a.address === transfer.from),
              })
            })
          })

          return {
            transfers,
            hasMore: page < totalPages,
            page,
          }
        } catch {
          return {
            transfers: [],
            hasMore: false,
            page,
          }
        }
      },
      gcTime: 1 * 60 * 1000, // 1 minute
      staleTime: 1 * 60 * 1000, // 1 minute
    })),
    combine: results => {
      return {
        data: results
          .map(result => result.data?.transfers)
          .flat()
          .filter((transaction): transaction is TUseTransactionsTransfer => !!transaction),
        isLoading: results.some(result => result.isLoading),
        hasMore: results.some(result => result.data?.hasMore),
      }
    },
  })

  const [transfers, setTransfers] = useState<TUseTransactionsTransfer[]>(combinedQueries.data)
  const [isLoading, setIsLoading] = useState(combinedQueries.isLoading)
  const dataRef = useRef<TFetchTransactionsResponse[]>([
    {
      hasMore: combinedQueries.hasMore,
      page: 1,
      transfers: combinedQueries.data,
    },
  ])

  const fetchNextPage = () => {
    const last = dataRef.current[dataRef.current.length - 1]

    if (!last || !last.hasMore) return

    setPage(prev => prev + 1)
  }

  useEffect(() => {
    if (combinedQueries.isLoading) {
      return
    }

    if (dataRef.current.some(item => item.page === page)) {
      dataRef.current = dataRef.current.map(item => {
        if (item.page === page) {
          return {
            transfers: combinedQueries.data,
            hasMore: combinedQueries.hasMore,
            page,
          }
        }

        return item
      })
    } else {
      dataRef.current.push({
        transfers: combinedQueries.data,
        hasMore: combinedQueries.hasMore,
        page,
      })
    }

    setTransfers(dataRef.current.map(item => item.transfers).flat())
    setIsLoading(false)
  }, [combinedQueries, page])

  return {
    transfers,
    fetchNextPage,
    isLoading,
  }
}