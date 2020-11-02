import { AxiosInstance } from "axios"
import { AppStore } from "app/store"

export type ServiceProps = {
  api: () => AxiosInstance
  store: AppStore
}

export class ServiceBase {
  private readonly _api: () => AxiosInstance
  get API() {
    return this._api()
  }
  store: AppStore

  constructor(props: ServiceProps) {
    this._api = props.api
    this.store = props.store
  }
}
