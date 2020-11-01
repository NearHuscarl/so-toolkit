import { AxiosInstance } from "axios"
import { AppStore } from "app/store"

export type ServiceProps = {
  api: AxiosInstance
  store: AppStore
}

export class ServiceBase {
  API: AxiosInstance
  store: AppStore

  constructor(props: ServiceProps) {
    this.API = props.api
    this.store = props.store
  }
}
