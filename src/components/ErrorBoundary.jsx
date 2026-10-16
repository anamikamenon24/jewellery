import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[Glimmora]', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="glass max-w-md rounded-[2rem] p-10 text-center">
          <p className="eyebrow">Oops</p>
          <h1 className="mt-2 text-4xl font-semibold">A little sparkle slipped</h1>
          <p className="mt-2 text-sm text-muted">Something went wrong on our side. Your bag and wishlist are safe.</p>
          <button onClick={() => (window.location.href = '/home')} className="btn-primary mt-6">Take me home</button>
        </div>
      </div>
    )
  }
}
