"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Users,
  Check,
  ExternalLink,
} from "lucide-react";
import { ApiClient } from "@/lib/api/client";

interface ConsultationSlot {
  id: string;
  date_str: string;
  time_slot: string;
  coach_name: string;
  coach_title: string;
  focus_topic: string;
  total_slots: number;
  booked_count: number;
  status: "available" | "limited" | "booked";
  attendee_name?: string;
  meeting_link: string;
}

export default function AppointmentsCalendarPage() {
  const [slots, setSlots] = useState<ConsultationSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("2026-08-25");
  const [selectedSlot, setSelectedSlot] = useState<ConsultationSlot | null>(null);

  // Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingName, setBookingName] = useState("Priya Sharma");
  const [bookingEmail, setBookingEmail] = useState("priya.sharma@example.com");
  const [bookingFocus, setBookingFocus] = useState("A1c & Fasting Glucose Reversal Protocol");
  const [bookingNotes, setBookingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<ConsultationSlot | null>(null);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.get<ConsultationSlot[]>("/api/v1/admin/calendar-slots");
      setSlots(data);
    } catch (err) {
      console.error("Failed to load slots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("annapoorna_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.first_name) setBookingName(`${u.first_name} ${u.last_name || ""}`);
          if (u.email) setBookingEmail(u.email);
        } catch (e) {}
      }
    }
  }, []);

  const datesList = [
    { dateStr: "2026-08-25", day: "Tue", dateNum: "25", slotsCount: 2 },
    { dateStr: "2026-08-26", day: "Wed", dateNum: "26", slotsCount: 1 },
    { dateStr: "2026-08-27", day: "Thu", dateNum: "27", slotsCount: 1 },
    { dateStr: "2026-08-28", day: "Fri", dateNum: "28", slotsCount: 1 },
    { dateStr: "2026-08-29", day: "Sat", dateNum: "29", slotsCount: 0 },
  ];

  const filteredSlots = slots.filter((s) => s.date_str === selectedDate);

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setIsSubmitting(true);
    try {
      const updated = await ApiClient.post<ConsultationSlot>("/api/v1/admin/book-slot", {
        slot_id: selectedSlot.id,
        attendee_name: bookingName,
        attendee_email: bookingEmail,
        consultation_focus: bookingFocus,
        notes: bookingNotes,
      });

      setConfirmedBooking(updated);
      await fetchSlots();
    } catch (err: any) {
      alert(err.message || "Failed to book slot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5ddd3] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C35B32] text-white flex items-center justify-center font-bold text-lg shadow-xs">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-sage-950">
              1-on-1 Consultation & Discovery Calendar
            </h1>
            <p className="text-xs text-sage-500">
              Schedule your private 45-minute clinical lifestyle review with Dr. Maya Rao & certified health coaches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Availability Synced
          </span>
        </div>
      </div>

      {/* 2-Column Calendar & Time Slot Picker Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Date Carousel & Day Picker (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#e5ddd3] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm text-sage-950">August 2026</span>
              <div className="flex items-center gap-1 text-xs text-sage-500">
                <span>Timezone: <strong>EST (UTC-5)</strong></span>
              </div>
            </div>

            {/* Horizontal Date Picker Strip */}
            <div className="grid grid-cols-5 gap-2">
              {datesList.map((d) => (
                <button
                  key={d.dateStr}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    selectedDate === d.dateStr
                      ? "bg-[#C35B32] text-white shadow-xs"
                      : "bg-[#faf7f2] hover:bg-sand-100 text-sage-800 border border-sand-200"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold opacity-80">{d.day}</span>
                  <span className="font-serif text-lg font-bold">{d.dateNum}</span>
                  <div className="flex items-center gap-0.5 mt-1">
                    {d.slotsCount > 0 ? (
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedDate === d.dateStr ? "bg-emerald-300" : "bg-emerald-500"}`}></span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-sand-300"></span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-[#faf7f2] rounded-2xl border border-sand-200 text-xs text-sage-600 space-y-2">
              <span className="font-bold text-sage-800 block text-[11px] uppercase tracking-wider">
                Availability Legend
              </span>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <span className="flex items-center gap-1 font-semibold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
                </span>
                <span className="flex items-center gap-1 font-semibold text-amber-800">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> 1 Slot Left
                </span>
                <span className="flex items-center gap-1 font-semibold text-rose-800">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Booked Out
                </span>
              </div>
            </div>
          </div>

          {/* Physician Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#e5ddd3] shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sand-200 overflow-hidden border border-sand-300 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1594824813633-8987b7a2d488?auto=format&fit=crop&w=200&q=80"
                  alt="Dr. Maya Rao"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-xs text-sage-950">Dr. Maya Rao, MD</h4>
                <p className="text-[11px] text-sage-500">Lead Lifestyle Medicine Physician</p>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block border border-emerald-200">
                  Board Certified • Harvard Lifestyle Med
                </span>
              </div>
            </div>
            <p className="text-xs text-sage-600 font-light leading-relaxed">
              Every consultation includes a thorough review of your fasting blood glucose, A1c history, and customized meal prescriptions.
            </p>
          </div>
        </div>

        {/* Right: Available Time Slots for Selected Date (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-sage-950">
              Available Slots for {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </h3>
            <span className="text-xs text-sage-500">{filteredSlots.length} sessions listed</span>
          </div>

          {loading ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-[#e5ddd3] text-xs text-sage-500">
              Loading calendar availability...
            </div>
          ) : filteredSlots.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-[#e5ddd3] space-y-2">
              <p className="text-xs font-semibold text-sage-800">No available slots for this date.</p>
              <p className="text-xs text-sage-500">Please select another date from the calendar on the left.</p>
            </div>
          ) : (
            filteredSlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-white p-6 rounded-3xl border border-[#e5ddd3] shadow-xs hover:border-[#C35B32] transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C35B32]" />
                    <span className="font-serif font-bold text-base text-sage-950">{slot.time_slot}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      slot.status === "available"
                        ? "bg-emerald-100 text-emerald-900"
                        : slot.status === "limited"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-rose-100 text-rose-900"
                    }`}
                  >
                    {slot.status === "available"
                      ? `🟢 ${slot.total_slots - slot.booked_count} Slots Left`
                      : slot.status === "limited"
                      ? `🟡 1 Slot Left (High Demand)`
                      : "🔴 Fully Booked"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C35B32] block">
                      {slot.focus_topic}
                    </span>
                    <h4 className="text-xs font-bold text-sage-900">{slot.coach_name} • <span className="font-normal text-sage-500">{slot.coach_title}</span></h4>
                    <p className="text-xs text-sage-600 font-light">45-minute secure video consultation with screen sharing and clinical notes.</p>
                  </div>

                  <button
                    disabled={slot.status === "booked"}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setIsBookingModalOpen(true);
                      setConfirmedBooking(null);
                    }}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold shrink-0 transition-all shadow-xs ${
                      slot.status === "booked"
                        ? "bg-sand-200 text-sage-400 cursor-not-allowed"
                        : "bg-[#C35B32] hover:bg-[#4d2aa6] text-white"
                    }`}
                  >
                    {slot.status === "booked" ? "Booked Out" : "Book This Call"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* BOOKING MODAL */}
      {isBookingModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-sage-950/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#e5ddd3] shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-[#e5ddd3] bg-[#faf7f2] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-sage-950">Confirm Consultation Booking</h3>
                <p className="text-xs text-sage-500">{selectedSlot.date_str} • {selectedSlot.time_slot}</p>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="p-2 rounded-full text-sage-400 hover:text-sage-700 hover:bg-sand-200"
              >
                ✕
              </button>
            </div>

            {confirmedBooking ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-sage-950">Appointment Confirmed!</h3>
                <p className="text-xs text-sage-600 leading-relaxed">
                  We have reserved your 45-minute clinical consultation with <strong>{confirmedBooking.coach_name}</strong> on <strong>{confirmedBooking.date_str}</strong> at <strong>{confirmedBooking.time_slot}</strong>.
                </p>

                <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200 text-left text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sage-700">Video Join Link:</span>
                    <a
                      href={confirmedBooking.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C35B32] font-bold flex items-center gap-1 hover:underline"
                    >
                      Open Google Meet <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-sage-500">A calendar invitation and reminder has been dispatched to {bookingEmail}.</p>
                </div>

                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-[#C35B32] text-white text-xs font-semibold shadow-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookSlot} className="p-6 space-y-4">
                <div className="p-3 bg-[#faf7f2] rounded-2xl border border-sand-200 text-xs space-y-1">
                  <span className="font-bold text-sage-800">Specialist: {selectedSlot.coach_name}</span>
                  <p className="text-sage-500 text-[11px]">{selectedSlot.focus_topic}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-sage-800">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-sage-800">Email Address (for calendar invite) *</label>
                  <input
                    type="email"
                    required
                    value={bookingEmail}
                    onChange={(e) => setBookingEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-sage-800">Primary Health Goal or Topic</label>
                  <select
                    value={bookingFocus}
                    onChange={(e) => setBookingFocus(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                  >
                    <option value="A1c & Fasting Glucose Reversal Protocol">A1c & Fasting Glucose Reversal Protocol</option>
                    <option value="Zero-Oil Whole Plant Meal Transition">Zero-Oil Whole Plant Meal Transition</option>
                    <option value="Cardiometabolic & Lipid Optimization">Cardiometabolic & Lipid Optimization</option>
                    <option value="40-Min Postprandial Walking & Habit Loops">40-Min Postprandial Walking & Habit Loops</option>
                    <option value="General Discovery Call">General Lifestyle Discovery Call</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-sage-800">Clinical Notes or Medications (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Current A1c 7.2, taking Metformin 500mg..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand-200">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="px-5 py-2 rounded-full bg-sand-100 hover:bg-sand-200 text-sage-800 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-full bg-[#C35B32] hover:bg-[#4d2aa6] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? "Reserving Slot..." : "Confirm & Book Slot"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
