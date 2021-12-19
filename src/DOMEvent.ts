export interface DOMEvent {
    eventName: string
    element: EventTarget
    eventHandler: (e: Event) => void
}