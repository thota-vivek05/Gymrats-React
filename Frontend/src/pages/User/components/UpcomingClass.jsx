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
        <div className="dashboard-card">
            <div className="card-header">
                <h2>Upcoming Class</h2>
                {upcomingClass && (
                    <span className="badge">
                        {isToday(upcomingClass.date) ? 'Today' : 'Soon'}
                    </span>
                )}
            </div>
            <div className="class-content">
                {upcomingClass ? (
                    <>
                        <div className="class-details">
                            <div className="class-time">
                                <span className="time">{upcomingClass.time}</span>
                                <span className="date">{formatDate(upcomingClass.date)}</span>
                            </div>
                            <div className="class-info">
                                <h3>{upcomingClass.name}</h3>
                                <p>with {upcomingClass.trainerName || 'Coach'}</p>
                            </div>
                        </div>

                        {upcomingClass.description && (
                            <div className="class-description">
                                <p>{upcomingClass.description}</p>
                            </div>
                        )}

                        <div className="class-checklist">
                            <h4>Prepare for class:</h4>
                            <ul>
                                <li>Clear workout space</li>
                                <li>Water bottle ready</li>
                                <li>Test camera and microphone</li>
                            </ul>
                        </div>

                        {upcomingClass.meetLink ? (
                            <a href={upcomingClass.meetLink} className="class-join-btn" target="_blank" rel="noopener noreferrer">
                                <i className="fas fa-video"></i> Join Class
                            </a>
                        ) : (
                            <button className="class-join-btn" disabled>
                                <i className="fas fa-video"></i> Link Not Available
                            </button>
                        )}
                    </>
                ) : (
                    <div className="no-class-message">
                        <p>No upcoming classes scheduled.</p>
                        <p className="subtext">Check back later for new class schedules!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingClass;