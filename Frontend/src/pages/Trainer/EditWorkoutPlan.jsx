import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus, faMoon, faTrash, faSave, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styles from './EditWorkoutPlan.module.css';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const API_BASE_URL = '/api/trainer';

// Helper Component for a single Exercise Item
const ExerciseItem = ({ dayName, exerciseIndex, exercise, onRemove, onInputChange }) => {
    return (
        <div className={styles['exercise-item']}>
            <div className={styles['exercise-details']}>
                <input
                    type="text"
                    name={`currentWeek[${dayName}][${exerciseIndex}][name]`}
                    className={styles['exercise-name-input']}
                    value={exercise.name}
                    onChange={(e) => onInputChange(dayName, exerciseIndex, 'name', e.target.value)}
                    placeholder="Exercise name"
                    readOnly
                />
                <div className={styles['exercise-params']}>
                    <input
                        type="text"
                        name={`currentWeek[${dayName}][${exerciseIndex}][sets]`}
                        className={styles['sets-input']}
                        value={exercise.sets || ''}
                        onChange={(e) => onInputChange(dayName, exerciseIndex, 'sets', e.target.value)}
                        placeholder="Sets"
                    />
                    <input
                        type="text"
                        name={`currentWeek[${dayName}][${exerciseIndex}][reps]`}
                        className={styles['reps-input']}
                        // This field handles both Reps and Duration
                        value={exercise.reps || ''}
                        onChange={(e) => onInputChange(dayName, exerciseIndex, 'reps', e.target.value)}
                        placeholder="Reps"
                    />
                    <input
                        type="text"
                        name={`currentWeek[${dayName}][${exerciseIndex}][weight]`}
                        className={styles['weight-input']}
                        value={exercise.weight || ''}
                        onChange={(e) => onInputChange(dayName, exerciseIndex, 'weight', e.target.value)}
                        placeholder="Weight (kg)"
                    />
                </div>
            </div>
            <button type="button" className={styles['remove-exercise-btn']} onClick={() => onRemove(dayName, exerciseIndex)}>
                <FontAwesomeIcon icon={faTrash} />
            </button>
        </div>
    );
};

