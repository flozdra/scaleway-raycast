import { ActionPanel, List } from '@raycast/api'
import { catchError, ScalewayAPI } from './scaleway/api'
import { useEffect, useState } from 'react'
import { Database } from './scaleway/types'
import { getCountryImage, getDatabaseStatusIcon } from './utils'
import DatabaseDetails from './databases/database-details'

interface DatabasesState {
  isLoading: boolean
  databases: Database[]
  error?: unknown
}

export default function Databases() {
  const [state, setState] = useState<DatabasesState>({ databases: [], isLoading: true })

  async function fetchDatabases() {
    setState((previous) => ({ ...previous, isLoading: true }))

    try {
      const responses = await Promise.all(
        ScalewayAPI.REGIONS.map((region) =>
          ScalewayAPI.get<{ instances: Database[] }>(`/rdb/v1/regions/${region}/instances`)
        )
      )

      setState((previous) => ({
        ...previous,
        databases: responses.map((r) => r.instances).flat(),
        isLoading: false,
      }))
    } catch (error) {
      await catchError(error)
      setState((previous) => ({
        ...previous,
        error: error instanceof Error ? error : new Error('Something went wrong'),
        isLoading: false,
        databases: [],
      }))
    }
  }

  useEffect(() => {
    fetchDatabases().then()
  }, [])

  return (
    <List isLoading={state.isLoading} isShowingDetail>
      <List.Section title="Instances">
        {state.databases.map((database) => (
          <List.Item
            key={database.id}
            title={database.name}
            icon={getDatabaseStatusIcon(database.status)}
            accessories={[
              {
                icon: getCountryImage(database.region),
                tooltip: database.region,
              },
            ]}
            detail={DatabaseDetails(database)}
            actions={
              <ActionPanel>
                <ActionPanel.Item.OpenInBrowser
                  title="Open in Browser"
                  url={`https://console.scaleway.com/rdb/instances/${database.region}/${database.id}/overview`}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  )
}
