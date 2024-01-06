import EventListener from 'node:events'

// create event listener
const eventListener = new EventListener()

eventListener.on('event', () => {
    console.log('an event occurred!')
})

// emit the event
eventListener.emit('event')
