import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import './styles/base.css'
import App from './App'
import Home from './pages/Home'
import { LangProvider } from './lib/i18n'
import RouteError from './components/RouteError'

// The map pages pull in Leaflet and the hours parser, so they load on demand. Route-level lazy loading
// finishes downloading a page before the router starts the page transition, so the transition never waits.
const page = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({ Component: (await load()).default })

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: 'explore', lazy: page(() => import('./pages/Explore')), errorElement: <RouteError /> },
      { path: 'cafe/:id', lazy: page(() => import('./pages/CafePage')), errorElement: <RouteError /> },
      { path: 'saved', lazy: page(() => import('./pages/Saved')) },
      { path: '*', element: <Home /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <RouterProvider router={router} />
    </LangProvider>
  </StrictMode>,
)
