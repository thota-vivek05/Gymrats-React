import React, { useState, useEffect } from 'react';
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

  // ✅ FIXED: Your routes are mounted at /api/trainer in server.js
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

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
    // Get trainer name from localStorage
    const trainerData = JSON.parse(localStorage.getItem('user') || '{}');
    if (trainerData.name) setTrainer(trainerData);
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found in localStorage');
        alert('Please login again - no authentication token found');
        window.location.href = '/login';
        return;
      }
      
      console.log('Fetching clients...');
      
      // ✅ FIXED: Use /api/trainer/clients (from server.js mount)
      const response = await fetch(`${API_BASE}/clients`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      // Check if response is HTML (error page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('Received HTML instead of JSON');
        throw new Error('API route not found or authentication failed');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('✅ Fetched clients:', data);
      
      // ✅ Your backend returns array directly
      const clientsList = Array.isArray(data) ? data : [];
      
      if (clientsList.length === 0) {
        console.warn('No clients assigned to this trainer yet');
      }
      
      setClients(clientsList);
      
      // Auto-select first client
      if (clientsList.length > 0) {
        handleClientSelect(clientsList[0]);
      }
    } catch (error) {
      console.error('❌ Error fetching clients:', error);
      alert(`Failed to load clients: ${error.message}`);
    }
  };

  const handleClientSelect = async (client) => {
    console.log('Selected client:', client);
    setSelectedClient(client);
    setLoading(true);
    setSidebarOpen(false);

    // Use _id for MongoDB
    const clientId = client._id || client.id;
    
    if (!clientId) {
      console.error('Client ID not found:', client);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      console.log(`Fetching data for client ID: ${clientId}`);

      // ✅ FIXED: All routes use /api/trainer prefix
      const [profileRes, workoutRes, nutritionRes, ratingsRes] = await Promise.all([
        fetch(`${API_BASE}/client/${clientId}`, { headers }),
        fetch(`${API_BASE}/workout/${clientId}`, { headers }),
        fetch(`${API_BASE}/nutrition/${clientId}`, { headers }),
        fetch(`${API_BASE}/exercise-ratings/${clientId}`, { headers }).catch(() => ({ json: () => ({ success: false, ratings: [] }) }))
      ]);

      const [profile, workout, nutrition, ratings] = await Promise.all([
        profileRes.json(),
        workoutRes.json(),
        nutritionRes.json(),
        ratingsRes.json()
      ]);

      console.log('Profile:', profile);
      console.log('Workout:', workout);
      console.log('Nutrition:', nutrition);
      console.log('Ratings:', ratings);

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

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
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

    // Use fitness_goals fields from User model
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

  // Nutrition Chart Data
  const nutritionChartData = {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [{
      data: [
        nutritionData?.nutrition?.macros?.protein || 0,
        nutritionData?.nutrition?.macros?.carbs || 0,
        nutritionData?.nutrition?.macros?.fats || 0
      ],
      backgroundColor: ['#8A2BE2', '#20B2AA', '#FF6347'],
      borderWidth: 0
    }]
  };

  const nutritionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#f1f1f1', padding: 10 }
      }
    }
  };

  // Exercise Chart Data
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
    <div className={styles.container}>
      {/* Navigation */}
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
              <a href="/trainer_login">Logout</a>
            </div>
          </div>
          <div className={styles.mobileMenuIcon} onClick={() => setSidebarOpen(true)}>
            <span>☰</span>
          </div>
        </header>
      </div>

      {/* Mobile Sidebar */}
      <div className={`${styles.mobileSidebar} ${sidebarOpen ? styles.open : ''}`}>
        <a href="#" className={styles.closeButton} onClick={() => setSidebarOpen(false)}>×</a>
        <a href="/trainer">Home</a>
        <a href="/trainer_login">Logout</a>
      </div>

      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <h1>Welcome, {trainer.name}</h1>
        <p>Manage your clients and track their progress</p>
        <a href="/trainer/assignment" className={styles.btn}>View Available Clients</a>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Client List Sidebar */}
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
              {/* Top Row */}
              <div className={styles.topRow}>
                {/* Client Profile */}
                <div className={styles.clientProfile}>
                  <h2>Client Profile: {clientProfile?.full_name || selectedClient.full_name}</h2>
                  <div className={styles.profileStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Age:</span>
                      <span className={styles.statValue}>{calculateAge(clientProfile?.dob)}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Gender:</span>
                      <span className={styles.statValue}>{clientProfile?.gender || 'N/A'}</span>
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
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Workout Type:</span>
                      <span className={styles.statValue}>{clientProfile?.workout_type || 'N/A'}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Weight Goal:</span>
                      <span className={styles.statValue}>{clientProfile?.fitness_goals?.weight_goal ? `${clientProfile.fitness_goals.weight_goal} kg` : 'N/A'}</span>
                    </div>
                  </div>
                  {shouldShowMeet && (
                    <button className={`${styles.btn} ${styles.meetButton}`} onClick={() => window.open('https://meet.google.com/xyz-abcd-123', '_blank')}>
                      Join Google Meet
                    </button>
                  )}
                </div>

                {/* Weekly Workout Schedule */}
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
                  <a href={`/edit_workout_plan/${selectedClient._id || selectedClient.id}`} className={styles.btn}>Edit Workout Plan</a>
                </div>
              </div>

              {/* Current Stats */}
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

              {/* Nutrition Plan */}
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
                    <Doughnut data={nutritionChartData} options={nutritionChartOptions} />
                  </div>
                  <a href={`/edit_nutritional_plan/${selectedClient._id || selectedClient.id}`} className={styles.btn}>Edit Nutrition Plan</a>
                </div>
              )}

              {/* Exercise Ratings */}
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

      {/* Footer */}
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