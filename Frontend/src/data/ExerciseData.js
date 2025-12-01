// src/data/ExerciseData.js

// Static data for muscle categories
export const categories = [
    { id: 'all', name: 'All Exercises' },
    { id: 'chest', name: 'Chest' },
    { id: 'back', name: 'Back' },
    { id: 'legs', name: 'Legs' },
    { id: 'shoulders', name: 'Shoulders' },
    { id: 'arms', name: 'Arms' },
    { id: 'abs', name: 'Abs' }
];

// Static data for exercises
export const exercises = [
    // Chest Exercises
    {
        id: 'chest-1',
        name: 'Bench Press',
        category: 'chest',
        description: 'The bench press is a compound exercise that primarily targets the pectoralis major, anterior deltoids, and triceps. It is a staple in any strength training program.',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1740&auto=format&fit=crop',
        muscles: ['Pectoralis Major', 'Anterior Deltoids', 'Triceps'],
        steps: [
            'Lie on a flat bench with your feet flat on the floor.',
            'Grip the bar slightly wider than shoulder-width apart.',
            'Unrack the bar and lower it to your mid-chest while keeping your elbows at about a 45-degree angle from your body.',
            'Press the bar back up to the starting position, extending your arms without locking your elbows.',
            'Repeat for the desired number of repetitions.'
        ],
        mindMuscle: 'Focus on squeezing your chest muscles throughout the movement. Imagine pushing yourself away from the bar rather than pushing the bar away from you.',
        videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg'
    },
    {
        id: 'chest-2',
        name: 'Incline Dumbbell Press',
        category: 'chest',
        description: 'The incline dumbbell press targets the upper portion of the pectoralis major and anterior deltoids, providing a comprehensive chest workout with greater range of motion than a barbell.',
        image: 'https://images.unsplash.com/photo-1530822847156-e092cb0bcad2?q=80&w=1740&auto=format&fit=crop',
        muscles: ['Upper Pectoralis Major', 'Anterior Deltoids', 'Triceps'],
        steps: [
            'Set an adjustable bench to a 30-45 degree incline.',
            'Sit on the bench with a dumbbell in each hand, resting them on your thighs.',
            'Kick the weights up one at a time as you lean back and position the dumbbells at shoulder width.',
            'Press the dumbbells upward until your arms are extended, without locking your elbows.',
            'Lower the weights slowly until your elbows form slightly less than a 90-degree angle.',
            'Press back up to the starting position and repeat.'
        ],
        mindMuscle: 'Focus on leading with your chest rather than your shoulders. Keep your shoulder blades retracted and pressed into the bench throughout the movement.',
        videoUrl: 'https://www.youtube.com/embed/8iPEnn-ltC8'
    },
    // Back Exercises
    {
        id: 'back-1',
        name: 'Pull-ups',
        category: 'back',
        description: 'Pull-ups are a challenging compound exercise that primarily targets the latissimus dorsi, rhomboids, and biceps, while also engaging your core for stability.',
        image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1587&auto=format&fit=crop',
        muscles: ['Latissimus Dorsi', 'Rhomboids', 'Biceps', 'Rear Deltoids', 'Core'],
        steps: [
            'Grab a pull-up bar with your palms facing away from you, hands slightly wider than shoulder-width apart.',
            'Hang with your arms fully extended and your shoulders engaged (not relaxed).',
            'Pull yourself up by driving your elbows down and back until your chin clears the bar.',
            'Lower yourself with control back to the starting position.',
            'Repeat for the desired number of repetitions.'
        ],
        mindMuscle: 'Imagine squeezing a pencil between your shoulder blades at the top of the movement. Focus on pulling with your back muscles rather than your arms.',
        videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g'
    },
    {
        id: 'back-2',
        name: 'Bent-Over Barbell Row',
        category: 'back',
        description: 'The bent-over barbell row is a compound exercise that targets the latissimus dorsi, rhomboids, rear deltoids, and biceps, helping to build a stronger, more defined back.',
        image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=1587&auto=format&fit=crop',
        muscles: ['Latissimus Dorsi', 'Rhomboids', 'Trapezius', 'Rear Deltoids', 'Biceps', 'Erector Spinae'],
        steps: [
            'Stand with your feet shoulder-width apart, knees slightly bent.',
            'Bend at the hips, keeping your back straight until your torso is nearly parallel to the floor.',
            'Grip the barbell with hands slightly wider than shoulder-width apart, palms facing down.',
            'Pull the barbell toward your lower ribcage, keeping your elbows close to your body.',
            'Squeeze your shoulder blades together at the top of the movement.',
            'Lower the barbell back to the starting position with control.',
            'Repeat for the desired number of repetitions.'
        ],
        mindMuscle: 'Focus on driving your elbows up and back rather than just lifting the weight. Imagine trying to touch your elbows to the ceiling to maximize lat engagement.',
        videoUrl: 'https://www.youtube.com/embed/FWJR5-0GrZQ'
    },
    // Leg Exercises
    {
        id: 'legs-1',
        name: 'Squats',
        category: 'legs',
        description: 'Squats are a fundamental compound exercise that primarily targets the quadriceps, hamstrings, and glutes while also engaging the core and lower back for stability.',
        image: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=1470&auto=format&fit=crop',
        muscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Adductors', 'Calves', 'Core'],
        steps: [
            'Stand with feet shoulder-width apart, toes pointed slightly outward.',
            'Rest a barbell across your upper back (not on your neck).',
            'Brace your core and maintain a neutral spine.',
            'Bend at the knees and hips to lower your body, keeping your chest up.',
            'Lower until your thighs are at least parallel to the ground, or as low as you can with proper form.',
            'Drive through your heels to return to the starting position.',
            'Repeat for the desired number of repetitions.'
        ],
        mindMuscle: 'Focus on sitting back into the squat rather than forward. Imagine spreading the floor apart with your feet to engage your glutes more effectively.',
        videoUrl: 'https://www.youtube.com/embed/bEv6CCg2BC8'
    },
    {
        id: 'legs-2',
        name: 'Lunges',
        category: 'legs',
        description: 'Lunges are a unilateral exercise that targets the quadriceps, hamstrings, and glutes while also improving balance, coordination, and functional strength.',
        image: 'https://images.unsplash.com/photo-1616803689943-5601631c7fec?q=80&w=1470&auto=format&fit=crop',
        muscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core'],
        steps: [
            'Start standing with feet hip-width apart.',
            'Take a step forward with your right foot, landing heel first.',
            'Lower your body until both knees are bent at about 90 degrees.',
            'Your back knee should hover just above the ground.',
            'Push through your right heel to return to the starting position.',
            'Repeat with the left leg, alternating legs for the desired number of repetitions.'
        ],
        mindMuscle: 'Focus on keeping your upper body straight and your core engaged. Drive through the heel of your front foot to emphasize glute activation on the way up.',
        videoUrl: 'https://www.youtube.com/embed/QOVaHwm-Q6U'
    },
    // Shoulders Exercises
    {
        id: 'shoulders-1',
        name: 'Overhead Press',
        category: 'shoulders',
        description: 'The overhead press is a fundamental compound exercise that targets the entire shoulder complex while also engaging the triceps and upper chest.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60',
        muscles: ['Anterior Deltoids', 'Lateral Deltoids', 'Triceps', 'Upper Chest'],
        steps: [
            'Stand with feet shoulder-width apart, holding a barbell at shoulder height.',
            'Grip the bar slightly wider than shoulder-width, palms facing forward.',
            'Brace your core and keep your chest up.',
            'Press the bar directly overhead until your arms are fully extended.',
            'Lower the bar with control back to shoulder height.',
            'Repeat for the desired number of repetitions.'
        ],
        mindMuscle: 'Focus on pushing the bar straight up rather than arching your back. Squeeze your shoulder blades together at the top of the movement.',
        videoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI'
    },
    // Arms Exercises
    {
        id: 'arms-1',
        name: 'Bicep Curls',
        category: 'arms',
        description: 'Bicep curls are the fundamental exercise for building bicep size and strength, directly targeting the biceps brachii muscle.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60',
        muscles: ['Biceps Brachii', 'Brachialis', 'Forearms'],
        steps: [
            'Stand with feet shoulder-width apart, holding dumbbells at your sides.',
            'Keep your elbows close to your body and your palms facing forward.',
            'Curl the weights upward while keeping your upper arms stationary.',
            'Squeeze your biceps at the top of the movement.',
            'Lower the weights with control back to the starting position.',
            'Repeat for the desired number of repetitions.'
        ],
        mindMuscle: 'Focus on squeezing your biceps at the top of each rep. Avoid swinging your body or using momentum to lift the weight.',
        videoUrl: 'https://www.youtube.com/embed/ykJmrZ5v0Oo'
    },
    // Abs Exercises
    {
        id: 'abs-1',
        name: 'Crunches',
        category: 'abs',
        description: 'Crunches are a classic abdominal exercise that targets the rectus abdominis, helping to build core strength and definition.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60',
        muscles: ['Rectus Abdominis', 'Obliques'],
        steps: [
            'Lie on your back with knees bent and feet flat on the floor.',
            'Place your hands behind your head or crossed over your chest.',
            'Engage your core and lift your upper back off the floor.',
            'Curl your torso toward your knees, focusing on contracting your abs.',
            'Lower back down with control, keeping tension in your abs.',
            'Repeat for the desired number of repetitions.'
        ],
        mindMuscle: 'Focus on curling your torso rather than just lifting it. Imagine bringing your ribcage toward your pelvis with each repetition.',
        videoUrl: 'https://www.youtube.com/embed/MKmrqcoCZ-M'
    },
];