import { auditTone } from '@/components/review/auditData';
export default function AuditRow({ row, index, checked, toggle, onReview, onHover }) {
  return <tr className="dt1-row" style={{'--dt1-i':index}} data-dt1-row data-order={row.milestone} data-customer={row.label} data-total={row.lessonCount} data-status={row.decision} data-dt1-sel={checked ? '1' : '0'} onPointerEnter={onHover}>
    <td className="dt1-cell dt1-cell--pick"><span className="dt1-rowline" aria-hidden="true"/><input type="checkbox" className="dt1-check-input" aria-label={`Select ${row.label}`} checked={checked} onChange={toggle}/></td>
    <td className="dt1-cell"><button className="dt1-name" onClick={() => onReview(row)}>{row.label}</button><p className="dt1-detail">{row.blurb}</p></td>
    <td className="dt1-cell"><p>{row.chapterLabel}</p><p className="dt1-detail">{row.move}</p><p className="dt1-detail">{row.audit}</p>{row.note && <p className="dt1-detail">Owner note: {row.note}</p>}</td>
    <td className="dt1-cell"><span className="dt1-badge capitalize" style={auditTone(row.decision)}>{row.decision}</span></td>
  </tr>;
}