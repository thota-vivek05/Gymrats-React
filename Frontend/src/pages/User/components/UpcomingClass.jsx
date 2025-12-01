import React from 'react';

const UpcomingClass = ({ upcomingClass }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const isToday = (dateString) => {
        const today = new Date();
        const classDate = new Date(dateString);
        return classDate.toDateString() === today.toDateString();
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-center p-5 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">Upcoming Class</h2>
                {upcomingClass && (
                    <span className="bg-[#8A2BE2]/20 text-[#8A2BE2] text-xs px-3 py-1 rounded-full border border-[#8A2BE2]/30">
                        {isToday(upcomingClass.date) ? 'Today' : 'Soon'}
                    </span>
                )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col gap-5">
                {upcomingClass ? (
                    <>
                        <div className="flex flex-col sm:flex-row gap-5">
                            <div className="bg-white/5 p-3 rounded text-center min-w-[120px] border border-white/5">
                                <span className="block text-xl font-bold text-[#8A2BE2] mb-1">{upcomingClass.time}</span>
                                <span className="block text-sm text-gray-400">{formatDate(upcomingClass.date)}</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-1">{upcomingClass.name}</h3>
                                <p className="text-gray-400 text-sm">with {upcomingClass.trainerName || 'Coach'}</p>
                            </div>
                        </div>

                        {upcomingClass.description && (
                            <div className="text-gray-300 text-sm leading-relaxed bg-white/5 p-3 rounded">
                                <p>{upcomingClass.description}</p>
                            </div>
                        )}

                        <div className="mt-2">
                            <h4 className="text-white font-medium mb-3">Prepare for class:</h4>
                            <ul className="space-y-2">
                                {['Clear workout space', 'Water bottle ready', 'Test camera and microphone'].map((item, i) => (
                                    <li key={i} className="flex items-center text-gray-400 text-sm pl-2">
                                        <span className="text-[#8A2BE2] mr-2 text-lg">•</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-auto pt-4">
                            {upcomingClass.meetLink ? (
                                <a 
                                    href={upcomingClass.meetLink} 
                                    className="flex items-center justify-center w-full py-3 bg-[#8A2BE2] hover:bg-[#7B1FA2] text-white rounded font-medium transition-colors" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    <i className="fas fa-video mr-2"></i> Join Class
                                </a>
                            ) : (
                                <button className="flex items-center justify-center w-full py-3 bg-gray-700 text-gray-400 rounded font-medium cursor-not-allowed opacity-70" disabled>
                                    <i className="fas fa-video mr-2"></i> Link Not Available
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                        <p className="text-white text-lg mb-2">No upcoming classes scheduled.</p>
                        <p className="text-gray-500 text-sm">Check back later for new class schedules!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingClass; 