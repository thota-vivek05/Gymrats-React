import React from 'react';

const TodaysWorkout = ({ todayWorkout, onExerciseComplete }) => {
    const markExerciseAsDone = async (workoutId, exerciseName) => {
        try {
            const response = await fetch('/api/exercise/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workoutPlanId: workoutId, exerciseName: exerciseName })
            });
            
            const data = await response.json();
            if (data.success) {
                onExerciseComplete();
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error completing exercise:', error);
            alert('Network error. Please try again.');
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-center p-5 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">
                    Today's Workout: <span className="text-gray-300 text-base font-normal">{todayWorkout.name || 'No Workout Scheduled'}</span>
                </h2>
                <span className="bg-[#8A2BE2]/20 text-[#8A2BE2] text-xs px-3 py-1 rounded-full border border-[#8A2BE2]/30">
                    {todayWorkout.duration || 60} min
                </span>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-6">
                {todayWorkout.exercises && todayWorkout.exercises.length > 0 ? (
                    <>
                        {/* Progress Section */}
                        <div className="flex items-center gap-6 flex-wrap">
                            <div className="w-24 h-24 relative flex-shrink-0">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    <path 
                                        className="text-gray-700" 
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="3" 
                                    />
                                    <path 
                                        className="text-[#8A2BE2] transition-all duration-1000 ease-out" 
                                        strokeDasharray={`${todayWorkout.progress || 0}, 100`} 
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="3" 
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                                    {todayWorkout.progress || 0}%
                                </div>
                            </div>
                            <p className="text-gray-300 m-0">
                                <span className="text-white font-bold">{todayWorkout.completedExercises || 0}</span> of 
                                <span className="text-white font-bold mx-1">{todayWorkout.totalExercises || 0}</span> exercises completed
                            </p>
                        </div>

                        <h3 className="text-lg font-semibold text-white">Exercises:</h3>
                        
                        <div className="flex flex-col gap-3">
                            {todayWorkout.exercises.map((exercise, index) => (
                                <div 
                                    key={index} 
                                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg transition-all duration-300 ${
                                        exercise.completed 
                                            ? 'bg-green-500/10 border-green-500/50' 
                                            : 'bg-transparent border-gray-800 hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex-1 mb-3 sm:mb-0">
                                        <strong className="block text-white mb-1">{exercise.name}</strong>
                                        <div className="text-gray-400 text-sm">
                                            {exercise.sets} sets * {exercise.reps ? ` ${exercise.reps} reps` : ` ${exercise.duration} seconds`}
                                            {exercise.weight && ` (${exercise.weight} kg)`}
                                        </div>
                                    </div>
                                    <button 
                                        className={`px-4 py-2 rounded text-sm font-medium transition-colors w-full sm:w-auto whitespace-nowrap ${
                                            exercise.completed 
                                                ? 'bg-green-600 cursor-not-allowed opacity-80 text-white' 
                                                : 'bg-[#8A2BE2] hover:bg-[#7B1FA2] text-white'
                                        }`}
                                        onClick={() => markExerciseAsDone(todayWorkout.workoutPlanId, exercise.name)}
                                        disabled={exercise.completed}
                                    >
                                        {exercise.completed ? (
                                            <><i className="fas fa-check-circle mr-2"></i> Completed</>
                                        ) : (
                                            <><i className="fas fa-check mr-2"></i> Mark as Done</>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="text-gray-400">No exercises scheduled for today.</p>
                )}
            </div>
        </div>
    );
};

export default TodaysWorkout;