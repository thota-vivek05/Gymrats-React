import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TrainerDashboard = () => {
  const [trainer, setTrainer] = useState({ name: 'Trainer' });
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [workoutData, setWorkoutData] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);
  const [exerciseRatings, setExerciseRatings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [searchParams] = useSearchParams(); 
  const navigate = useNavigate();

  const API_BASE = '/api/trainer';

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    fetchClients();
    const trainerData = JSON.parse(localStorage.getItem('user') || '{}');
    if (trainerData.name) setTrainer(trainerData);
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      const response = await fetch(`${API_BASE}/clients`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      const clientsList = Array.isArray(data) ? data : [];
      setClients(clientsList);
      
      const urlClientId = searchParams.get('clientId');
      
      if (clientsList.length > 0) {
        if (urlClientId) {
            const targetClient = clientsList.find(c => (c._id === urlClientId || c.id === urlClientId));
            if (targetClient) {
                handleClientSelect(targetClient);
            } else {
                handleClientSelect(clientsList[0]);
            }
        } else {
            handleClientSelect(clientsList[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleClientSelect = async (client) => {
    setSelectedClient(client);
    setLoading(true);
    setSidebarOpen(false);

    const clientId = client._id || client.id;
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      }; 

      const [profileRes, workoutRes, nutritionRes, ratingsRes] = await Promise.all([
        fetch(`${API_BASE}/client/${clientId}`, { headers }),
        fetch(`${API_BASE}/workout/${clientId}`, { headers }),
        fetch(`${API_BASE}/nutrition/${clientId}`, { headers }),
        fetch(`${API_BASE}/exercise-ratings/${clientId}`, { headers }).catch(() => ({ json: () => ({ success: false, ratings: [] }) }))
      ]);

      const [profile, workout, nutrition, ratings] = await Promise.all([
            profileRes.ok ? profileRes.json().catch(() => ({})) : ({}),
            workoutRes.ok ? workoutRes.json().catch(() => ({ weeklySchedule: null })) : ({ weeklySchedule: null }),
            nutritionRes.ok ? nutritionRes.json().catch(() => ({ nutrition: null })) : ({ nutrition: null }),
            ratingsRes.ok ? ratingsRes.json().catch(() => ({ ratings: [] })) : ({ ratings: [] })
      ]);

      setClientProfile(profile);
      setWorkoutData(workout);
      setNutritionData(nutrition);
      setExerciseRatings(ratings.ratings || []);
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredClients = clients.filter(client =>
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateStats = () => {
    let workoutsCompleted = 0;
    let totalCalories = 0;
    let totalProtein = 0;
    let proteinGoal = 0;
    let calorieGoal = 0;

    if (workoutData?.weeklySchedule) {
      Object.values(workoutData.weeklySchedule).forEach(exercises => {
        workoutsCompleted += exercises.filter(ex => ex.completed).length;
      });
    }

    if (nutritionData?.nutrition?.foods) {
      totalCalories = nutritionData.nutrition.foods.reduce((sum, food) => sum + (food.calories || 0), 0);
      totalProtein = nutritionData.nutrition.foods.reduce((sum, food) => sum + (food.protein || 0), 0);
    }

    if (clientProfile?.fitness_goals?.protein_goal) {
      proteinGoal = parseInt(clientProfile.fitness_goals.protein_goal);
    } else if (nutritionData?.nutrition?.protein_goal) {
      proteinGoal = parseInt(nutritionData.nutrition.protein_goal);
    }

    if (clientProfile?.fitness_goals?.calorie_goal) {
      calorieGoal = parseInt(clientProfile.fitness_goals.calorie_goal);
    } else if (nutritionData?.nutrition?.calorie_goal) {
      calorieGoal = parseInt(nutritionData.nutrition.calorie_goal);
    }

    return { workoutsCompleted, totalCalories, totalProtein, proteinGoal, calorieGoal };
  };

  const stats = calculateStats();

  const getNutritionChartData = () => {
    const protein = nutritionData?.nutrition?.macros?.protein || 0;
    const carbs = nutritionData?.nutrition?.macros?.carbs || 0;
    const fats = nutritionData?.nutrition?.macros?.fats || 0;
    const total = protein + carbs + fats;

    if (total === 0) {
        return {
            labels: ['Empty'],
            datasets: [{
                data: [1],
                backgroundColor: ['#333333'],
                borderWidth: 0,
                tooltip: { enabled: false }
            }]
        };
    }

    return {
        labels: ['Protein', 'Carbs', 'Fats'],
        datasets: [{
            data: [protein, carbs, fats],
            backgroundColor: ['#8A2BE2', '#20B2AA', '#FF6347'],
            borderWidth: 0
        }]
    };
  };

  const nutritionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#f1f1f1', padding: 10 },
        display: (ctx) => {
            const data = ctx.chart.data;
            if (data.labels.length === 1 && data.labels[0] === 'Empty') return false;
            return true;
        }
      },
      tooltip: {
        enabled: (ctx) => {
             const data = ctx.chart.data;
             return !(data.labels.length === 1 && data.labels[0] === 'Empty');
        }
      }
    }
  };

  const exerciseChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Bicep Curls (kg)',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: '#8A2BE2',
        backgroundColor: 'rgba(138, 43, 226, 0.1)',
        tension: 0.3
      },
      {
        label: 'Deadlift (kg)',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: '#20B2AA',
        backgroundColor: 'rgba(32, 178, 170, 0.1)',
        tension: 0.3
      }
    ]
  };

  const exerciseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#f1f1f1' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: { color: '#f1f1f1' }
      },
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: { color: '#f1f1f1' }
      }
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const shouldShowNutrition = clientProfile?.membershipType === 'Platinum' || clientProfile?.membershipType === 'Gold';
  const shouldShowMeet = clientProfile?.membershipType === 'Platinum';

  return (
    <div className="min-h-screen flex flex-col bg-black text-[#f1f1f1] text-sm font-['Outfit',_sans-serif]">
      {/* Inject Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
      `}</style>

      {/* Navbar */}
      <div className="m-0 bg-black border-b border-[#333]">
        <header className="flex justify-between items-center py-[0.8rem] px-4 md:px-[3rem] max-w-[1200px] mx-auto">
          <div className="text-[#f1f1f1] font-bold transition-all duration-300 hover:scale-110">
            <a href="/trainer" className="text-2xl text-[#f1f1f1] font-bold no-underline">GymRats</a>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="/trainer" className="text-[#f1f1f1] text-base font-medium no-underline cursor-pointer relative transition-all duration-100 hover:text-[#8A2BE2]">Home</a>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="loginButton">
              <button 
                onClick={handleLogout} 
                className="bg-[#8A2BE2] px-4 py-2 rounded-[30px] text-[0.9rem] font-medium text-white border-none cursor-pointer transition-all duration-300 hover:bg-[#7020a0]"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="block md:hidden cursor-pointer text-2xl" onClick={() => setSidebarOpen(true)}>
            <span>☰</span>
          </div>
        </header>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed z-[1000] top-0 right-0 bg-[#111] overflow-x-hidden transition-all duration-500 pt-[60px] h-full ${sidebarOpen ? 'w-[250px]' : 'w-0'}`}>
        <a href="#" className="absolute top-0 right-[25px] text-[36px] ml-[50px] no-underline text-[#f1f1f1] transition-all duration-300 hover:text-[#8A2BE2]" onClick={() => setSidebarOpen(false)}>×</a>
        <a href="/trainer" className="block p-[8px_8px_8px_32px] no-underline text-lg text-[#f1f1f1] transition-all duration-300 hover:text-[#8A2BE2]">Home</a>
        <button onClick={handleLogout} className="bg-transparent border-none text-white text-lg p-[8px_8px_8px_32px] cursor-pointer text-left w-full transition-all duration-300 hover:text-[#8A2BE2]">Logout</button>
      </div>

      {/* Welcome Banner */}
      <div className="bg-[#1e1e3a] p-[30px] rounded-lg text-center my-[30px] mx-auto shadow-[0_4px_8px_rgba(0,0,0,0.2)] max-w-[1200px] w-[90%]">
        <h1 className="mb-[10px] text-[#f1f1f1] text-[2rem] sm:text-[2.5rem]">Welcome, {trainer.name}</h1>
        <p className="text-[1rem] sm:text-[1.2rem] text-[#cccccc] mb-[10px]">Manage your clients and track their progress</p>
      </div>

      <div className="flex flex-col md:flex-row my-[30px] mx-auto gap-[30px] flex-1 max-w-[1200px] w-[90%]">
        {/* Client List */}
        <div className="flex-none w-full md:w-[300px] flex flex-col bg-[#111] rounded-lg p-[20px] border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)] mb-[20px] md:mb-0">
          <h2 className="mb-[15px] text-[#f1f1f1] text-[1.5rem]">Client List</h2>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-[10px] mb-[15px] bg-[rgba(255,255,255,0.1)] border border-[#333] rounded-[5px] text-[#f1f1f1] text-sm focus:outline-none focus:border-[#8A2BE2]"
          />
          <div className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-[#1e1e3a] [&::-webkit-scrollbar-track]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-[#8A2BE2] [&::-webkit-scrollbar-thumb]:rounded-[3px] hover:[&::-webkit-scrollbar-thumb]:bg-[#7020a0]">
            {filteredClients.length === 0 ? (
              <p>No clients found.</p>
            ) : (
              filteredClients.map(client => (
                <div
                  key={client._id || client.id}
                  className={`p-[12px] rounded-[6px] mb-[10px] cursor-pointer transition-all duration-300 border border-transparent 
                    hover:bg-[rgba(138,43,226,0.2)] hover:border-[#8A2BE2] 
                    ${(selectedClient?._id || selectedClient?.id) === (client._id || client.id) ? 'bg-[rgba(138,43,226,0.3)] border-[#8A2BE2]' : ''}`}
                  onClick={() => handleClientSelect(client)}
                >
                  <div className="font-bold text-[1.1rem] mb-[5px]">
                    {client.full_name}
                    {/* Membership Badge Logic */}
                    <span className={`inline-block px-[10px] py-[4px] rounded-[15px] text-[0.75em] font-bold ml-[8px] uppercase tracking-[0.5px] border-[2px] border-transparent shadow-[0_2px_4px_rgba(0,0,0,0.1)]
                      ${(!client.membershipType || client.membershipType === 'Basic') ? 'bg-gradient-to-br from-[#6c757d] to-[#495057] text-white border-[#495057]' : ''}
                      ${client.membershipType === 'Gold' ? 'bg-gradient-to-br from-[#ffd700] to-[#daa520] text-[#333] border-[#daa520]' : ''}
                      ${client.membershipType === 'Platinum' ? 'bg-gradient-to-br from-[#e5e4e2] to-[#c0c0c0] text-[#333] border-[#c0c0c0]' : ''}
                    `}>
                      {client.membershipType || 'Basic'}
                    </span>
                  </div>
                  <div className="flex flex-col text-[0.9rem] text-[#cccccc]">
                    <span>Progress: {client.progress || 0}%</span>
                    <span>Status: {client.status || 'Active'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Client Details Container */}
        <div className="flex-1 flex flex-col gap-[20px]">
          {loading ? (
            <div className="text-center p-[40px] bg-[#111] rounded-lg border border-[#8A2BE2] text-[#cccccc]">Loading client data...</div>
          ) : !selectedClient ? (
            <div className="text-center p-[40px] bg-[#111] rounded-lg border border-[#8A2BE2] text-[#cccccc]">Select a client to view details</div>
          ) : (
            <>
              {/* Top Row */}
              <div className="flex flex-col lg:flex-row gap-[20px] flex-wrap">
                {/* Client Profile */}
                <div className="flex-1 min-w-[300px] bg-[#111] rounded-lg p-[20px] border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
                  <h2 className="text-[#f1f1f1] mb-[15px] text-[1.5rem] border-b border-[#8A2BE2] pb-[10px]">
                    Client Profile: {clientProfile?.full_name || selectedClient.full_name}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[15px] mb-[20px]">
                    <div className="flex justify-between items-center mt-[15px] mb-[5px]">
                      <span className="font-bold">Age:</span>
                      <span className="text-[#cccccc]">{calculateAge(clientProfile?.dob)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-[15px] mb-[5px]">
                      <span className="font-bold">Weight:</span>
                      <span className="text-[#cccccc]">{clientProfile?.weight ? `${clientProfile.weight} kg` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-[15px] mb-[5px]">
                      <span className="font-bold">Height:</span>
                      <span className="text-[#cccccc]">{clientProfile?.height ? `${clientProfile.height} cm` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-[15px] mb-[5px]">
                      <span className="font-bold">BMI:</span>
                      <span className="text-[#cccccc]">{clientProfile?.BMI || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-[15px] mb-[5px]">
                      <span className="font-bold">Body Fat:</span>
                      <span className="text-[#cccccc]">{clientProfile?.bodyFat ? `${clientProfile.bodyFat}%` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-[15px] mb-[5px]">
                      <span className="font-bold">Goal:</span>
                      <span className="text-[#cccccc]">{clientProfile?.goal || 'N/A'}</span>
                    </div>
                  </div>
                  {shouldShowMeet && (
                    <button 
                      className="w-full inline-block bg-[#8A2BE2] text-white px-[20px] py-[12px] rounded-[5px] no-underline font-semibold cursor-pointer transition-all duration-300 border-[2px] border-[#8A2BE2] mt-[15px] text-center hover:bg-transparent hover:text-[#8A2BE2]" 
                      onClick={() => window.open('https://meet.google.com/xyz-abcd-123', '_blank')}
                    >
                      Join Google Meet
                    </button>
                  )}
                </div>

                {/* Workout Plan */}
                <div className="flex-1 min-w-[300px] bg-[#111] rounded-lg p-[20px] border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
                  <h2 className="text-[#f1f1f1] mb-[15px] text-[1.5rem] border-b border-[#8A2BE2] pb-[10px]">Weekly Workout Schedule</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mb-[20px]">
                    {!workoutData?.weeklySchedule ? (
                      <p>No workout plan available.</p>
                    ) : (
                      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <div key={day} className="mb-[15px]">
                          <h3 className="text-[#f1f1f1] text-[1.1rem] mb-[10px] font-medium border-l-[4px] border-[#8A2BE2] pl-[10px]">{day}</h3>
                          {workoutData.weeklySchedule[day]?.length === 0 ? (
                            <p>No exercises scheduled.</p>
                          ) : (
                            <div className="ml-[15px] flex flex-col gap-[8px]">
                              {workoutData.weeklySchedule[day]?.map((exercise, idx) => (
                                <div key={idx} className="bg-[#1e1e3a] p-[8px] rounded-[5px] text-[#f1f1f1] border border-[#333] transition-colors duration-300 flex justify-between hover:bg-[#2a2a4d]">
                                  <span className="font-medium text-[#f1f1f1]">{idx + 1}. {exercise.name}</span>
                                  <span className="text-[14px] text-[#cccccc]">
                                    {exercise.sets && exercise.reps && `${exercise.sets} sets x ${exercise.reps} reps`}
                                    {exercise.duration && `${exercise.duration} seconds`}
                                    {exercise.weight && `, ${exercise.weight} kg`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <Link 
                    to={selectedClient ? `/trainer/workout/edit/${selectedClient._id || selectedClient.id}` : '#'}
                    className={`inline-block bg-[#8A2BE2] text-white px-[20px] py-[12px] rounded-[5px] no-underline font-semibold cursor-pointer transition-all duration-300 border-[2px] border-[#8A2BE2] mt-[15px] text-center hover:bg-transparent hover:text-[#8A2BE2] ${!selectedClient ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    Edit Workout Plan
                  </Link>
                </div>
              </div>

              {/* Current Stats */}
              <div className="bg-[#111] rounded-lg p-[20px] border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
                <h2 className="text-[#f1f1f1] mb-[15px] text-[1.5rem] border-b border-[#8A2BE2] pb-[10px]">Current Stats</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[15px] mb-[20px]">
                  <div className="bg-[#1e1e3a] p-[15px] rounded-lg text-center">
                    <h3 className="mb-[10px] text-[1rem] border-none text-[#f1f1f1] m-0">Total Workouts Completed</h3>
                    <p className="text-[1.5rem] font-bold text-[#8A2BE2]">{stats.workoutsCompleted}</p>
                  </div>
                  <div className="bg-[#1e1e3a] p-[15px] rounded-lg text-center">
                    <h3 className="mb-[10px] text-[1rem] border-none text-[#f1f1f1] m-0">Average Calories Consumed</h3>
                    <p className="text-[1.5rem] font-bold text-[#8A2BE2]">{Math.round(stats.totalCalories)} kcal</p>
                  </div>
                  <div className="bg-[#1e1e3a] p-[15px] rounded-lg text-center">
                    <h3 className="mb-[10px] text-[1rem] border-none text-[#f1f1f1] m-0">Protein Intake vs Goal</h3>
                    <p className="text-[1.5rem] font-bold text-[#8A2BE2]">{Math.round(stats.totalProtein)}g / {stats.proteinGoal}g</p>
                  </div>
                </div>
                <h3 className="text-[#f1f1f1] my-[15px] mx-0 text-[1.2rem]">Exercise Progress Timeline</h3>
                <div className="mt-[15px] h-[200px] relative w-full bg-[#1e1e3a] rounded-lg p-[10px]">
                  <Line data={exerciseChartData} options={exerciseChartOptions} />
                </div>
              </div>

              {/* Nutrition Plan */}
              {shouldShowNutrition && (
                <div className="bg-[#111] rounded-lg p-[20px] border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
                  <h2 className="text-[#f1f1f1] mb-[15px] text-[1.5rem] border-b border-[#8A2BE2] pb-[10px]">Food Intake</h2>
                  <div className="mb-[15px]">
                    <p className="mb-[8px]">Today's protein goal: <span className="text-[#8A2BE2] font-semibold">{stats.proteinGoal}g</span></p>
                    <p className="mb-[8px]">Calories: <span className="text-[#8A2BE2] font-semibold">{stats.calorieGoal} kcal</span></p>
                  </div>
                  <h3 className="text-[#f1f1f1] mt-[15px] mb-[10px] text-[1.2rem]">Foods to Take:</h3>
                  <div className="[&>p]:flex [&>p]:justify-between [&>p]:py-[10px] [&>p]:border-b [&>p]:border-[#333] last:[&>p]:border-b-0">
                    {!nutritionData?.nutrition?.foods || nutritionData.nutrition.foods.length === 0 ? (
                      <p>No foods assigned yet.</p>
                    ) : (
                      nutritionData.nutrition.foods.map((food, idx) => (
                        <p key={idx}>{food.name} ({food.protein}g protein, {food.calories} kcal)</p>
                      ))
                    )}
                  </div>
                  <div className="my-[15px] p-[10px] bg-[rgba(46,139,87,0.2)] rounded-[4px] text-center">
                    <p>
                      {stats.totalProtein >= stats.proteinGoal && stats.totalCalories >= stats.calorieGoal
                        ? 'All food goals reached for today! 🎉'
                        : `Working towards goals: ${Math.round(stats.totalProtein)}/${stats.proteinGoal}g protein, ${Math.round(stats.totalCalories)}/${stats.calorieGoal} calories`
                      }
                    </p>
                  </div>
                  <h3 className="text-[#f1f1f1] mt-[15px] mb-[10px] text-[1.2rem]">Nutritional Breakdown</h3>
                  <div className="h-[200px] w-full relative mb-[20px]">
                    <Doughnut data={getNutritionChartData()} options={nutritionChartOptions} />
                  </div>
                  <Link 
                    to={selectedClient ? `/trainer/nutrition/edit/${selectedClient._id || selectedClient.id}` : '#'}
                    className="inline-block bg-[#8A2BE2] text-white px-[20px] py-[12px] rounded-[5px] no-underline font-semibold cursor-pointer transition-all duration-300 border-[2px] border-[#8A2BE2] mt-[15px] text-center hover:bg-transparent hover:text-[#8A2BE2]"
                  >
                    Edit Nutrition Plan
                  </Link>
                </div>
              )}

              {/* Exercise Ratings */}
              <div className="bg-[#111] rounded-lg p-[20px] mt-[20px] border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)] text-[#f1f1f1]">
                <h2 className="text-[#f1f1f1] mb-[15px] text-[1.5rem] border-b border-[#8A2BE2] pb-[10px]">Exercise Preferences & Ratings</h2>
                <div className="mb-[20px] border-b border-[#333] pb-[12px]">
                  <p className="text-[#cccccc] text-[14px] m-0">Sorted by user's highest rated exercises first</p>
                </div>
                <div className="max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-[#1e1e3a] [&::-webkit-scrollbar-track]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-[#8A2BE2] [&::-webkit-scrollbar-thumb]:rounded-[3px] hover:[&::-webkit-scrollbar-thumb]:bg-[#7020a0]">
                  {exerciseRatings.length === 0 ? (
                    <div className="text-center py-[40px] px-[20px] text-[#cccccc]">
                      <p>No exercise ratings available for this client yet.</p>
                    </div>
                  ) : (
                    exerciseRatings.map((rating, idx) => (
                      <div key={idx} className="bg-[#1e1e3a] rounded-lg p-[16px] mb-[12px] border-l-[4px] border-[#8A2BE2] transition-transform duration-200 text-[#f1f1f1] hover:translate-x-[5px]">
                        <div className="flex justify-between items-start mb-[8px]">
                          <h4 className="font-semibold text-[16px] text-[#f1f1f1] m-0">{rating.exerciseName}</h4>
                          <div className="flex items-center gap-[4px]">
                            <span className="text-[#ffc107] text-[16px]">{renderStars(rating.rating)}</span>
                            <span className="font-semibold text-[#8A2BE2] ml-[8px]">{rating.rating}/5</span>
                          </div>
                        </div>
                        <div className="flex gap-[8px] mb-[8px] flex-wrap">
                          <span className="bg-[rgba(138,43,226,0.2)] px-[8px] py-[2px] rounded-[12px] text-[11px] text-[#f1f1f1] border border-[#8A2BE2]">{rating.category}</span>
                          <span className="bg-[rgba(138,43,226,0.2)] px-[8px] py-[2px] rounded-[12px] text-[11px] text-[#f1f1f1] border border-[#8A2BE2]">{rating.difficulty}</span>
                          <span className="bg-[rgba(46,139,87,0.2)] text-[#90ee90] border-[#2e8b57] px-[8px] py-[2px] rounded-[12px] text-[11px] border">{rating.effectiveness}</span>
                          <span className="bg-[rgba(32,178,170,0.2)] text-[#20b2aa] border-[#20b2aa] px-[8px] py-[2px] rounded-[12px] text-[11px] border">{rating.workoutType}</span>
                        </div>
                        {rating.targetMuscles?.length > 0 && (
                          <div className="mt-[8px]">
                            <div className="text-[12px] text-[#cccccc] mb-[4px]">Target Muscles:</div>
                            <div className="flex flex-wrap gap-[6px]">
                              {rating.targetMuscles.map((muscle, mIdx) => (
                                <span key={mIdx} className="bg-[#8A2BE2] text-white px-[8px] py-[2px] rounded-[10px] text-[11px]">{muscle}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {rating.notes && (
                          <div className="mt-[8px] p-[8px] bg-[rgba(255,255,255,0.05)] rounded-[4px] border-l-[2px] border-[#8A2BE2]">
                            <div className="text-[12px] text-[#cccccc] mb-[4px]">User Notes:</div>
                            <div className="text-[13px] text-[#f1f1f1] leading-[1.4]">{rating.notes}</div>
                          </div>
                        )}
                        <div className="mt-[8px] text-[12px] text-[#999]">
                          <span>Last rated: {new Date(rating.lastRated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <footer className="bg-[#0A0A0A] text-white py-[60px] pb-[40px] mt-auto border-t border-[#222]">
        <div className="flex justify-between flex-wrap max-w-[1200px] mx-auto px-[20px]">
          <div className="flex-1 min-w-[200px] mx-[15px] mb-[30px]">
            <h3 className="mb-[20px] text-[#f1f1f1] text-[1.2rem] relative pb-[10px] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[40px] after:h-[2px] after:bg-[#8A2BE2]">GymRats</h3>
            <ul className="list-none p-0">
              <li className="mb-[12px]"><a href="/about" className="text-[#cccccc] no-underline transition-all duration-200 hover:text-[#8A2BE2] hover:pl-[5px]">About Us</a></li>
              <li className="mb-[12px]"><a href="/trainers" className="text-[#cccccc] no-underline transition-all duration-200 hover:text-[#8A2BE2] hover:pl-[5px]">Our Trainers</a></li>
              <li className="mb-[12px]"><a href="/testimonial" className="text-[#cccccc] no-underline transition-all duration-200 hover:text-[#8A2BE2] hover:pl-[5px]">Testimonials</a></li>
              <li className="mb-[12px]"><a href="/blog" className="text-[#cccccc] no-underline transition-all duration-200 hover:text-[#8A2BE2] hover:pl-[5px]">Blog</a></li>
            </ul>
          </div>
          <div className="flex-1 min-w-[200px] mx-[15px] mb-[30px]">
            <h3 className="mb-[20px] text-[#f1f1f1] text-[1.2rem] relative pb-[10px] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[40px] after:h-[2px] after:bg-[#8A2BE2]">Resources</h3>
            <ul className="list-none p-0">
              <li className="mb-[12px]"><a href="/isolation" className="text-[#cccccc] no-underline transition-all duration-200 hover:text-[#8A2BE2] hover:pl-[5px]">Exercise Guide</a></li>
              <li className="mb-[12px]"><a href="/nutrition" className="text-[#cccccc] no-underline transition-all duration-200 hover:text-[#8A2BE2] hover:pl-[5px]">Nutrition Tips</a></li>
              <li className="mb-[12px]"><a href="/workout_plans" className="text-[#cccccc] no-underline transition-all duration-200 hover:text-[#8A2BE2] hover:pl-[5px]">Workout Plans</a></li>
              <li className="mb-[12px]"><a href="/calculators" className="text-[#cccccc] no-underline transition-all duration-200 hover:text-[#8A2BE2] hover:pl-[5px]">Calculators</a></li>
            </ul>
          </div>
          <div className="flex-1 min-w-[200px] mx-[15px] mb-[30px]">
            <h3 className="mb-[20px] text-[#f1f1f1] text-[1.2rem] relative pb-[10px] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[40px] after:h-[2px] after:bg-[#8A2BE2]">Support</h3>
            <ul className="list-none p-0">
              <li className="mb-[12px]"><a href="/contact" className="text-[#cccccc] no-underline transition-all duration-200 hover:text-[#8A2BE2] hover:pl-[5px]">Contact Us</a></li>
              <li className="mb-[12px]"><a href="/terms" className="text-[#cccccc] no-underline transition-all duration-200 hover:text-[#8A2BE2] hover:pl-[5px]">Terms of Service</a></li>
              <li className="mb-[12px]"><a href="/privacy_policy" className="text-[#cccccc] no-underline transition-all duration-200 hover:text-[#8A2BE2] hover:pl-[5px]">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="flex-1 min-w-[200px] mx-[15px] mb-[30px]">
            <h3 className="mb-[20px] text-[#f1f1f1] text-[1.2rem] relative pb-[10px] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[40px] after:h-[2px] after:bg-[#8A2BE2]">Connect With Us</h3>
            <ul className="list-none p-0">
              <li className="mb-[12px]"><a href="/trainer_form" className="text-[#cccccc] no-underline transition-all duration-200 hover:text-[#8A2BE2] hover:pl-[5px]">Become a Trainer</a></li>
              <li className="mb-[12px]"><a href="/contact" className="text-[#cccccc] no-underline transition-all duration-200 hover:text-[#8A2BE2] hover:pl-[5px]">Contact Us</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TrainerDashboard;