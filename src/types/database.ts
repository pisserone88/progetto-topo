export interface Azienda {
  id: string
  nome: string
  created_at?: string
}

export interface Persona {
  id: string
  azienda_id: string
  nome: string
  cognome: string
  created_at?: string
}

export interface Certificato {
  id: string
  persona_id: string
  titolo: string
  data_emissione: string
  data_scadenza?: string | null
  created_at?: string
}
