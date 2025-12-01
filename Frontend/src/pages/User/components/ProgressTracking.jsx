import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const ProgressTracking = ({ exerciseProgress, nutritionChartData }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartRef.current && exerciseProgress.length > 0) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');
            chartInstance.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: exerciseProgress.map(exercise => ({
                        label: exercise.name + ' (kg)',
                        data: [
                            exercise.currentWeight * 0.8,
                            exercise.currentWeight * 0.9,
                            exercise.currentWeight * 0.95,
                            exercise.currentWeight
                        ],
                        borderColor: '#8A2BE2',
                        backgroundColor: '#8A2BE233',
                        tension: 0.3,
                        fill: true
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top', labels: { color: '#f1f1f1' } },
                        title: { display: true, text: 'Exercise Progress Over Time', color: '#f1f1f1', font: { size: 16 } }
                    },
                    scales: {
                        y: { beginAtZero: true, ticks: { color: '#f1f1f1' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                        x: { ticks: { color: '#f1f1f1' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
                    }
                }
            });
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [exerciseProgress]);

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-5 mb-10 col-span-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-white">Progress Tracking</h2>
                <div className="flex gap-3 w-full md:w-auto">
                    <select id="exerciseSelect" className="bg-[#222] text-[#f1f1f1] py-2 px-3 border border-gray-700 rounded text-sm focus:border-[#8A2BE2] outline-none flex-1 md:flex-none min-w-[120px]">
                        <option value="all">All Exercises</option>
                        {exerciseProgress.map(exercise => (
                            <option key={exercise.name} value={exercise.name}>{exercise.name}</option>
                        ))}
                    </select>
                    <select id="timeframeSelect" className="bg-[#222] text-[#f1f1f1] py-2 px-3 border border-gray-700 rounded text-sm focus:border-[#8A2BE2] outline-none flex-1 md:flex-none min-w-[120px]">
                        <option value="month">Last Month</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="year">Last Year</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {exerciseProgress.map(exercise => (
                        <div key={exercise.name} className="bg-white/5 border border-white/5 p-4 rounded-lg">
                            <div className="font-bold text-gray-300 mb-2">{exercise.name}</div>
                            <div className="w-full">
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                                    <div 
                                        className="h-full bg-[#8A2BE2] transition-all duration-500" 
                                        style={{ width: `${exercise.progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-white font-bold">{exercise.currentWeight} kg</span>
                                    <span className="text-gray-400">{exercise.goalWeight} kg goal</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="w-full h-[300px] relative">
                    <canvas ref={chartRef} id="exerciseChart"></canvas>
                </div>
            </div>
        </div>
    );
};

export default ProgressTracking; 
