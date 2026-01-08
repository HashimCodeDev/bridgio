import type { ConnectionStatus } from '../types'

interface StatusIndicatorProps {
    status: ConnectionStatus
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
    return (
        <div className={`status-indicator ${status.connected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            <span className="status-text">
                {status.connected ? 'Connected' : status.error || 'Disconnected'}
            </span>
        </div>
    )
}
