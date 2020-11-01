import React from "react"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { AppBar, DevTool } from "app/widgets"
import { store, persistor } from "app/store/store"
import {
  SeApiServiceProvider,
  ThemeProvider,
  SnackbarProvider,
  AxiosProvider,
  AuthProvider,
} from "app/providers"
import { Router } from "app/router"

export function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <SnackbarProvider>
              <AxiosProvider>
                <SeApiServiceProvider>
                  <AuthProvider>
                    <Router />
                  </AuthProvider>
                </SeApiServiceProvider>
              </AxiosProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </div>
  )
}
