import React from 'react';

const DashboardHero = ({ user }) => {
    return (
        <section className="dashboard-hero">
            <div className="dashboard-hero-content">
                <h1>Welcome back, {user?.full_name}</h1>
                <p>Track your progress and stay on top of your fitness goals</p>
            </div>
        </section>
    );
};

export default DashboardHero;