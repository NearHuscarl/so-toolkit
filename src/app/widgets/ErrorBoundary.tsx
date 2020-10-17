import React from "react"
import { ApiError } from "app/helpers"

type ErrorContainer = {
  id?: string | number
  name?: string
  message?: string
  error?: Error
  stacktrace: string
}

type ErrorBoundaryState = {
  error?: ErrorContainer
}

type ErrorBoundaryProps = {
  onCatch?: (error: ErrorContainer) => void
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const err = {
      error,
      message: error.message,
      name: error.name,
      stacktrace: errorInfo.componentStack,
    } as ErrorContainer

    if (error instanceof ApiError) {
      err.id = error.id
    }

    console.log("in did catch!!!!")
    this.props.onCatch?.(err)
    // this.setState({ error: err })
  }

  render() {
    return this.props.children
  }
}
