import React, { useState, useEffect, useCallback } from 'react';

const BookTrainerSession = ({ trainer }) => {
  const [activeTab, setActiveTab] = useState('book'); // 'book' | 'appointments'
  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Booking form state
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [notes, setNotes] = useState('');

  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // ── Fetch trainer availability ──
  const fetchAvailability = useCallback(async () => {
    if (!trainer?._id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/trainer/${trainer._id}/availability`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAvailability(data.workingHours || []);
      } else {
        setAvailability([]);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  }, [trainer?._id]);

  // ── Fetch user appointments ──
  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch('/api/user/appointments', { headers });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
    fetchAppointments();
  }, [fetchAvailability, fetchAppointments]);

  // ── Generate fixed 1-hour slots from availability hours ──
  const generateSlots = (startTime, endTime) => {
    const slots = [];
    let [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const endMinutes = endH * 60 + endM;

    while (startH * 60 + startM + 60 <= endMinutes) {
      const slotStart = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
      const nextH = startH + 1;
      const slotEnd = `${String(nextH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
      slots.push({ start: slotStart, end: slotEnd });
      startH = nextH;
    }
    return slots;
  };

  // ── Get next date for a given day name ──
  const getNextDateForDay = (dayName) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayIndex = today.getDay();
    const targetIndex = days.indexOf(dayName);
    let diff = targetIndex - todayIndex;
    if (diff <= 0) diff += 7; // next week if today or past
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);
    return nextDate.toISOString().split('T')[0];
  };

  // ── Handle day selection ──
  const handleDaySelect = (day) => {
    setSelectedDay(day.day);
    setSelectedSlot('');
    setSelectedDate(getNextDateForDay(day.day));
  };

  // ── Submit appointment request ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !selectedDate) {
      setErrorMsg('Please select a time slot.');
      return;
    }

    const [startTime, endTime] = selectedSlot.split('-');

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await fetch('/api/appointments/request', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          trainerId: trainer._id,
          date: selectedDate,
          startTime,
          endTime,
          notes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg('Appointment requested! Waiting for trainer approval.');
        setSelectedDay('');
        setSelectedSlot('');
        setSelectedDate('');
        setNotes('');
        fetchAppointments(); // Refresh list
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.message || 'Failed to request appointment.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Cancel appointment ──
  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const res = await fetch(`/api/user/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers,
      });
      const data = await res.json();
      if (res.ok) {
        fetchAppointments();
      } else {
        alert(data.message || 'Failed to cancel appointment.');
      }
    } catch (err) {
      alert('Network error while cancelling.');
    }
  };

  // ── Helpers ──
  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sortedAvailability = [...availability].sort(
    (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
  );

  const selectedDayData = availability.find((d) => d.day === selectedDay);
  const availableSlots = selectedDayData
    ? generateSlots(selectedDayData.startTime, selectedDayData.endTime)
    : [];

  return (
    <div className="bg-[#161616] border border-[#333] rounded-lg shadow-lg overflow-hidden">
      {/* ── Header with Tabs ── */}
      <div className="flex items-center border-b border-[#333]">
        <button
          onClick={() => setActiveTab('book')}
          className={`flex-1 py-4 px-5 text-sm font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'book'
              ? 'text-[#8A2BE2] border-[#8A2BE2] bg-[#8A2BE2]/5'
              : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <i className="fas fa-calendar-plus mr-2"></i>Book Session
        </button>
        <button
          onClick={() => { setActiveTab('appointments'); fetchAppointments(); }}
          className={`flex-1 py-4 px-5 text-sm font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'appointments'
              ? 'text-[#8A2BE2] border-[#8A2BE2] bg-[#8A2BE2]/5'
              : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <i className="fas fa-list-check mr-2"></i>My Appointments
          {appointments.filter((a) => a.status === 'pending').length > 0 && (
            <span className="ml-2 bg-yellow-500 text-black text-xs w-5 h-5 rounded-full inline-flex items-center justify-center font-bold">
              {appointments.filter((a) => a.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════ */}
      {/* ── TAB: Book Session ── */}
      {/* ══════════════════════════════════════════ */}
      {activeTab === 'book' && (
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#8A2BE2] border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-400">Loading availability...</span>
            </div>
          ) : availability.length === 0 ? (
            <div className="text-center py-10">
              <div className="inline-block p-4 rounded-full bg-[#222] mb-3">
                <i className="fas fa-calendar-xmark text-gray-500 text-2xl"></i>
              </div>
              <p className="text-gray-300 font-medium">Trainer hasn't set availability yet.</p>
              <p className="text-gray-500 text-sm mt-1">Check back later or contact your trainer.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Step 1: Select Day */}
              <div className="mb-5">
                <label className="block text-gray-300 text-sm font-medium mb-3">
                  <i className="fas fa-calendar-day mr-2 text-[#8A2BE2]"></i>Step 1: Select a Day
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {sortedAvailability.map((day) => (
                    <button
                      key={day.day}
                      type="button"
                      onClick={() => handleDaySelect(day)}
                      className={`py-3 px-2 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                        selectedDay === day.day
                          ? 'bg-[#8A2BE2] text-white border-[#8A2BE2] shadow-lg shadow-[#8A2BE2]/20'
                          : 'bg-[#222] text-gray-300 border-[#444] hover:border-[#8A2BE2]/50 hover:bg-[#2a2a2a]'
                      }`}
                    >
                      <span className="block">{day.day.slice(0, 3)}</span>
                      <span className={`block text-[10px] mt-1 ${selectedDay === day.day ? 'text-white/70' : 'text-gray-500'}`}>
                        {day.startTime}-{day.endTime}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Slot */}
              {selectedDay && (
                <div className="mb-5 animate-in slide-in-from-top-2">
                  <label className="block text-gray-300 text-sm font-medium mb-3">
                    <i className="fas fa-clock mr-2 text-[#8A2BE2]"></i>Step 2: Pick a 1-Hour Slot
                    <span className="text-gray-500 text-xs ml-2">
                      ({selectedDay}, {formatDate(selectedDate)})
                    </span>
                  </label>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {availableSlots.map((slot) => {
                        const slotKey = `${slot.start}-${slot.end}`;
                        return (
                          <button
                            key={slotKey}
                            type="button"
                            onClick={() => setSelectedSlot(slotKey)}
                            className={`py-3 px-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
                              selectedSlot === slotKey
                                ? 'bg-[#8A2BE2] text-white border-[#8A2BE2] shadow-lg shadow-[#8A2BE2]/20'
                                : 'bg-[#222] text-gray-300 border-[#444] hover:border-[#8A2BE2]/50 hover:bg-[#2a2a2a]'
                            }`}
                          >
                            <i className={`fas fa-clock mr-1 text-xs ${selectedSlot === slotKey ? 'text-white/70' : 'text-gray-500'}`}></i>
                            {slot.start} – {slot.end}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No 1-hour slots available for this day.</p>
                  )}
                </div>
              )}

              {/* Step 3: Notes + Submit */}
              {selectedSlot && (
                <div className="animate-in slide-in-from-top-2">
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      <i className="fas fa-sticky-note mr-2 text-[#8A2BE2]"></i>Notes (Optional)
                    </label>
                    <textarea
                      rows="2"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-[#222] border border-[#444] rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#8A2BE2] transition-colors resize-none"
                      placeholder="E.g., I want to focus on deadlift form..."
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-[#1a1a2e] border border-[#8A2BE2]/20 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-[#8A2BE2] mb-2">Session Summary</h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs block">Day</span>
                        <span className="text-white font-medium">{selectedDay}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs block">Date</span>
                        <span className="text-white font-medium">{formatDate(selectedDate)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs block">Time</span>
                        <span className="text-white font-medium">{selectedSlot.replace('-', ' – ')}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#8A2BE2] hover:bg-[#7a1bd2] disabled:bg-[#8A2BE2]/50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-[#8A2BE2]/20 hover:shadow-[#8A2BE2]/40"
                  >
                    {submitting ? (
                      <><i className="fas fa-spinner fa-spin mr-2"></i>Requesting...</>
                    ) : (
                      <><i className="fas fa-paper-plane mr-2"></i>Request Session</>
                    )}
                  </button>
                </div>
              )}

              {/* Messages */}
              {successMsg && (
                <div className="mt-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-3 text-sm flex items-center">
                  <i className="fas fa-check-circle mr-2"></i>{successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm flex items-center">
                  <i className="fas fa-exclamation-circle mr-2"></i>{errorMsg}
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════ */}
      {/* ── TAB: My Appointments ── */}
      {/* ══════════════════════════════════════════ */}
      {activeTab === 'appointments' && (
        <div className="p-5">
          {appointments.length === 0 ? (
            <div className="text-center py-10">
              <div className="inline-block p-4 rounded-full bg-[#222] mb-3">
                <i className="fas fa-calendar text-gray-500 text-2xl"></i>
              </div>
              <p className="text-gray-300 font-medium">No appointments yet.</p>
              <p className="text-gray-500 text-sm mt-1">Book your first session with your trainer!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt._id}
                  className={`bg-[#1e1e1e] border rounded-lg p-4 transition-all duration-200 hover:border-[#555] ${
                    apt.status === 'approved' ? 'border-green-500/30' : 'border-[#333]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    {/* Left: Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${statusColors[apt.status]}`}>
                          {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {formatDate(apt.date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-white font-medium">
                          <i className="fas fa-clock text-[#8A2BE2] mr-1.5 text-xs"></i>
                          {apt.startTime} – {apt.endTime}
                        </span>
                        {apt.trainerId?.name && (
                          <span className="text-gray-400">
                            <i className="fas fa-user-tie text-gray-500 mr-1 text-xs"></i>
                            {apt.trainerId.name}
                          </span>
                        )}
                      </div>

                      {apt.notes && (
                        <p className="text-gray-500 text-xs mt-2 italic">
                          <i className="fas fa-sticky-note mr-1"></i>"{apt.notes}"
                        </p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(apt.status === 'pending') && (
                        <button
                          onClick={() => handleCancel(apt._id)}
                          className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          <i className="fas fa-times mr-1"></i>Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookTrainerSession;
