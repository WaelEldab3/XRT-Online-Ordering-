import Information from '../Component/Contact/Information'
import ContactForm from '../Component/Contact/Form'
import  LocationSection from '../Component/Contact/LocationSection'

const Contact = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto overflow-hidden">
        <Information />
        <LocationSection />
        <ContactForm />
      </div>
    </div>
  )
}

export default Contact