
import moment from 'moment'
export function formatDate (date) {
  if (date) {
    return moment(String(date)).format('DD. MM. YYYY')
  }

  return ''
}
