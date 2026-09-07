// src/lib/utils.ts

export const MESI_ALERT_SCADENZA = 3;

export function isCertificatoInScadenza(dataScadenzaStr: string | null): boolean {
  if (!dataScadenzaStr) return false;
  
  // Puliamo la data odierna azzerando le ore
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);
  
  // Creiamo la data di scadenza (aggiungendo T00:00:00 per forzare l'interpretazione locale)
  const scadenza = new Date(`${dataScadenzaStr}T00:00:00`);
  
  // Calcoliamo la data limite a 6 mesi da oggi
  const limiteScadenza = new Date();
  limiteScadenza.setMonth(oggi.getMonth() + MESI_ALERT_SCADENZA);
  limiteScadenza.setHours(23, 59, 59, 999);
  
  // Restituisce true se la scadenza è minore o uguale al limite (quindi già scaduto o in scadenza)
  return scadenza <= limiteScadenza;
}