import { Mail, MapPinned, Clock } from "lucide-react";
import React from "react";
import { useSiteSettingsQuery } from "../../api";
import { formatPhone } from "../../utils/phoneUtils";
import { useStoreStatus, to12Hour } from "../../hooks/useStoreStatus";

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Information() {
  const { data: settings } = useSiteSettingsQuery();
  const contactDetails = settings?.contactDetails;
  const { isOpen, todaySlot, schedule } = useStoreStatus();

  // Sort schedule by week order
  const sortedSchedule = schedule.length
    ? [...schedule].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))
    : [];

  return (
    <>
      <div className="text-center flex flex-col items-center justify-center py-8 px-4">
        <h3 className="text-[30px] font-bold text-[#2F3E30]">
          Keep in touch with us
        </h3>
        <p className="w-full max-w-[700px] text-[#656766]">
          {settings?.siteSubtitle || 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Expedita quaerat unde quam dolor culpa veritatis inventore, aut commodi eum veniam vel'}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-x-12 lg:gap-x-[120px] px-8 md:px-12 lg:px-[160px] py-[50px]">
        <div className="flex justify-center md:justify-start">
          <div className="flex items-start gap-4">
            <MapPinned
              strokeWidth={0.5}
              size={50}
              className="text-[#5D9063] shrink-0"
            />
            <div>
              <h3 className="font-bold text-[#2F3E30] text-[20px]">Address</h3>
              <p className="text-[#656766] max-w-[250px] py-2">
                {[
                  contactDetails?.location?.street_address,
                  contactDetails?.location?.city,
                  contactDetails?.location?.state
                ].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center md:justify-start">
          <div className="flex items-start gap-4">
            <Mail
              strokeWidth={0.5}
              size={50}
              className="text-[#5D9063] shrink-0"
            />
            <div>
              <h3 className="font-bold text-[#2F3E30] text-[20px]">Contact</h3>
              <div className="text-[#656766] max-w-[250px] py-2">
                <p>Mobile: <span className="font-bold">{formatPhone(contactDetails?.contact)}</span></p>
                <p className="mt-1">E-mail: <a href={`mailto:${contactDetails?.emailAddress}`} className="font-medium text-[#528959] hover:underline">{contactDetails?.emailAddress}</a></p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center md:justify-start">
          <div className="flex items-start gap-4">
            <Clock
              strokeWidth={0.5}
              size={50}
              className="text-[#5D9063] shrink-0"
            />
            <div className="w-full">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-bold text-[#2F3E30] text-[20px]">Hours</h3>
                {/* Live open/closed badge */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  {isOpen ? 'Open Now' : 'Closed'}
                </span>
              </div>
              {sortedSchedule.length > 0 ? (
                <ul className="space-y-1">
                  {sortedSchedule.map((slot) => {
                    const isToday = todaySlot?.day === slot.day;
                    return (
                      <li
                        key={slot.day}
                        className={`flex justify-between text-sm gap-4 ${isToday ? 'font-bold text-[#2F3E30]' : 'text-[#656766]'}`}
                      >
                        <span className="min-w-[80px]">{slot.day.slice(0, 3)}</span>
                        <span>
                          {slot.is_closed
                            ? 'Closed'
                            : `${to12Hour(slot.open_time)} – ${to12Hour(slot.close_time)}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-[#656766] text-sm">No hours available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
