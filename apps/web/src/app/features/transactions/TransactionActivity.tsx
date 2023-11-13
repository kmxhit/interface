import { useMemo } from 'react'
import TransactionSummaryLayout from 'src/app/components/transactions/TransactionSummaryLayout'
import { Flex, Loader, ScrollView, Text } from 'ui/src'
import { useFormattedTransactionDataForActivity } from 'wallet/src/features/activity/hooks'
import {
  ActivityItem,
  generateActivityItemRenderer,
} from 'wallet/src/features/transactions/SummaryCards/utils'
import { TransactionDetails } from 'wallet/src/features/transactions/types'

const loadingData: ActivityItem[] = [
  {
    itemType: 'LOADING',
    id: 1,
  },
  {
    itemType: 'LOADING',
    id: 2,
  },
  {
    itemType: 'LOADING',
    id: 3,
  },
  {
    itemType: 'LOADING',
    id: 4,
  },
]

const SectionTitle = ({ title }: { title: string }): JSX.Element => (
  <Flex pb="$spacing12">
    <Text color="$neutral2" variant="subheading2">
      {title}
    </Text>
  </Flex>
)

export function TransactionActivity({ address }: { address: Address }): JSX.Element {
  // TODO EXT-258 merge with local history in followup work
  const { isLoading, sectionData } = useFormattedTransactionDataForActivity(
    address,
    false,
    (_: string, transactions?: TransactionDetails[]) => transactions
  )

  const renderActivityItem = useMemo(() => {
    return generateActivityItemRenderer(
      TransactionSummaryLayout,
      <Loader.Transaction />,
      SectionTitle
    )
  }, [])

  return (
    <ScrollView pt="$spacing8" showsVerticalScrollIndicator={false} width="100%">
      {(isLoading ? loadingData : sectionData ?? []).map((item) => renderActivityItem({ item }))}
    </ScrollView>
  )
}
