import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import styles from './TrainerDashboard.module.css';

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
  const navigate = useNavigate(); // Hook for navigation

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

  // 3. LOGOUT HANDLER
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
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

  // 1. NUTRITION CHART LOGIC (Updated for Empty State)
  const getNutritionChartData = () => {
    const protein = nutritionData?.nutrition?.macros?.protein || 0;
    const carbs = nutritionData?.nutrition?.macros?.carbs || 0;
    const fats = nutritionData?.nutrition?.macros?.fats || 0;
    const total = protein + carbs + fats;

    if (total === 0) {
        // Return gray placeholder data if empty
        return {
            labels: ['Empty'],
            datasets: [{
                data: [1], // Dummy value to make the ring appear
                backgroundColor: ['#333333'], // Dark gray
                borderWidth: 0,
                tooltip: { enabled: false } // Disable tooltips for placeholder
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
        // Hide legend if it's the placeholder "Empty" state
        display: (ctx) => {
            const data = ctx.chart.data;
            if (data.labels.length === 1 && data.labels[0] === 'Empty') return false;
            return true;
        }
      },
      tooltip: {
        enabled: (ctx) => {
             // Disable tooltips for placeholder
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
        data: [0, 0, 0, 0, 0, 0], // Placeholder data
        borderColor: '#8A2BE2',
        backgroundColor: 'rgba(138, 43, 226, 0.1)',
        tension: 0.3
      },
      {
        label: 'Deadlift (kg)',
        data: [0, 0, 0, 0, 0, 0], // Placeholder data
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
    <div className={styles.container}>
      <div className={styles.mainNavbar}>
        <header className={styles.header}>
          <div className={styles.brandLogo}>
            <a href="/trainer" className={styles.brandName}>GymRats</a>
          </div>
          <div className={styles.navMenu}>
            <a href="/trainer">Home</a>
          </div>
          <div className={styles.rightContainer}>
            <div className={styles.loginButton}>
              {/* 3. UPDATED LOGOUT BUTTON */}
              <button 
                onClick={handleLogout} 
                style={{
                  backgroundColor: '#8A2BE2',
                  padding: '8px 16px',
                  borderRadius: '30px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          </div>
          <div className={styles.mobileMenuIcon} onClick={() => setSidebarOpen(true)}>
            <span>☰</span>
          </div>
        </header>
      </div>

      <div className={`${styles.mobileSidebar} ${sidebarOpen ? styles.open : ''}`}>
        <a href="#" className={styles.closeButton} onClick={() => setSidebarOpen(false)}>×</a>
        <a href="/trainer">Home</a>
        <button onClick={handleLogout} className={styles.mobileLogoutBtn} style={{background:'transparent', border:'none', color:'white', fontSize:'18px', padding:'8px 8px 8px 32px', cursor:'pointer', textAlign:'left', width:'100%'}}>Logout</button>
      </div>

      <div className={styles.welcomeBanner}>
        <h1>Welcome, {trainer.name}</h1>
        <p>Manage your clients and track their progress</p>
        {/* 2. REMOVED "View Available Clients" BUTTON */}
      </div>

      <div className={styles.mainContent}>
        {/* Client List */}
        <div className={styles.clientListContainer}>
          <h2>Client List</h2>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <div className={styles.clientList}>
            {filteredClients.length === 0 ? (
              <p>No clients found.</p>
            ) : (
              filteredClients.map(client => (
                <div
                  key={client._id || client.id}
                  className={`${styles.clientItem} ${(selectedClient?._id || selectedClient?.id) === (client._id || client.id) ? styles.active : ''}`}
                  onClick={() => handleClientSelect(client)}
                >
                  <div className={styles.clientName}>
                    {client.full_name}
                    <span className={`${styles.membershipBadge} ${styles[`membership${client.membershipType?.toLowerCase() || 'basic'}`]}`}>
                      {client.membershipType || 'Basic'}
                    </span>
                  </div>
                  <div className={styles.clientStats}>
                    <span>Progress: {client.progress || 0}%</span>
                    <span>Status: {client.status || 'Active'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Client Details */}
        <div className={styles.clientDetailsContainer}>
          {loading ? (
            <div className={styles.loading}>Loading client data...</div>
          ) : !selectedClient ? (
            <div className={styles.noSelection}>Select a client to view details</div>
          ) : (
            <>
              <div className={styles.topRow}>
                <div className={styles.clientProfile}>
                  <h2>Client Profile: {clientProfile?.full_name || selectedClient.full_name}</h2>
                  <div className={styles.profileStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Age:</span>
                      <span className={styles.statValue}>{calculateAge(clientProfile?.dob)}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Weight:</span>
                      <span className={styles.statValue}>{clientProfile?.weight ? `${clientProfile.weight} kg` : 'N/A'}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Height:</span>
                      <span className={styles.statValue}>{clientProfile?.height ? `${clientProfile.height} cm` : 'N/A'}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>BMI:</span>
                      <span className={styles.statValue}>{clientProfile?.BMI || 'N/A'}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Body Fat:</span>
                      <span className={styles.statValue}>{clientProfile?.bodyFat ? `${clientProfile.bodyFat}%` : 'N/A'}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Goal:</span>
                      <span className={styles.statValue}>{clientProfile?.goal || 'N/A'}</span>
                    </div>
                  </div>
                  {shouldShowMeet && (
                    <button className={`${styles.btn} ${styles.meetButton}`} onClick={() => window.open('https://meet.google.com/xyz-abcd-123', '_blank')}>
                      Join Google Meet
                    </button>
                  )}
                </div>

                <div className={styles.workoutPlan}>
                  <h2>Weekly Workout Schedule</h2>
                  <div className={styles.weeklySchedule}>
                    {!workoutData?.weeklySchedule ? (
                      <p>No workout plan available.</p>
                    ) : (
                      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <div key={day} className={styles.daySchedule}>
                          <h3>{day}</h3>
                          {workoutData.weeklySchedule[day]?.length === 0 ? (
                            <p>No exercises scheduled.</p>
                          ) : (
                            <div className={styles.exercisesList}>
                              {workoutData.weeklySchedule[day]?.map((exercise, idx) => (
                                <div key={idx} className={styles.exerciseItem}>
                                  <span className={styles.exerciseName}>{idx + 1}. {exercise.name}</span>
                                  <span className={styles.exerciseDetails}>
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
                    className={`${styles.btn} ${!selectedClient ? styles.disabled : ''}`}
                  >
                    Edit Workout Plan
                  </Link>
                </div>
              </div>

              <div className={styles.currentStats}>
                <h2>Current Stats</h2>
                <div className={styles.statsGrid}>
                  <div className={styles.statBox}>
                    <h3>Total Workouts Completed</h3>
                    <p className={styles.statValue}>{stats.workoutsCompleted}</p>
                  </div>
                  <div className={styles.statBox}>
                    <h3>Average Calories Consumed</h3>
                    <p className={styles.statValue}>{Math.round(stats.totalCalories)} kcal</p>
                  </div>
                  <div className={styles.statBox}>
                    <h3>Protein Intake vs Goal</h3>
                    <p className={styles.statValue}>{Math.round(stats.totalProtein)}g / {stats.proteinGoal}g</p>
                  </div>
                </div>
                <h3>Exercise Progress Timeline</h3>
                <div className={styles.chartContainer}>
                  <Line data={exerciseChartData} options={exerciseChartOptions} />
                </div>
              </div>

              {shouldShowNutrition && (
                <div className={styles.nutritionPlan}>
                  <h2>Food Intake</h2>
                  <div className={styles.nutritionGoal}>
                    <p>Today's protein goal: <span>{stats.proteinGoal}g</span></p>
                    <p>Calories: <span>{stats.calorieGoal} kcal</span></p>
                  </div>
                  <h3>Foods to Take:</h3>
                  <div className={styles.foodsList}>
                    {!nutritionData?.nutrition?.foods || nutritionData.nutrition.foods.length === 0 ? (
                      <p>No foods assigned yet.</p>
                    ) : (
                      nutritionData.nutrition.foods.map((food, idx) => (
                        <p key={idx}>{food.name} ({food.protein}g protein, {food.calories} kcal)</p>
                      ))
                    )}
                  </div>
                  <div className={styles.goalsReached}>
                    <p>
                      {stats.totalProtein >= stats.proteinGoal && stats.totalCalories >= stats.calorieGoal
                        ? 'All food goals reached for today! 🎉'
                        : `Working towards goals: ${Math.round(stats.totalProtein)}/${stats.proteinGoal}g protein, ${Math.round(stats.totalCalories)}/${stats.calorieGoal} calories`
                      }
                    </p>
                  </div>
                  <h3>Nutritional Breakdown</h3>
                  <div className={styles.pieChartContainer}>
                    {/* 1. UPDATED CHART RENDERING */}
                    <Doughnut data={getNutritionChartData()} options={nutritionChartOptions} />
                  </div>
                  <Link 
                    to={selectedClient ? `/trainer/nutrition/edit/${selectedClient._id || selectedClient.id}` : '#'}
                    className={styles.btn}
                  >
                    Edit Nutrition Plan
                  </Link>
                </div>
              )}

              <div className={styles.exerciseRatings}>
                <h2>Exercise Preferences & Ratings</h2>
                <div className={styles.ratingsHeader}>
                  <p>Sorted by user's highest rated exercises first</p>
                </div>
                <div className={styles.ratingsContainer}>
                  {exerciseRatings.length === 0 ? (
                    <div className={styles.noRatings}>
                      <p>No exercise ratings available for this client yet.</p>
                    </div>
                  ) : (
                    exerciseRatings.map((rating, idx) => (
                      <div key={idx} className={styles.ratingItem}>
                        <div className={styles.ratingHeader}>
                          <h4>{rating.exerciseName}</h4>
                          <div className={styles.ratingStars}>
                            <span className={styles.stars}>{renderStars(rating.rating)}</span>
                            <span className={styles.ratingValue}>{rating.rating}/5</span>
                          </div>
                        </div>
                        <div className={styles.ratingMeta}>
                          <span className={styles.metaBadge}>{rating.category}</span>
                          <span className={styles.metaBadge}>{rating.difficulty}</span>
                          <span className={`${styles.metaBadge} ${styles.effectivenessBadge}`}>{rating.effectiveness}</span>
                          <span className={`${styles.metaBadge} ${styles.workoutTypeBadge}`}>{rating.workoutType}</span>
                        </div>
                        {rating.targetMuscles?.length > 0 && (
                          <div className={styles.targetMuscles}>
                            <div className={styles.musclesLabel}>Target Muscles:</div>
                            <div className={styles.musclesList}>
                              {rating.targetMuscles.map((muscle, mIdx) => (
                                <span key={mIdx} className={styles.muscleTag}>{muscle}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {rating.notes && (
                          <div className={styles.ratingNotes}>
                            <div className={styles.notesLabel}>User Notes:</div>
                            <div className={styles.notesContent}>{rating.notes}</div>
                          </div>
                        )}
                        <div className={styles.ratingFooter}>
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

      <footer className={styles.siteFooter}>
        <div className={styles.footerContent}>
          <div className={styles.footerColumn}>
            <h3>GymRats</h3>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/trainers">Our Trainers</a></li>
              <li><a href="/testimonial">Testimonials</a></li>
              <li><a href="/blog">Blog</a></li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h3>Resources</h3>
            <ul>
              <li><a href="/isolation">Exercise Guide</a></li>
              <li><a href="/nutrition">Nutrition Tips</a></li>
              <li><a href="/workout_plans">Workout Plans</a></li>
              <li><a href="/calculators">Calculators</a></li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h3>Support</h3>
            <ul>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/privacy_policy">Privacy Policy</a></li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h3>Connect With Us</h3>
            <ul>
              <li><a href="/trainer_form">Become a Trainer</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TrainerDashboard;