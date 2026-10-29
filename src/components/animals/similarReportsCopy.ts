import type { SimilarReport, SimilarReportReason } from './queries';

/** Por qué se parece: chips de la tarjeta, en el orden que manda el backend (más peso primero). */
export const SIMILAR_REASON_LABELS: Record<SimilarReportReason, string> = {
  same_source: 'Misma publicación',
  same_phone: 'Mismo teléfono',
  same_name: 'Mismo nombre',
  similar_name: 'Nombre parecido',
  very_close: 'Muy cerca',
  close: 'Cerca',
  same_sex: 'Mismo sexo',
  same_color: 'Mismo color',
  same_breed: 'Misma raza',
  similar_description: 'Señas parecidas',
  same_date: 'Misma fecha',
};

const LOST = 'lost';

/** El reporte nuevo es de alguien que busca a su mascota (no de quien la encontró). */
export function isLostReport(status: string | null | undefined) {
  return status === LOST;
}

export function splitSimilarReports(reports: SimilarReport[]) {
  return {
    duplicates: reports.filter((report) => report.kind === 'duplicate'),
    matches: reports.filter((report) => report.kind === 'match'),
  };
}

/** Aviso dentro del formulario (paso «Dónde»). */
export function similarNoticeCopy(reports: SimilarReport[], status: string) {
  const { duplicates, matches } = splitSimilarReports(reports);
  if (duplicates.length) {
    return {
      title:
        duplicates.length === 1
          ? 'Encontramos un reporte parecido cerca'
          : `Encontramos ${duplicates.length} reportes parecidos cerca`,
      description: 'Puede que ya esté reportado. Revísalo antes de publicar para no repetirlo.',
    };
  }
  return isLostReport(status)
    ? {
        title: 'Alguien reportó uno encontrado parecido',
        description: 'Revisa si es tu mascota: podrías encontrarla más rápido.',
      }
    : {
        title: matches.length === 1 ? 'Una familia busca uno parecido' : 'Hay familias buscando uno parecido',
        description: 'Revisa si es el que encontraste para avisarles.',
      };
}

export function similarSectionTitle(kind: SimilarReport['kind'], status: string) {
  if (kind === 'duplicate') return 'Puede que ya esté reportado';
  return isLostReport(status) ? 'Reportaron uno encontrado parecido' : 'Su familia podría estar buscándolo';
}

/** Texto inicial del comentario, que la persona puede editar antes de mandarlo. */
export function similarCommentTemplate(
  report: SimilarReport,
  status: string,
  isOwnPet: boolean,
) {
  const name = report.name && report.name !== 'Sin nombre' ? report.name : '';
  if (report.kind === 'match') {
    return isLostReport(status)
      ? `Creo que es mi mascota${name ? ` (la busco como ${name})` : ''}. `
      : `Creo que lo encontré. Está conmigo y se ve igual al de tu reporte. `;
  }
  if (isLostReport(status) && isOwnPet) {
    return `Yo también estoy buscando a ${name || 'este animal'}. `;
  }
  return `Yo también iba a reportar${name ? ` a ${name}` : ' a este animal'}. `;
}

export function formatSimilarDistance(distanceKm: number | null | undefined) {
  if (distanceKm == null || Number.isNaN(distanceKm)) return null;
  return distanceKm < 1 ? `a ${Math.round(distanceKm * 1000)} m` : `a ${distanceKm.toFixed(1)} km`;
}

/** Solo en perdidos: quién lo publicó (en un encontrado siempre es quien lo encontró). */
export function reportedByLabel(report: Pick<SimilarReport, 'reportedBy' | 'status'>) {
  if (!isLostReport(report.status)) return null;
  return report.reportedBy === 'volunteer' ? 'Reportado por la comunidad' : 'Reportado por su familia';
}