const EditWorkoutPlan = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState({ name: 'Loading...', goal: '' });
    const [notes, setNotes] = useState('');
    const [workoutPlan, setWorkoutPlan] = useState({
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], 
        Friday: [], Saturday: [], Sunday: []
    });
    const [availableExercises, setAvailableExercises] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDay, setCurrentDay] = useState('');
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    // Fetch Initial Data (Client, Plan, Exercises)
    useEffect(() => {
        const fetchData = async () => {
            if (!clientId) return;

            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login again');
                navigate('/login');
                return;
            }

            const headers = { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            try {
                setLoading(true);

                // Fetch all data in parallel
                const [clientRes, workoutRes, exercisesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/client/${clientId}`, { headers }),
                    fetch(`${API_BASE_URL}/workout/${clientId}`, { headers }),
                    fetch(`${API_BASE_URL}/exercises/list`, { headers })
                ]);

                // Handle client data
                if (clientRes.ok) {
                    const clientData = await clientRes.json();
                    setClient({
                        name: clientData.full_name || 'Client',
                        goal: clientData.fitness_goals?.primary_goal || clientData.goal || 'N/A'
                    });
                }

                // Handle workout data
                if (workoutRes.ok) {
                    const workoutData = await workoutRes.json();
                    if (workoutData.weeklySchedule) {
                        setWorkoutPlan(workoutData.weeklySchedule);
                    }
                }

                // Handle exercises data
                if (exercisesRes.ok) {
                    const exercisesData = await exercisesRes.json();
                    setAvailableExercises(Array.isArray(exercisesData) ? exercisesData : []);
                } else {
                    console.error('Failed to fetch exercises');
                    setAvailableExercises([]);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                setToast({ show: true, message: 'Error loading workout plan' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [clientId, navigate]);

    // Handlers for UI Interactions
    const handleAddExerciseClick = (dayName) => {
        setCurrentDay(dayName);
        setSelectedExercise(null);
        setIsModalOpen(true);
    };

    const handleRestDayClick = (dayName) => {
        setWorkoutPlan(prevPlan => ({
            ...prevPlan,
            [dayName]: []
        }));
    };
    
    const handleRemoveExercise = (dayName, exerciseIndex) => {
        setWorkoutPlan(prevPlan => ({
            ...prevPlan,
            [dayName]: prevPlan[dayName].filter((_, index) => index !== exerciseIndex)
        }));
    };

    const handleExerciseInputChange = useCallback((dayName, exerciseIndex, field, value) => {
        setWorkoutPlan(prevPlan => ({
            ...prevPlan,
            [dayName]: prevPlan[dayName].map((exercise, index) => 
                index === exerciseIndex ? { ...exercise, [field]: value } : exercise
            )
        }));
    }, []);

    // ✅ FIXED: Parse string defaults into pure numbers
    const handleSelectExercise = () => {
        if (selectedExercise && currentDay) {
            const exerciseDefaults = availableExercises.find(e => e.name === selectedExercise);

            // 1. Get the raw string (e.g., "30 seconds" or "8-10 reps")
            const rawReps = exerciseDefaults?.defaultRepsOrDuration || '10';
            
            // 2. Extract only the number using Regex
            // This grabs the first number found. "30 seconds" -> "30", "8-10" -> "8"
            const numericReps = rawReps.toString().match(/\d+/);
            const cleanReps = numericReps ? numericReps[0] : '10';

            const newExercise = {
                name: selectedExercise,
                sets: exerciseDefaults?.defaultSets || '3',
                reps: cleanReps, // Now just a number string like "30"
                weight: '',
            };
            
            setWorkoutPlan(prevPlan => ({
                ...prevPlan,
                [currentDay]: [...(prevPlan[currentDay] || []), newExercise],
            }));

            setIsModalOpen(false);
            setSelectedExercise(null);
        }
    };
    
    // Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        const payload = {
            clientId,
            notes,
            currentWeek: workoutPlan
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/save-workout-plan`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(payload),
            });
            
            const data = await response.json();

            if (data.success || response.ok) {
                setToast({ show: true, message: 'Workout plan saved successfully!' });
                setTimeout(() => {
                    setToast({ show: false, message: '' });
                    navigate(`/trainer?clientId=${clientId}`);
                }, 1500);
            } else {
                alert('Error saving plan: ' + (data.error || 'Unknown error.'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error saving the workout plan.');
        } finally {
            setIsSaving(false);
        }
    };

    // Filter exercises
    const filteredExercises = availableExercises.filter(exercise => {
        const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || exercise.category.toLowerCase() === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(availableExercises.map(e => e.category))];

    const handleCategoryClick = (category) => {
        setCategoryFilter(category);
        setSelectedExercise(null);
    };

    if (loading) {
        return (
            <div className={styles['page-wrapper']}>
                <div className={styles['loading']}>Loading workout plan...</div>
            </div>
        );
    }

    return (
        <div className={styles['page-wrapper']}>
            <div className={styles['page-header']}>
                <div className={styles['page-header-content']}>
                    <h1>Edit Workout Plan: <span>{client.name}</span></h1>
                    <p>Create a personalized weekly workout schedule for your client</p>
                </div>
            </div>

            <div className={styles['main-content']}>
                <div className={styles['workout-plan-container']}>
                    <div className={styles['workout-plan-header']}>
                        <button type="button" className={styles['back-btn']} onClick={() => navigate(`/trainer?clientId=${clientId}`)}>
                            <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
                        </button>
                        <div className={styles['plan-info']}>
                            <h2>Weekly Workout Schedule</h2>
                            <p>Client: <strong>{client.name}</strong> | Goal: <strong>{client.goal}</strong></p>
                        </div>
                    </div>

                    <form className={styles['workout-plan-form']} onSubmit={handleSubmit}>
                        <input type="hidden" id="clientId" name="clientId" value={clientId} />
                        
                        <div className={styles['current-week-indicator']}>
                            <h3>Current Week Workout Plan</h3>
                        </div>
                        
                        <div className={styles['days-container']}>
                            {daysOfWeek.map((day, index) => (
                                <div className={styles['day-card']} key={day}>
                                    <div className={styles['day-header']}>
                                        <h3>{day}</h3>
                                        <div className={styles['day-actions']}>
                                            <button type="button" className={styles['add-exercise-btn']} onClick={() => handleAddExerciseClick(day)}>
                                                <FontAwesomeIcon icon={faPlus} /> Add
                                            </button>
                                            <button type="button" className={styles['rest-day-btn']} onClick={() => handleRestDayClick(day)}>
                                                <FontAwesomeIcon icon={faMoon} /> Rest
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className={styles['exercises-list']}>
                                        {workoutPlan[day] && workoutPlan[day].length > 0 ? (
                                            workoutPlan[day].map((exercise, exIndex) => (
                                                <ExerciseItem 
                                                    key={exIndex}
                                                    dayName={day}
                                                    exerciseIndex={exIndex}
                                                    exercise={exercise}
                                                    onRemove={handleRemoveExercise}
                                                    onInputChange={handleExerciseInputChange}
                                                />
                                            ))
                                        ) : (
                                            <div className={styles['rest-day-message']}>
                                                <FontAwesomeIcon icon={faMoon} /> Rest Day
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className={styles['notes-section']}>
                            <h3>Additional Notes</h3>
                            <textarea 
                                placeholder="Add any additional instructions or notes for the client..." 
                                value={notes} 
                                onChange={(e) => setNotes(e.target.value)} 
                            />
                        </div>
                        
                        <div className={styles['form-actions']}>
                            <button type="button" className={styles['cancel-btn']} onClick={() => navigate(`/trainer?clientId=${clientId}`)}>
                                Cancel
                            </button>
                            <button type="submit" className={styles['save-btn']} disabled={isSaving}>
                                {isSaving ? (
                                    <><FontAwesomeIcon icon={faSpinner} spin /> Saving...</>
                                ) : (
                                    <><FontAwesomeIcon icon={faSave} /> Save Workout Plan</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Exercise Selection Modal */}
            {isModalOpen && (
                <div className={styles.modal} onClick={(e) => e.target.className.includes('modal') && setIsModalOpen(false)}>
                    <div className={styles['modal-content']}>
                        <div className={styles['modal-header']}>
                            <h2>Select Exercise (Day: {currentDay})</h2>
                            <span className={styles['close-modal']} onClick={() => setIsModalOpen(false)}>&times;</span>
                        </div>
                        <div className={styles['modal-body']}>
                            <div className={styles['modal-search']}>
                                <input 
                                    type="text" 
                                    placeholder="Search exercises..." 
                                    value={searchQuery} 
                                    onChange={(e) => setSearchQuery(e.target.value)} 
                                />
                            </div>
                            <div className={styles['exercise-categories']}>
                                <button 
                                    className={`${styles['category-btn']} ${categoryFilter === 'all' ? styles.active : ''}`} 
                                    onClick={() => handleCategoryClick('all')}
                                >
                                    All
                                </button>
                                {categories.map(cat => (
                                    <button 
                                        key={cat} 
                                        className={`${styles['category-btn']} ${categoryFilter === cat.toLowerCase() ? styles.active : ''}`} 
                                        onClick={() => handleCategoryClick(cat.toLowerCase())}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className={styles['exercise-list']}>
                                <div className={styles['exercise-grid']}>
                                    {filteredExercises.length > 0 ? (
                                        filteredExercises.map(exercise => (
                                            <div 
                                                key={exercise.name}
                                                className={`${styles['exercise-select-item']} ${selectedExercise === exercise.name ? styles.selected : ''}`} 
                                                onClick={() => setSelectedExercise(exercise.name)}
                                            >
                                                <div className={styles['exercise-select-name']}>{exercise.name}</div>
                                                <div className={styles['exercise-select-target']}>{exercise.category}</div>
                                                <div className={styles['exercise-select-details']}>
                                                    {exercise.defaultSets} sets × {exercise.defaultRepsOrDuration}
                                                    {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                                                        <><br /><small>Target: {exercise.targetMuscles.slice(0, 2).join(', ')}</small></>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles['no-exercises']}>No exercises match your search/filter.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles['modal-footer']}>
                            <button className={styles['select-btn']} onClick={handleSelectExercise} disabled={!selectedExercise}>
                                Add Selected Exercise
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Success Toast */}
            {toast.show && (
                <div className={`${styles.toast} ${styles.show}`}>
                    <div className={styles['toast-content']}>
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditWorkoutPlan;