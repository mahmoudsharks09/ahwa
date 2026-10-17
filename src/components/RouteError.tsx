import { Link } from 'react-router-dom'
import { useLang } from '../lib/i18n'

export default function RouteError() {
  const { lang } = useLang()
  return (
    <div className="cafe-missing">
      <h1>{lang === 'ar' ? 'حصلت مشكلة' : 'Something went wrong'}</h1>
      <p>{lang === 'ar' ? 'جرّب تفتح الصفحة تاني.' : 'Try opening the page again.'}</p>
      <Link to="/explore" className="btn" reloadDocument>{lang === 'ar' ? 'ارجع للخريطة' : 'Back to the map'}</Link>
    </div>
  )
}
