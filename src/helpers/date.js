
import moment from 'moment'
export function formatDate (date) {
  if (date) {
    return moment(String(date)).format('DD. MM. YYYY')
  }

  return ''
}
export function getLongDateNow () {
  return moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
}
