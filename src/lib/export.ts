// "Export your medical data" (Figma settings): a readable text summary the
// person can share with a doctor or keep. Pure, so it is tested with Node.

import { formatValue, METRIC_INFO, type Entry } from './health-log.ts';
import { formatDob, normalizePhone, type MedicalId } from './medical-id.ts';
import { formatTime, type MedsData } from './meds.ts';

export function exportText(id: MedicalId, log: Entry[], meds: MedsData, now = new Date()): string {
  const line = (label: string, value: string) => (value.trim() ? `${label}: ${value.trim()}` : '');
  const phone = (p: string) => {
    const r = normalizePhone(p);
    return r.ok ? r.display : p;
  };
  const parts: string[] = [];
  parts.push('RUSH HEALTH SUMMARY', `Exported ${now.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}`, '');
  parts.push(
    'MEDICAL ID',
    ...[
      line('Name', id.name),
      line('Date of birth', formatDob(id.dateOfBirth)),
      line('Sex', id.sex),
      line('Phone', id.phone ? phone(id.phone) : ''),
      line('Location', id.location),
      line('Blood group', id.bloodGroup),
      line('Sickle cell status', id.sickleCell),
      line('Allergies', id.allergies),
      line('Conditions', id.conditions),
      line('Medicines', id.medications),
      line('Other', id.notes),
      line('Emergency contact', [id.contact.name, id.contact.relationship && `(${id.contact.relationship})`, id.contact.phone && phone(id.contact.phone)].filter(Boolean).join(' ')),
    ].filter(Boolean),
    '',
  );
  if (meds.meds.length) {
    parts.push('MEDICINES', ...meds.meds.map((m) => `- ${m.name}${m.dose ? `, ${m.dose}` : ''} at ${m.times.map(formatTime).join(', ')}${m.endDate ? ` (until ${m.endDate})` : ''}${m.notes ? `. ${m.notes}` : ''}`), '');
  }
  if (log.length) {
    parts.push('HEALTH LOG (most recent first)');
    for (const e of log.slice(0, 200)) {
      const when = new Date(e.at).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const value = e.metric === 'symptom' ? [e.note, formatValue(e)].filter(Boolean).join(', ') : `${formatValue(e)}${e.fasting ? ' (fasting)' : ''}${e.note ? `, ${e.note}` : ''}`;
      parts.push(`- ${when}  ${METRIC_INFO[e.metric].label}: ${value}`);
    }
    parts.push('');
  }
  parts.push('Recorded by the person in the Rush app. Not a clinical record.');
  return parts.join('\n');
}
