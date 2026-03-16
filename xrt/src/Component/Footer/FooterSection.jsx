import { COLORS } from "../../config/colors";
import { footer_image } from "../../config/constants";
import Location from "./Location";
import My_Account from './My_Account';
import Categories from "./Categories_Footer";
import Categories_2 from "./Categories_Footer_2";

import { useSiteSettingsQuery } from "../../api/hooks/useSiteSettings";

export default function FooterSection() {
  const { data: settings } = useSiteSettingsQuery();
  return (
    <>
      <div
        className="bg-[#3D6642] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 px-4 py-12 md:px-8 lg:px-[70px]"
        style={{
          backgroundImage: `url(${footer_image.bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="text-[#E1E1E1] text-center md:text-left">
          {settings?.footer_text && (
             <p className="mb-4 text-2xl font-medium leading-7" style={{ color: COLORS.offerYellow }}>
               {settings?.footer_text}
             </p>
          )}
          <span className="font-bold text-[#FFA900] text-[17px] block mb-2">STORE LOCATION</span>
          <ul className="pt-2">
            <Location />
          </ul>
        </div>
        <div className="text-center md:text-left">
            <span className="font-bold text-[#FFA900] text-[17px] block mb-4">QUICK LINKS</span>
            <ul className="pt-0">
                <My_Account/>
            </ul>
        </div>
        <div className="text-center md:text-left">
            <span className="font-bold text-[#FFA900] text-[17px] block mb-4">CATEGORIES</span>
          <ul className="pt-0 grid grid-cols-2 md:grid-cols-1">
            <Categories/>
          </ul>
        </div>
      </div>
      <div className="bg-[#315234] flex flex-col md:flex-row justify-between items-center py-6 md:py-0 md:h-[60px] px-4 md:px-8 lg:px-[70px] gap-4 md:gap-0">
        <h2 className="text-[#E1E1E1] text-[16px] text-center md:text-left">
          {(() => {
            const text = settings?.copyrightText?.replace(/Powered by XRT/i, '').trim() || '';
            const siteLink = settings?.siteLink || '#';
            return (
              <>
                {text} {text && ' '}Powered by{' '}
                <a 
                  href={siteLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-bold hover:underline"
                  style={{ color: COLORS.offerYellow }}
                >
                  XRT
                </a>
              </>
            );
          })()}
        </h2>
        <img src={footer_image.pay} alt="" className="max-w-[200px] md:max-w-none" />
      </div>
    </>
  );
}
