export interface TranslationEntry {
    id: string
    timestamp: Date
    word: string
    spoken: boolean
}

export interface ConnectionStatus {
    connected: boolean
    error?: string
}
