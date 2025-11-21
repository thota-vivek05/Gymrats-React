import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const ProgressTracking = ({ exerciseProgress, nutritionChartData }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartRef.current && exerciseProgress.length > 0) {
            // Destroy previous chart instance
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
                        legend: {
                            position: 'top',
                            labels: { color: '#f1f1f1' }
                        },
                        title: {
                            display: true,
                            text: 'Exercise Progress Over Time',
                            color: '#f1f1f1',
                            font: { size: 16 }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#f1f1f1' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        x: {
                            ticks: { color: '#f1f1f1' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
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
        <div className="dashboard-wide-card">
            <div className="card-header">
                <h2>Progress Tracking</h2>
                <div className="card-actions">
                    <select id="exerciseSelect" className="select-dropdown">
                        <option value="all">All Exercises</option>
                        {exerciseProgress.map(exercise => (
                            <option key={exercise.name} value={exercise.name}>
                                {exercise.name}
                            </option>
                        ))}
                    </select>
                    <select id="timeframeSelect" className="select-dropdown">
                        <option value="month">Last Month</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="year">Last Year</option>
                    </select>
                </div>
            </div>

            <div className="stats-content">
                <div className="stats-container">
                    {exerciseProgress.map(exercise => (
                        <div key={exercise.name} className="stat-item">
                            <div className="stat-label">{exercise.name}</div>
                            <div className="stat-progress">
                                <div className="progress-bar">
                                    <div 
                                        className="progress" 
                                        style={{ width: `${exercise.progress}%` }}
                                    ></div>
                                </div>
                                <div className="stat-values">
                                    <span className="current-value">{exercise.currentWeight} kg</span>
                                    <span className="goal-value">{exercise.goalWeight} kg goal</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="chart-container">
                    <canvas ref={chartRef} id="exerciseChart"></canvas>
                </div>
            </div>
        </div>
    );
};

export default ProgressTracking;