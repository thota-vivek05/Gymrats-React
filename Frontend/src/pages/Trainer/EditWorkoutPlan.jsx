import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus, faMoon, faTrash, faSave, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

// Constants
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const API_BASE_URL = '/api/trainer';

// Helper Component for a single Exercise Item
const ExerciseItem = ({ dayName, exerciseIndex, exercise, onRemove, onInputChange }) => {
    return (
        <div className="flex justify-between items-start bg-[#222] rounded-[5px] p-[10px_15px] mb-[10px] border border-[#333] transition-colors duration-300 hover:bg-[#2a2a4a] overflow-hidden">
            <div className="flex-1 min-w-0 w-full">
                <input
                    type="text"
                    name={`currentWeek[${dayName}][${exerciseIndex}][name]`}
                    className="w-full bg-transparent border-none border-b border-transparent text-[1rem] font-medium text-[#f1f1f1] mb-2 p-[5px_0] focus:border-[#8A2BE2] focus:outline-none"
                    value={exercise.name}
                    onChange={(e) => onInputChange(dayName, exerciseIndex, 'name', e.target.value)}
                    placeholder="Exercise name"
                    readOnly
                />
                <div className="flex flex-col md:flex-row gap-[10px] mt-2 w-full">
                    <input
                        type="text"
                        name={`currentWeek[${dayName}][${exerciseIndex}][sets]`}
                        className="flex-1 min-w-0 bg-[rgba(255,255,255,0.1)] border border-[#333] rounded-[4px] p-[5px_10px] text-[0.9rem] text-[#f1f1f1] transition-colors duration-300 focus:border-[#8A2BE2] focus:outline-none"
                        value={exercise.sets || ''}
                        onChange={(e) => onInputChange(dayName, exerciseIndex, 'sets', e.target.value)}
                        placeholder="Sets"
                    />
                    <input
                        type="text"
                        name={`currentWeek[${dayName}][${exerciseIndex}][reps]`}
                        className="flex-1 min-w-0 bg-[rgba(255,255,255,0.1)] border border-[#333] rounded-[4px] p-[5px_10px] text-[0.9rem] text-[#f1f1f1] transition-colors duration-300 focus:border-[#8A2BE2] focus:outline-none"
                        // This field handles both Reps and Duration
                        value={exercise.reps || ''}
                        onChange={(e) => onInputChange(dayName, exerciseIndex, 'reps', e.target.value)}
                        placeholder="Reps"
                    />
                    <input
                        type="text"
                        name={`currentWeek[${dayName}][${exerciseIndex}][weight]`}
                        className="flex-1 min-w-0 bg-[rgba(255,255,255,0.1)] border border-[#333] rounded-[4px] p-[5px_10px] text-[0.9rem] text-[#f1f1f1] transition-colors duration-300 focus:border-[#8A2BE2] focus:outline-none"
                        value={exercise.weight || ''}
                        onChange={(e) => onInputChange(dayName, exerciseIndex, 'weight', e.target.value)}
                        placeholder="Weight (kg)"
                    />
                </div>
            </div>
            <button 
                type="button" 
                className="bg-transparent border-none text-[#ff5555] text-[1rem] cursor-pointer ml-[10px] transition-all duration-300 hover:text-[#ff0000] hover:scale-110" 
                onClick={() => onRemove(dayName, exerciseIndex)}
            >
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

    const handleSelectExercise = () => {
        if (selectedExercise && currentDay) {
            const exerciseDefaults = availableExercises.find(e => e.name === selectedExercise);

            const rawReps = exerciseDefaults?.defaultRepsOrDuration || '10';
            const numericReps = rawReps.toString().match(/\d+/);
            const cleanReps = numericReps ? numericReps[0] : '10';

            const newExercise = {
                name: selectedExercise,
                sets: exerciseDefaults?.defaultSets || '3',
                reps: cleanReps,
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
            <div className="bg-black min-h-screen text-[#f1f1f1] flex flex-col font-['Outfit',_sans-serif]">
                <div className="flex-1 flex justify-center items-center text-[#8A2BE2] text-[1.2rem]">Loading workout plan...</div>
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen text-[#f1f1f1] flex flex-col font-['Outfit',_sans-serif]">
            {/* Font Import */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
            `}</style>

            {/* Navbar (Static Placeholder to match visual structure if needed, or rely on layout) */}
            {/* Page Header */}
            <div className="bg-[#1e1e3a] py-10 px-5 text-center mb-[30px] shadow-md">
                <div className="max-w-[800px] mx-auto">
                    <h1 className="text-[2rem] md:text-[2.5rem] mb-[10px] text-[#f1f1f1] font-bold">
                        Edit Workout Plan: <span className="text-[#8A2BE2]">{client.name}</span>
                    </h1>
                    <p className="text-[1rem] md:text-[1.2rem] text-[#cccccc]">Create a personalized weekly workout schedule for your client</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-[1200px] mx-auto mb-[40px] px-[10px] md:px-[20px] w-[95%] md:w-[90%]">
                <div className="bg-[#111] rounded-[10px] border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
                    {/* Header */}
                    <div className="bg-[#1e1e3a] p-[20px] flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#333] gap-[15px]">
                        <button 
                            type="button" 
                            className="flex items-center gap-[8px] bg-transparent border-[2px] border-[#8A2BE2] text-[#8A2BE2] px-[15px] py-[8px] rounded-[5px] cursor-pointer text-[0.9rem] font-medium transition-all duration-300 hover:bg-[#8A2BE2] hover:text-white" 
                            onClick={() => navigate(`/trainer?clientId=${clientId}`)}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
                        </button>
                        <div className="text-left md:text-right">
                            <h2 className="text-[1.5rem] text-[#f1f1f1] mb-[5px] font-bold">Weekly Workout Schedule</h2>
                            <p className="text-[#cccccc] text-[1rem]">Client: <strong className="text-[#8A2BE2]">{client.name}</strong> | Goal: <strong className="text-[#8A2BE2]">{client.goal}</strong></p>
                        </div>
                    </div>

                    <form className="p-[20px]" onSubmit={handleSubmit}>
                        <input type="hidden" id="clientId" name="clientId" value={clientId} />
                        
                        <div className="bg-[#f8f9fa] p-[15px] rounded-[8px] mb-[20px] text-center border-l-[4px] border-[#8A2BE2]">
                            <h3 className="m-0 text-[#8A2BE2] text-[1.2em] font-bold">Current Week Workout Plan</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[20px] mb-[30px]">
                            {daysOfWeek.map((day, index) => (
                                <div className="bg-[#1e1e3a] rounded-[8px] border border-[#333] shadow-sm transition-transform duration-200 overflow-hidden flex flex-col hover:-translate-y-1" key={day}>
                                    <div className="bg-[#8A2BE2] p-[10px_15px] flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 gap-2 md:gap-0">
                                        <h3 className="text-white text-[1.2rem] m-0 font-bold">{day}</h3>
                                        <div className="flex gap-[8px] w-full md:w-auto justify-between md:justify-end">
                                            <button 
                                                type="button" 
                                                className="bg-white/20 border-none text-white px-[10px] py-[5px] rounded-[4px] cursor-pointer text-[0.8rem] font-medium transition-all duration-300 flex items-center gap-[5px] hover:bg-white/30" 
                                                onClick={() => handleAddExerciseClick(day)}
                                            >
                                                <FontAwesomeIcon icon={faPlus} /> Add
                                            </button>
                                            <button 
                                                type="button" 
                                                className="bg-white/20 border-none text-white px-[10px] py-[5px] rounded-[4px] cursor-pointer text-[0.8rem] font-medium transition-all duration-300 flex items-center gap-[5px] hover:bg-white/30" 
                                                onClick={() => handleRestDayClick(day)}
                                            >
                                                <FontAwesomeIcon icon={faMoon} /> Rest
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-[15px] min-h-[200px] overflow-x-hidden overflow-y-auto max-w-full">
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
                                            <div className="flex items-center justify-center h-[100px] text-[#aaa] text-[1.1rem] gap-[10px]">
                                                <FontAwesomeIcon icon={faMoon} /> Rest Day
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mb-[20px]">
                            <h3 className="mb-[10px] text-[#f1f1f1] text-[1.2rem] border-b border-[#8A2BE2] pb-[5px] font-bold">Additional Notes</h3>
                            <textarea 
                                placeholder="Add any additional instructions or notes for the client..." 
                                value={notes} 
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full h-[100px] bg-[#222] border border-[#333] rounded-[5px] p-[10px_15px] text-[#f1f1f1] text-[1rem] resize-y transition-colors duration-300 focus:border-[#8A2BE2] focus:outline-none"
                            />
                        </div>
                        
                        <div className="flex flex-col md:flex-row justify-end gap-[15px] mt-[20px]">
                            <button 
                                type="button" 
                                className="px-[25px] py-[12px] rounded-[5px] text-[1rem] font-medium cursor-pointer transition-all duration-300 flex items-center justify-center gap-[8px] bg-transparent border-[2px] border-[#f1f1f1] text-[#f1f1f1] hover:bg-[#f1f1f1] hover:text-black w-full md:w-auto" 
                                onClick={() => navigate(`/trainer?clientId=${clientId}`)}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-[25px] py-[12px] rounded-[5px] text-[1rem] font-medium cursor-pointer transition-all duration-300 flex items-center justify-center gap-[8px] bg-[#8A2BE2] border-[2px] border-[#8A2BE2] text-white hover:bg-transparent hover:text-[#8A2BE2] disabled:opacity-60 disabled:cursor-not-allowed w-full md:w-auto" 
                                disabled={isSaving}
                            >
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
                <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/70 overflow-auto" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                    <div className="bg-[#111] border border-[#8A2BE2] rounded-[10px] w-full md:w-[80%] max-w-[800px] max-h-[100vh] md:max-h-[80vh] flex flex-col shadow-2xl m-0 md:m-[50px_auto]">
                        <div className="bg-[#1e1e3a] p-[15px_20px] flex justify-between items-center border-b border-[#333]">
                            <h2 className="text-[#f1f1f1] text-[1.5rem] m-0 font-bold">Select Exercise (Day: {currentDay})</h2>
                            <span className="text-[#aaa] text-[28px] font-bold cursor-pointer transition-colors duration-300 hover:text-[#f1f1f1]" onClick={() => setIsModalOpen(false)}>&times;</span>
                        </div>
                        <div className="p-[20px] flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#1e1e1e]/40 [&::-webkit-scrollbar-track]:rounded-[4px] [&::-webkit-scrollbar-thumb]:bg-[#8A2BE2]/50 [&::-webkit-scrollbar-thumb]:rounded-[4px]">
                            <div className="mb-[15px]">
                                <input 
                                    type="text" 
                                    placeholder="Search exercises..." 
                                    value={searchQuery} 
                                    onChange={(e) => setSearchQuery(e.target.value)} 
                                    className="w-full bg-[#222] border border-[#333] rounded-[5px] p-[10px_15px] text-[#f1f1f1] text-[1rem] transition-colors duration-300 focus:border-[#8A2BE2] focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-wrap gap-[10px] mb-[20px]">
                                <button 
                                    className={`bg-[#222] border-none text-[#f1f1f1] p-[8px_15px] rounded-[5px] cursor-pointer text-[0.9rem] font-medium transition-all duration-300 capitalize hover:bg-[#333] ${categoryFilter === 'all' ? 'bg-[#8A2BE2] hover:bg-[#8A2BE2]' : ''}`} 
                                    onClick={() => handleCategoryClick('all')}
                                >
                                    All
                                </button>
                                {categories.map(cat => (
                                    <button 
                                        key={cat} 
                                        className={`bg-[#222] border-none text-[#f1f1f1] p-[8px_15px] rounded-[5px] cursor-pointer text-[0.9rem] font-medium transition-all duration-300 capitalize hover:bg-[#333] ${categoryFilter === cat.toLowerCase() ? 'bg-[#8A2BE2] hover:bg-[#8A2BE2]' : ''}`} 
                                        onClick={() => handleCategoryClick(cat.toLowerCase())}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-[15px]">
                                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[15px]">
                                    {filteredExercises.length > 0 ? (
                                        filteredExercises.map(exercise => (
                                            <div 
                                                key={exercise.name}
                                                className={`bg-[#222] border border-[#333] rounded-[5px] p-[15px] cursor-pointer transition-all duration-300 hover:border-[#8A2BE2] hover:bg-[#2a2a4a] ${selectedExercise === exercise.name ? 'border-[#8A2BE2] bg-[rgba(138,43,226,0.3)]' : ''}`} 
                                                onClick={() => setSelectedExercise(exercise.name)}
                                            >
                                                <div className="font-medium text-[1rem] mb-[5px] text-[#f1f1f1]">{exercise.name}</div>
                                                <div className="text-[0.8rem] text-[#aaa] mb-[8px]">{exercise.category}</div>
                                                <div className="text-[0.8em] text-[#666] mt-[5px]">
                                                    {exercise.defaultSets} sets × {exercise.defaultRepsOrDuration}
                                                    {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                                                        <><br /><small className="text-[0.95em] text-[#888] block mt-[3px]">Target: {exercise.targetMuscles.slice(0, 2).join(', ')}</small></>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center p-[20px] text-[#666] italic">No exercises match your search/filter.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-[15px_20px] border-t border-[#333] flex justify-end">
                            <button 
                                className="bg-[#8A2BE2] border-[2px] border-[#8A2BE2] text-white p-[10px_20px] rounded-[5px] cursor-pointer text-[1rem] font-medium transition-all duration-300 hover:bg-transparent hover:text-[#8A2BE2] disabled:opacity-50 disabled:cursor-not-allowed" 
                                onClick={handleSelectExercise} 
                                disabled={!selectedExercise}
                            >
                                Add Selected Exercise
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Success Toast */}
            {toast.show && (
                <div className="fixed bottom-[30px] right-[30px] bg-[#1e1e3a] text-white p-[15px_25px] rounded-[5px] border-l-[5px] border-[#8A2BE2] shadow-[0_5px_15px_rgba(0,0,0,0.3)] z-[2000] flex items-center gap-[10px] animate-fade-in-up">
                    <div className="flex items-center gap-[15px]">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-[1.5rem] text-[#8A2BE2]" />
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditWorkoutPlan;