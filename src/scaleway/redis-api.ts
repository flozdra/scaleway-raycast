import { RedisCluster } from './types'
import { ScalewayAPI } from './api'
import { fakeRedisClusters } from './fake-data/fake-redis'
import { environment } from '@raycast/api'

export class RedisAPI {
  private static readonly ZONES = [
    ...['fr-par-1', 'fr-par-2'],
    ...['nl-ams-1', 'nl-ams-2'],
    ...['pl-waw-1', 'pl-waw-2'],
  ]

  public static async getAllClusters(): Promise<RedisCluster[]> {
    if (environment.isDevelopment) return fakeRedisClusters

    const responses = await Promise.all(
      RedisAPI.ZONES.map((zone) =>
        ScalewayAPI.get<{ clusters: RedisCluster[] }>(`/redis/v1/zones/${zone}/clusters`)
      )
    )
    return responses.map((r) => r.clusters).flat()
  }

  // public static async getClusterMetrics(cluster: RedisCluster): Promise<RedisClusterMetrics[]> {
  //   const response = await ScalewayAPI.get<{ timeseries: RedisClusterMetrics[] }>(
  //     `/redis/v1/zones/${cluster.zone}/clusters/${cluster.id}/metrics`
  //   )
  //   return response.timeseries
  // }
}
