
export const events = [
    {
        id: '1',
        start: new Date('2024-01-02 18:00:07'),
        end: new Date('2024-01-02 20:00:07'),
        title: 'Cumpleaños del Jonathan',
        notes: 'Alguna nota',
    },
    {
        id: '2',
        start: new Date('2024-11-02 18:00:07'),
        end: new Date('2024-11-02 20:00:07'),
        title: 'Cumpleaños del Melissa',
        notes: 'Alguna nota de Melisa',
    },
];

export const initialState = {
    isLoadingEvents: true,
    events: [],
    activeEvent: null
}

export const calendarWithEventsState = {
    isLoadingEvents: false,
    events: [...events],
    activeEvent: null
}

export const calendarWithActiveEventState = {
    isLoadingEvents: false,
    events: [...events],
    activeEvent: { ...events[0] }
}