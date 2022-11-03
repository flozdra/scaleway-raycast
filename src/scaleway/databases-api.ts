import { Database } from './types'
import { ScalewayAPI } from './api'

export class DatabasesAPI {
  private static readonly REGIONS = ['fr-par', 'nl-ams', 'pl-waw']

  public static async getAllDatabases(): Promise<Database[]> {
    const responses = await Promise.all(
      DatabasesAPI.REGIONS.map((region) =>
        ScalewayAPI.get<{ instances: Database[] }>(`/rdb/v1/regions/${region}/instances`)
      )
    )
    return responses.map((r) => r.instances).flat()
  }
}
