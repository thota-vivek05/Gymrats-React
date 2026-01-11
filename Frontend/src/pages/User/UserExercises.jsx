import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import DashboardHeader from './components/DashboardHeader'; // Ensure this path is correct
import Footer from '../../components/common/Footer/Footer'; // Ensure this path is correct

const UserExercises = () => {
    const { user } = useAuth();
    
    // --- State Management ---
    const [exercises, setExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [recommendationReason, setRecommendationReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [userWorkoutType, setUserWorkoutType] = useState('All');
    
    // --- Detail View State ---
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [similarExercises, setSimilarExercises] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);

    // --- Initial Fetch ---
    useEffect(() => {
        fetchExercises();
        fetchRecommendations();
    }, []);

    // --- Filtering Logic ---
    useEffect(() => {
        let result = exercises;

        // 1. Filter by Category (Muscle Group)
        if (activeCategory !== 'all') {
            result = result.filter(ex => 
                ex.primaryMuscle === activeCategory || 
                (ex.targetMuscles && ex.targetMuscles.includes(activeCategory))
            );
        }

        // 2. Filter by Search Query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(ex => 
                ex.name.toLowerCase().includes(query) ||
                ex.category.toLowerCase().includes(query) ||
                (ex.targetMuscles && ex.targetMuscles.some(m => m.toLowerCase().includes(query)))
            );
        }

        setFilteredExercises(result);
    }, [activeCategory, searchQuery, exercises]);

    // --- API Calls ---
    const fetchExercises = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/exercises', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                setExercises(data.exercises);
                setFilteredExercises(data.exercises);
                setUserWorkoutType(data.userWorkoutType || 'All');
            } else {
                setError('Failed to load exercises');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/exercises/recommended', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                setRecommendations(data.exercises);
                setRecommendationReason(data.reason);
            }
        } catch (err) {
            console.error("Failed to load recommendations", err);
        }
    };

    const handleExerciseClick = async (exerciseId) => {
        setDetailLoading(true);
        // Scroll to top when opening details
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/exercises/${exerciseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setSelectedExercise(data.exercise);
                setSimilarExercises(data.similarExercises || []);
            }
        } catch (err) {
            console.error("Error loading details", err);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleRateExercise = async (rating) => {
        if (!selectedExercise) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/exercises/${selectedExercise._id}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rating })
            });
            const data = await response.json();

            if (data.success) {
                // Update state immediately for UI feedback
                setSelectedExercise(prev => ({
                    ...prev,
                    userRating: rating
                }));
                // Refresh recommendations since they depend on ratings
                fetchRecommendations();
            }
        } catch (err) {
            console.error("Error rating exercise", err);
        }
    };

    // --- Render Helpers ---
    const renderStars = (currentRating) => {
        return [1, 2, 3, 4, 5].map(star => (
            <button 
                key={star} 
                onClick={() => handleRateExercise(star)}
                className={`text-2xl focus:outline-none transition-colors duration-200 ${
                    currentRating >= star ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-200'
                }`}
            >
                ★
            </button>
        ));
    };

    // --- Detail View Component ---
    if (selectedExercise) {
        return (
            <div className="min-h-screen bg-black text-gray-100 flex flex-col font-outfit">
                <DashboardHeader />
                
                <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
                    {/* Back Button */}
                    <button 
                        onClick={() => setSelectedExercise(null)}
                        className="flex items-center gap-2 text-[#8A2BE2] hover:text-purple-400 mb-6 font-medium transition-colors"
                    >
                        <span>←</span> Back to Exercises
                    </button>

                    <div className="bg-[#111] border border-[#8A2BE2]/30 rounded-xl p-6 md:p-8 shadow-lg shadow-purple-900/10">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Image Section */}
                            <div className="w-full md:w-1/2 lg:w-2/5">
                                <div 
                                    className="aspect-square w-full rounded-xl bg-[#1e1e3a] bg-cover bg-center border border-gray-800"
                                    style={{ backgroundImage: `url('${selectedExercise.image || '/default-exercise.jpg'}')` }}
                                >
                                    {!selectedExercise.image && (
                                        <div className="h-full flex items-center justify-center text-gray-500">No Image Available</div>
                                    )}
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="w-full md:w-1/2 lg:w-3/5 space-y-6">
                                <div>
                                    <div className="flex gap-3 mb-3">
                                        <span className="px-3 py-1 bg-[#8A2BE2]/20 text-[#8A2BE2] rounded-full text-xs font-bold border border-[#8A2BE2]/50">
                                            {selectedExercise.category}
                                        </span>
                                        <span className="px-3 py-1 bg-purple-900/30 text-purple-200 rounded-full text-xs font-bold border border-purple-500/30">
                                            {selectedExercise.difficulty}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedExercise.name}</h1>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-[#8A2BE2] mb-2">Description</h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        {selectedExercise.instructions || "No description available."}
                                    </p>
                                </div>

                                {/* Rating */}
                                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Your Rating</h3>
                                    <div className="flex gap-1">
                                        {renderStars(selectedExercise.userRating || 0)}
                                    </div>
                                </div>

                                {/* Muscles & Equipment Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Muscles Worked</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedExercise.targetMuscles?.map((muscle, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-gray-800 text-gray-200 rounded-full text-xs border border-gray-700">
                                                    {muscle}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Equipment</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedExercise.equipment?.length > 0 ? (
                                                selectedExercise.equipment.map((item, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-gray-800 text-gray-200 rounded-full text-xs border border-gray-700">
                                                        {item}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-500 text-sm italic">No equipment needed</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Similar Exercises */}
                        {similarExercises.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-gray-800">
                                <h3 className="text-2xl font-bold text-white mb-6">Similar Exercises</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {similarExercises.map(ex => (
                                        <div 
                                            key={ex._id} 
                                            onClick={() => handleExerciseClick(ex._id)}
                                            className="bg-[#1e1e3a] rounded-lg p-3 cursor-pointer hover:bg-[#2a2a50] transition-colors border border-transparent hover:border-[#8A2BE2]"
                                        >
                                            <div 
                                                className="h-32 w-full bg-cover bg-center rounded mb-3 bg-gray-900"
                                                style={{ backgroundImage: `url('${ex.image || ''}')` }}
                                            ></div>
                                            <h4 className="text-white font-medium truncate">{ex.name}</h4>
                                            <p className="text-xs text-[#8A2BE2]">{ex.category}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // --- Main List View Component ---
    return (
        <div className="min-h-screen bg-black text-gray-100 flex flex-col font-outfit">
            <DashboardHeader />
            
            {/* Banner Section */}
            <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-6">
                <div className="bg-gradient-to-r from-[#1e1e3a] to-[#111] rounded-xl p-8 text-center shadow-lg border border-gray-800">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Complete Exercise Guide</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">Discover detailed instructions, illustrations, and guides for exercises targeting every muscle group.</p>
                {userWorkoutType && userWorkoutType !== 'All' && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                            <span className="text-[#8A2BE2] font-bold">Your Workout Type:</span>
                            <span className="text-white font-medium">{userWorkoutType}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col md:flex-row gap-6">
                
                {/* Sidebar: Categories */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-[#111] rounded-xl border border-[#8A2BE2]/30 p-5 sticky top-24">
                        <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-800">Muscle Groups</h2>
                        <div className="flex flex-col gap-2">
                            {['all', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body', 'Cardio'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
                                    className={`text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                                        activeCategory === cat 
                                        ? 'bg-[#8A2BE2]/20 text-[#8A2BE2] border border-[#8A2BE2]/50' 
                                        : 'text-gray-400 hover:bg-[#8A2BE2]/10 hover:text-white border border-transparent'
                                    }`}
                                >
                                    {cat === 'all' ? 'All Exercises' : cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1">
                    {/* Controls: Title & Search */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-2xl font-bold text-white">
                            {activeCategory === 'all' ? 'All Exercises' : `${activeCategory} Exercises`}
                        </h2>
                        <div className="relative w-full sm:w-64">
                            <input 
                                type="text" 
                                placeholder="Search exercises..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/10 border border-gray-700 rounded-full py-2 pl-4 pr-10 text-white focus:outline-none focus:border-[#8A2BE2] focus:ring-1 focus:ring-[#8A2BE2] transition-all placeholder-gray-500"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                🔍
                            </div>
                        </div>
                    </div>

                    {/* Recommendations (Only on 'All' tab with no search) */}
                    {activeCategory === 'all' && !searchQuery && recommendations.length > 0 && (
                        <div className="mb-8 bg-white/5 rounded-xl p-6 border border-white/5">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-white">Recommended For You</h3>
                                <p className="text-sm text-[#8A2BE2] italic">
                                    {recommendationReason === 'popular' ? 'Popular among all users' : 'Based on your preferences'}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recommendations.map(ex => (
                                    <ExerciseCard key={ex._id} exercise={ex} onClick={handleExerciseClick} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Exercise Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A2BE2]"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredExercises.length > 0 ? (
                                filteredExercises.map(ex => (
                                    <ExerciseCard key={ex._id} exercise={ex} onClick={handleExerciseClick} />
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center bg-[#111] rounded-xl border border-gray-800">
                                    <div className="text-5xl mb-4">🏋️</div>
                                    <h3 className="text-xl font-bold text-white mb-2">No exercises found</h3>
                                    <p className="text-gray-400">Try adjusting your search or selecting a different category.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

// --- Sub-Component: Exercise Card ---
const ExerciseCard = ({ exercise, onClick }) => (
    <div 
        onClick={() => onClick(exercise._id)}
        className="group bg-[#1e1e3a] rounded-xl overflow-hidden cursor-pointer border border-transparent hover:border-[#8A2BE2] hover:shadow-lg hover:shadow-purple-900/20 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
        <div 
            className="h-40 w-full bg-cover bg-center bg-gray-900 relative"
            style={{ backgroundImage: `url('${exercise.image || '/default-exercise.jpg'}')` }}
        >
            {!exercise.image && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">No Image</div>
            )}
            
            {/* Floating Badges */}
            <div className="absolute top-2 left-2">
                <span className="bg-[#8A2BE2]/90 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                    {exercise.category}
                </span>
            </div>
            {exercise.userRating && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                    <span>★</span> {exercise.userRating}
                </div>
            )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#8A2BE2] transition-colors line-clamp-1">
                {exercise.name}
            </h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                {exercise.instructions || 'Click for details...'}
            </p>
            
            <div className="flex justify-between items-center mt-auto pt-3 border-t border-white/5">
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    exercise.difficulty === 'Beginner' ? 'border-green-500/50 text-green-400' :
                    exercise.difficulty === 'Intermediate' ? 'border-yellow-500/50 text-yellow-400' :
                    'border-red-500/50 text-red-400'
                }`}>
                    {exercise.difficulty}
                </span>
                <span className="text-xs text-gray-500 font-medium">{exercise.type || 'Strength'}</span>
            </div>
        </div>
    </div>
);

export default UserExercises;