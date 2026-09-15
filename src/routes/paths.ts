export const paths = {
  home: '/',
  settori: {
    list: '/settori',
    detail: (settoreId: string) => `/settori/${settoreId}/aziende`,
  },
  aziende: {
    list: '/aziende',
    detail: (aziendaId: string) => `/aziende/${aziendaId}`,
    persone: {
      list: (aziendaId: string) => `/aziende/${aziendaId}/persone`,
      detail: (aziendaId: string, personaId: string) =>
        `/aziende/${aziendaId}/persone/${personaId}`,
      certificati: {
        list: (aziendaId: string, personaId: string) =>
          `/aziende/${aziendaId}/persone/${personaId}/certificati`,
        detail: (aziendaId: string, personaId: string, certificatoId: string) =>
          `/aziende/${aziendaId}/persone/${personaId}/certificati/${certificatoId}`,
      },
    },
  },
  checklist: {
    list: '/checklist',
    detail: (aziendaId: string) => `/checklist/${aziendaId}`, // <-- Aggiungi questa riga
  },
} as const