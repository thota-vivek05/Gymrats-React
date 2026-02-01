import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProgressTracking = ({ exerciseProgress }) => {
    // Default data if nothing is passed
    const defaultData = {
        labels: [],
        datasets: []
    };

    // Use passed data or default
    const data = exerciseProgress && exerciseProgress.labels ? exerciseProgress : defaultData;

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#f1f1f1' } },
            title: { 
                display: true, 
                text: 'Strength Progress (Last 6 Sessions)', 
                color: '#f1f1f1', 
                font: { size: 16 } 
            }
        },
        scales: {
            y: { 
                beginAtZero: true, 
                ticks: { color: '#f1f1f1' }, 
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                title: { display: true, text: 'Weight (kg)', color: '#888' }
            },
            x: { 
                ticks: { color: '#f1f1f1' }, 
                grid: { color: 'rgba(255, 255, 255, 0.1)' } 
            }
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-5 mb-10 col-span-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-white">Progress Tracking</h2>
            </div>

            <div className="w-full h-[300px] relative bg-black/20 rounded-lg p-4">
                {data.labels && data.labels.length > 0 ? (
                    <Line options={options} data={data} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No workout history found yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressTracking;