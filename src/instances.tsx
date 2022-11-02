import {
  Action,
  ActionPanel,
  Alert,
  confirmAlert,
  Icon,
  List,
  showToast,
  Toast,
} from '@raycast/api'
import { catchError, ScalewayAPI } from './scaleway/api'
import { useEffect, useState } from 'react'
import { Instance } from './scaleway/types'
import { getCountryImage, getInstanceStateIcon } from './utils'
import InstanceDetails from './instances/instance-details'
import Style = Toast.Style
import ActionStyle = Alert.ActionStyle
import { powerOffInstance, powerOnInstance, rebootInstance } from './instances/instance-actions'

interface InstancesState {
  isLoading: boolean
  instances: Instance[]
  error?: unknown
}

export default function Instances() {
  const [state, setState] = useState<InstancesState>({ instances: [], isLoading: true })

  async function fetchInstances() {
    setState((previous) => ({ ...previous, isLoading: true }))

    try {
      const responses = await Promise.all(
        ScalewayAPI.ZONES.map((zone) =>
          ScalewayAPI.get<{ servers: Instance[] }>(`/instance/v1/zones/${zone}/servers`)
        )
      )

      setState((previous) => ({
        ...previous,
        instances: responses.map((r) => r.servers).flat(),
        isLoading: false,
      }))
    } catch (error) {
      await catchError(error)
      setState((previous) => ({
        ...previous,
        error: error instanceof Error ? error : new Error('Something went wrong'),
        isLoading: false,
        instances: [],
      }))
    }
  }

  useEffect(() => {
    fetchInstances().then()
  }, [])

  async function executeAction(instance: Instance, action: 'poweron' | 'poweroff' | 'reboot') {
    switch (action) {
      case 'poweron':
        if (await powerOnInstance(instance)) await fetchInstances()
        return
      case 'poweroff':
        if (await powerOffInstance(instance)) await fetchInstances()
        return
      case 'reboot':
        if (await rebootInstance(instance)) await fetchInstances()
        return
    }
  }

  return (
    <List isLoading={state.isLoading} isShowingDetail>
      <List.Section title="Instances">
        {state.instances.map((instance) => (
          <List.Item
            key={instance.id}
            title={instance.name}
            icon={getInstanceStateIcon(instance.state)}
            accessories={[
              {
                icon: getCountryImage(instance.zone),
                tooltip: instance.zone,
              },
            ]}
            detail={InstanceDetails(instance)}
            actions={
              <ActionPanel>
                <ActionPanel.Item.OpenInBrowser
                  title="Open in Browser"
                  url={`https://console.scaleway.com/instance/servers/${instance.zone}/${instance.id}/overview`}
                />
                {instance.allowed_actions.includes('reboot') && (
                  <ActionPanel.Item
                    title="Reboot"
                    icon={Icon.RotateClockwise}
                    shortcut={{ modifiers: ['cmd'], key: 'r' }}
                    onAction={async () => await executeAction(instance, 'reboot')}
                  />
                )}
                {instance.allowed_actions.includes('poweron') && (
                  <ActionPanel.Item
                    title="Power On"
                    icon={Icon.Play}
                    shortcut={{ modifiers: ['cmd'], key: 'p' }}
                    onAction={async () => await executeAction(instance, 'poweron')}
                  />
                )}
                {instance.allowed_actions.includes('poweroff') && (
                  <ActionPanel.Item
                    title="Shutdown"
                    icon={Icon.Stop}
                    style={Action.Style.Destructive}
                    shortcut={{ modifiers: ['cmd'], key: 'q' }}
                    onAction={async () => await executeAction(instance, 'poweroff')}
                  />
                )}
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  )
}
