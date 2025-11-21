import React from 'react';

const TodaysWorkout = ({ todayWorkout, onExerciseComplete }) => {
    const markExerciseAsDone = async (workoutId, exerciseName) => {
        try {
            const response = await fetch('/api/exercise/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    workoutPlanId: workoutId,
                    exerciseName: exerciseName
                })
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
        <div className="dashboard-card">
            <div className="card-header">
                <h2>Today's Workout: {todayWorkout.name || 'No Workout Scheduled'}</h2>
                <span className="badge">{todayWorkout.duration || 60} min</span>
            </div>
            <div className="workout-content">
                {todayWorkout.exercises && todayWorkout.exercises.length > 0 ? (
                    <>
                        <div className="workout-progress">
                            <div className="progress-circle">
                                <svg viewBox="0 0 36 36" className="circular-chart">
                                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path 
                                        className="circle" 
                                        strokeDasharray={`${todayWorkout.progress || 0}, 100`} 
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                    />
                                    <text x="18" y="20.35" className="percentage">
                                        {todayWorkout.progress || 0}%
                                    </text>
                                </svg>
                            </div>
                            <p>
                                <span id="completedExercisesCount">{todayWorkout.completedExercises || 0}</span> of 
                                <span id="totalExercisesCount">{todayWorkout.totalExercises || 0}</span> exercises completed
                            </p>
                        </div>

                        <h3>Exercises:</h3>
                        <div className="exercises-container">
                            {todayWorkout.exercises.map((exercise, index) => (
                                <div 
                                    key={index} 
                                    className={`exercise-item ${exercise.completed ? 'completed' : ''}`}
                                >
                                    <div className="exercise-info">
                                        <strong className="exercise-name">{exercise.name}</strong>
                                        <div className="exercise-details">
                                            {exercise.sets} sets * 
                                            {exercise.reps ? `${exercise.reps} reps` : `${exercise.duration} seconds`}
                                            {exercise.weight && ` (${exercise.weight} kg)`}
                                        </div>
                                    </div>
                                    <button 
                                        className={`exercise-complete-btn ${exercise.completed ? 'completed' : ''}`}
                                        onClick={() => markExerciseAsDone(todayWorkout.workoutPlanId, exercise.name)}
                                        disabled={exercise.completed}
                                    >
                                        {exercise.completed ? (
                                            <><i className="fas fa-check-circle"></i> Completed</>
                                        ) : (
                                            <><i className="fas fa-check"></i> Mark as Done</>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p>No exercises scheduled for today.</p>
                )}
            </div>
        </div>
    );
};

export default TodaysWorkout;