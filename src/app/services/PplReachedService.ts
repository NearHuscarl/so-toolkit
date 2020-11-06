import { PeopleReached } from "app/types"
import { ServiceBase, ServiceProps } from "app/services/ServiceBase"
import { PEOPLE_REACHED_REVISION_ID } from "app/sqlQueries"

export class PplReachedService extends ServiceBase {
  constructor(props: ServiceProps) {
    super({
      api: props.api,
      store: props.store,
    })
  }

  get = (userId: number) => {
    const body = new URLSearchParams(`userID=${userId}`)
    const url = `/query/run/1/1321873/${PEOPLE_REACHED_REVISION_ID}`

    return this.API.post<PeopleReached>(url, body).then(
      (response) => response.data
    )
  }
}
