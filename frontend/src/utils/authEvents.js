/**
 * Custom events for authentication state changes
 * The native 'storage' event only fires when localStorage changes in OTHER windows/tabs,
 * so we need custom events for same-window token changes
 */

export const AUTH_TOKEN_CHANGED = 'authTokenChanged'

/**
 * Dispatch event when token changes (login/logout)
 */
export const dispatchAuthTokenChanged = () => {
  window.dispatchEvent(new CustomEvent(AUTH_TOKEN_CHANGED, {
    detail: { token: localStorage.getItem('token') }
  }))
  // Also dispatch storage event for components that listen to it
  window.dispatchEvent(new Event('storage'))
}
