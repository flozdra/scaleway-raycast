import { ActionPanel, confirmAlert, Icon, List, showToast, Toast } from '@raycast/api'
import { getContainerStatusIcon, getCountryImage, getPrivacyAccessory } from './utils'
import { catchError, ScalewayAPI } from './scaleway/api'
import { useEffect, useMemo, useState } from 'react'
import { Container, ContainerDomain, Namespace } from './scaleway/types'
import ContainerDetails from './containers/container-details'
import { ContainersAPI } from './scaleway/containers-api'
import Style = Toast.Style

interface ContainersState {
  isLoading: boolean
  namespaces: (Namespace & { containers: (Container & { domains: ContainerDomain[] })[] })[]
  selectedNamespaceId?: string | undefined
  error?: unknown
}

export default function Containers() {
  const [state, setState] = useState<ContainersState>({ namespaces: [], isLoading: true })

  async function deployContainer(container: Container) {
    try {
      if (await confirmAlert({ title: 'Are you sure you want to deploy a new container?' })) {
        await showToast({
          title: 'Deploying a Container',
          message: container.name,
          style: Style.Animated,
        })

        await ContainersAPI.deployContainer(container)

        await showToast({
          title: 'Container successfully deployed',
          message: container.name,
          style: Style.Success,
        })

        await fetchContainers()
      }
    } catch (error) {
      await catchError(error, 'Error while deploying a container')
    }
  }

  async function fetchContainers() {
    setState((previous) => ({ ...previous, isLoading: true }))

    const allNamespaces: ContainersState['namespaces'] = []

    try {
      const [namespaces, containers, domains] = await Promise.all([
        ContainersAPI.getAllNamespaces(),
        ContainersAPI.getAllContainers(),
        ContainersAPI.getAllDomains(),
      ])

      // Regroup containers by namespace and add domains to each container
      allNamespaces.push(
        ...namespaces.map((namespace) => ({
          ...namespace,
          containers: containers
            .filter((c) => c.namespace_id === namespace.id)
            .map((container) => ({
              ...container,
              domains: domains.filter((d) => d.container_id === container.id),
            })),
        }))
      )

      setState((previous) => ({
        ...previous,
        namespaces: allNamespaces,
        selectedNamespaceId: allNamespaces[0]?.id,
        isLoading: false,
      }))
    } catch (error) {
      await catchError(error)
      setState((previous) => ({
        ...previous,
        error: error instanceof Error ? error : new Error('Something went wrong'),
        isLoading: false,
        selectedNamespaceId: undefined,
        namespaces: [],
      }))
    }
  }

  useEffect(() => {
    fetchContainers().then()
  }, [])

  const selectedNamespace = useMemo(() => {
    return state.namespaces.find((n) => n.id === state.selectedNamespaceId)
  }, [state.namespaces, state.selectedNamespaceId])

  return (
    <List
      isLoading={state.isLoading}
      isShowingDetail
      searchBarAccessory={
        <List.Dropdown
          tooltip="Select Namespace"
          storeValue={true}
          onChange={(newValue) => {
            setState((previous) => ({ ...previous, selectedNamespaceId: newValue }))
          }}
        >
          <List.Dropdown.Section title="Namespaces">
            {state.namespaces.map((namespace) => (
              <List.Dropdown.Item
                key={namespace.id}
                title={namespace.name}
                value={namespace.id}
                icon={getCountryImage(namespace.region)}
              />
            ))}
          </List.Dropdown.Section>
        </List.Dropdown>
      }
    >
      {selectedNamespace && (
        <List.Section key={selectedNamespace.id} title={selectedNamespace.name}>
          {selectedNamespace.containers.map((container) => (
            <List.Item
              key={container.id}
              title={container.name}
              icon={getContainerStatusIcon(container.status)}
              accessories={[getPrivacyAccessory(container.privacy)]}
              detail={ContainerDetails(container)}
              actions={
                <ActionPanel>
                  <ActionPanel.Item.OpenInBrowser url={getContainerUrl(container)} />
                  <ActionPanel.Item.CopyToClipboard content={getContainerUrl(container)} />
                  <ActionPanel.Item
                    title="Deploy a Container"
                    icon={Icon.Plus}
                    shortcut={{ modifiers: ['cmd'], key: 'n' }}
                    onAction={async () => await deployContainer(container)}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  )
}

function getContainerUrl(container: Container) {
  return `${ScalewayAPI.CONSOLE_URL}/containers/namespaces/${container.region}/${container.namespace_id}/containers/${container.id}/deployment`
}
