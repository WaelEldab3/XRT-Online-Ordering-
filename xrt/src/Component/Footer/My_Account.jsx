import { Link } from 'react-router-dom'
import { MY_ACCOUNT } from '../../config/constants'

export default function My_Account() {
  return (
    <>
        {MY_ACCOUNT.map((info, index) => (
            <li key={index} className="text-[#E1E1E1] py-1 text-[17px] hover:text-[#FFA900] transition-colors duration-200">
                <Link to={info.path} className="cursor-pointer">{info.name}</Link>
            </li>
        ))}
    </>
  )
}
