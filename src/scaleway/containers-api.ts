import { Container, ContainerDomain, Namespace } from './types'
import { ScalewayAPI } from './api'

export class ContainersAPI {
  private static readonly REGIONS = ['fr-par', 'nl-ams', 'pl-waw']

  public static async getAllNamespaces(): Promise<Namespace[]> {
    const responses = await Promise.all(
      ContainersAPI.REGIONS.map((region) =>
        ScalewayAPI.get<{ namespaces: Namespace[] }>(
          `/containers/v1beta1/regions/${region}/namespaces`
        )
      )
    )
    return responses.map((r) => r.namespaces).flat()
  }

  public static async getAllContainers(): Promise<Container[]> {
    const responses = await Promise.all(
      ContainersAPI.REGIONS.map((region) =>
        ScalewayAPI.get<{ containers: Container[] }>(
          `/containers/v1beta1/regions/${region}/containers`
        )
      )
    )
    return responses.map((r) => r.containers).flat()
  }

  public static async getAllDomains(): Promise<ContainerDomain[]> {
    const responses = await Promise.all(
      ContainersAPI.REGIONS.map((region) =>
        ScalewayAPI.get<{ domains: ContainerDomain[] }>(
          `/containers/v1beta1/regions/${region}/domains`
        )
      )
    )
    return responses.map((r) => r.domains).flat()
  }

  public static async deployContainer(container: Container): Promise<void> {
    await ScalewayAPI.post(
      `/containers/v1beta1/regions/${container.region}/containers/${container.id}/deploy`
    )
  }

  // public static async getContainerLogs(container: Container): Promise<ContainerLog[]> {
  //   const response = await ScalewayAPI.get<{ logs: ContainerLog[] }>(
  //     `/containers/v1beta1/regions/${container.region}/containers/${container.id}/logs`
  //   )
  //   return response.logs
  // }
}
