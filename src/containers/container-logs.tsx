import { Color, Icon, List } from '@raycast/api'
import { Container, Log } from '../scaleway/types'
import { useEffect, useState } from 'react'
import { catchError, ScalewayAPI } from '../scaleway/api'
import { getLogMarkdown } from '../utils'

interface ContainersState {
  isLoading: boolean
  logs: Log[]
  error?: unknown
}

export default function ContainerLogs(props: { container: Container }) {
  useEffect(() => {
    async function fetchLogs() {
      setState((previous) => ({ ...previous, isLoading: true }))

      try {
        const response = (await ScalewayAPI.get(
          `/containers/v1beta1/regions/${props.container.region}/containers/${props.container.id}/logs`
        )) as { logs: Log[] }

        setState((previous) => ({ ...previous, logs: response.logs, isLoading: false }))
      } catch (error) {
        await catchError(error)
        setState((previous) => ({
          ...previous,
          error: error instanceof Error ? error : new Error('Something went wrong'),
          logs: [],
          isLoading: false,
        }))
      }
    }

    fetchLogs().then()
  }, [])

  const [state, setState] = useState<ContainersState>({ logs: [], isLoading: true })

  return (
    <List
      isShowingDetail
      isLoading={state.isLoading}
      navigationTitle={props.container.name}
      filtering={false}
    >
      {state.logs.map((log) => (
        <List.Item
          key={log.id}
          title={log.message}
          icon={log.level === 'error' ? { source: Icon.Warning, tintColor: Color.Red } : undefined}
          detail={
            <List.Item.Detail
              markdown={getLogMarkdown(log)}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label
                    title="Timestamp"
                    text={new Date(log.timestamp).toLocaleString('en-US', {
                      dateStyle: 'full',
                      timeStyle: 'long',
                    })}
                  />
                  {log.level && <List.Item.Detail.Metadata.Label title="Level" text={log.level} />}
                  {log.source && (
                    <List.Item.Detail.Metadata.Label title="Source" text={log.source} />
                  )}
                  {log.stream && (
                    <List.Item.Detail.Metadata.Label title="Stream" text={log.stream} />
                  )}
                </List.Item.Detail.Metadata>
              }
            />
          }
        />
      ))}
    </List>
  )
}
