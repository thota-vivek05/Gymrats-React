import React from 'react';

const DashboardHero = ({ user }) => {
    return (
        <section className="py-10 px-5 text-center bg-gradient-to-b from-[#1a1a1a] to-black border-b border-gray-800 mb-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Welcome back, <span className="text-[#8A2BE2]">{user?.full_name}</span>
                </h1>
                <p className="text-gray-400 text-lg md:text-xl">
                    Track your progress and stay on top of your fitness goals
                </p>
            </div>
        </section>
    );
};

export default DashboardHero;