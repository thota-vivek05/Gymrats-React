import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from './components/DashboardHeader';
import Footer from '../../components/common/Footer/Footer';

const UserNutrition = () => {
    const { user } = useAuth();
    
    // Determine membership styles
    const membershipType = user?.membershipType || 'Basic';
    
    const getTierColor = (type) => {
        switch(type?.toLowerCase()) {
            case 'platinum': return 'border-[#e5e4e2] text-[#e5e4e2]';
            case 'gold': return 'border-[#ffd700] text-[#ffd700]';
            default: return 'border-[#3498db] text-[#3498db]';
        }
    };
    
    const tierClass = getTierColor(membershipType);
    const borderColor = tierClass.split(' ')[0].replace('border-', '');

    return (
        <div className="min-h-screen bg-black text-gray-100 flex flex-col font-outfit">
            <DashboardHeader />

            {/* Welcome Banner */}
            <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-6">
                <div className="bg-gradient-to-br from-[#1e1e3a] to-[#0c0c1d] rounded-xl p-10 text-center shadow-lg border border-[#8A2BE2]/30">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 text-shadow">Evidence-Based Nutrition Guide</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">Science-backed nutrition strategies tailored to your fitness goals.</p>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
                
                {/* 1. Science Section */}
                <section className="bg-[#111] rounded-xl p-6 md:p-8 border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
                    <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-[#8A2BE2]">The Science of Nutrition for Athletes</h2>
                    <p className="text-gray-300 mb-6 text-lg">Understanding the scientific principles behind nutrition can help optimize your training and recovery. Below are key findings from recent research:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <ResearchCard 
                            title="Protein Timing"
                            desc="Research shows that distributing protein intake evenly throughout the day (20-40g per meal) maximizes muscle protein synthesis."
                            link="https://pubmed.ncbi.nlm.nih.gov/24257722/"
                            citation="Mamerow et al. (2014)"
                            finding="Consuming 25-30g of protein per meal stimulates maximal protein synthesis."
                        />
                        {/* Card 2 */}
                        <ResearchCard 
                            title="Carbohydrate Periodization"
                            desc="Strategic manipulation of carbohydrate intake based on training phases can enhance metabolic flexibility and performance."
                            link="https://pubmed.ncbi.nlm.nih.gov/29453741/"
                            citation="Impey et al. (2018)"
                            finding="'Train low, compete high' strategies can improve fat oxidation."
                        />
                        {/* Card 3 */}
                        <ResearchCard 
                            title="Fasting and Performance"
                            desc="Intermittent fasting protocols may provide metabolic benefits, but timing is crucial. Avoid fasting before high-intensity training."
                            link="https://pubmed.ncbi.nlm.nih.gov/27710558/"
                            citation="Tinsley & Willoughby (2016)"
                            finding="Fasting can impair performance in high-intensity training if not properly implemented."
                        />
                    </div>
                </section>

                {/* 2. Supplements Section */}
                <section className="bg-[#111] rounded-xl p-6 md:p-8 border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
                    <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-[#8A2BE2]">Evidence-Based Supplements</h2>
                    <p className="text-gray-300 mb-6 text-lg">These supplements have substantial scientific support for efficacy and safety:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SupplementCard 
                            title="Creatine Monohydrate"
                            rating={5}
                            desc="Increases strength, power output, and muscle mass. Beneficial for high-intensity exercise and recovery."
                            dosage="Loading: 20g/day for 5-7 days. Maintenance: 3-5g/day."
                            link="https://pubmed.ncbi.nlm.nih.gov/28615996/"
                            citation="Kreider et al. (2017)"
                        />
                        <SupplementCard 
                            title="Beta-Alanine"
                            rating={4}
                            desc="Improves performance in high-intensity exercise lasting 1-4 minutes by buffering acidity."
                            dosage="3.2-6.4g/day (divided into smaller doses to minimize tingling)."
                            link="https://pubmed.ncbi.nlm.nih.gov/30997908/"
                            citation="Trexler et al. (2015)"
                        />
                        <SupplementCard 
                            title="Vitamin D"
                            rating={4}
                            desc="Important for bone health and immune function. Deficiency is common in indoor athletes."
                            dosage="1,000-2,000 IU/day (based on blood work)."
                            link="https://pubmed.ncbi.nlm.nih.gov/29273683/"
                            citation="Owens et al. (2018)"
                        />
                    </div>
                </section>

                {/* 3. Strategies Table */}
                <section className="bg-[#111] rounded-xl p-6 md:p-8 border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
                    <h2 className="text-2xl font-bold text-white mb-6 pb-2 border-b border-[#8A2BE2]">Periodized Nutrition Strategies</h2>
                    
                    <div className="overflow-x-auto rounded-lg shadow-lg">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    {['Training Phase', 'Protein', 'Carbs', 'Fat', 'Key Considerations'].map(head => (
                                        <th key={head} className="bg-[#8A2BE2]/50 text-white p-4 font-semibold whitespace-nowrap">
                                            {head}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="text-gray-300">
                                <TableRow 
                                    phase="Hypertrophy" 
                                    pro="1.6-2.2g" 
                                    carb="4-7g" 
                                    fat="0.5-1.5g" 
                                    note="Slight caloric surplus; emphasis on post-workout." 
                                />
                                <TableRow 
                                    phase="Strength" 
                                    pro="1.6-2.0g" 
                                    carb="3-5g" 
                                    fat="0.8-1.5g" 
                                    note="Maintenance calories; focus on CNS recovery." 
                                />
                                <TableRow 
                                    phase="Fat Loss" 
                                    pro="2.0-2.4g" 
                                    carb="2-4g" 
                                    fat="0.8-1.2g" 
                                    note="Moderate deficit; high protein to preserve mass." 
                                />
                                <TableRow 
                                    phase="Performance" 
                                    pro="1.4-1.8g" 
                                    carb="5-10g" 
                                    fat="0.8-1.0g" 
                                    note="Carb loading; emphasis on workout fueling." 
                                />
                                <TableRow 
                                    phase="Maintenance" 
                                    pro="1.6-1.8g" 
                                    carb="3-5g" 
                                    fat="0.8-1.2g" 
                                    note="Caloric balance; nutrient consistency." 
                                />
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-6 flex items-start gap-3 bg-[#1a1a36] p-4 rounded-r-lg border-l-4 border-blue-500">
                        <span className="text-blue-500 mt-1">ℹ️</span>
                        <div>
                            <p className="text-sm text-gray-300">Based on research from the International Society of Sports Nutrition position stands.</p>
                            <a href="https://pubmed.ncbi.nlm.nih.gov/29642608/" target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline">
                                Kerksick et al. (2018)
                            </a>
                        </div>
                    </div>
                </section>

                {/* 4. Membership Exclusive Section */}
                <section className={`bg-[#111] rounded-xl p-6 md:p-8 border border-[#8A2BE2] shadow-lg relative overflow-hidden border-t-[6px] ${tierClass.split(' ')[0]}`}>
                    <h2 className={`text-2xl font-bold mb-2 ${tierClass.split(' ')[1]}`}>
                        {membershipType} Member Resources
                    </h2>
                    
                    <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-6 shadow-md">
                        <span>★</span> Exclusive Content
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FeatureCard 
                            title="Personalized Macro Calculator"
                            desc="Advanced algorithm that calculates precise macro needs based on your body composition."
                            borderColor={borderColor}
                        />
                        <FeatureCard 
                            title="Meal Timing Protocols"
                            desc="Science-based meal timing strategies to optimize performance and recovery."
                            borderColor={borderColor}
                        />
                        <FeatureCard 
                            title="Supplement Stack Builder"
                            desc="Create a personalized stack based on your specific goals and budget."
                            borderColor={borderColor}
                        />
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
};

/* --- Sub Components --- */

const ResearchCard = ({ title, desc, link, citation, finding }) => (
    <div className="bg-[#1e1e3a] p-6 rounded-lg border-l-4 border-blue-500 hover:-translate-y-1 transition-transform hover:shadow-lg hover:shadow-blue-500/10 flex flex-col h-full">
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 text-sm mb-4 flex-grow leading-relaxed">{desc}</p>
        <div className="bg-blue-500/10 p-2 rounded mb-3">
            <a href={link} target="_blank" rel="noreferrer" className="text-blue-400 text-xs font-medium hover:underline flex items-center gap-2">
                📄 {citation}
            </a>
        </div>
        <div className="bg-blue-500/10 p-3 rounded border-l-2 border-blue-500 text-xs text-gray-300">
            <strong className="text-blue-400 block mb-1">Key Finding:</strong>
            {finding}
        </div>
    </div>
);

const SupplementCard = ({ title, rating, desc, dosage, link, citation }) => (
    <div className="bg-[#1e1e3a] p-6 rounded-lg border-l-4 border-green-500 hover:-translate-y-1 transition-transform hover:shadow-lg hover:shadow-green-500/10 flex flex-col h-full">
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <div className="text-yellow-500 text-sm mb-3 tracking-widest">
            {'★'.repeat(rating)}{'☆'.repeat(5-rating)}
        </div>
        <p className="text-gray-400 text-sm mb-4 flex-grow">{desc}</p>
        <div className="bg-green-500/10 p-3 rounded mb-3">
            <h4 className="text-green-500 text-xs font-bold mb-1">Research-Based Dosage:</h4>
            <p className="text-gray-300 text-xs">{dosage}</p>
        </div>
        <a href={link} target="_blank" rel="noreferrer" className="text-green-500 text-xs hover:underline flex items-center gap-2 mt-auto">
            📄 {citation}
        </a>
    </div>
);

const TableRow = ({ phase, pro, carb, fat, note }) => (
    <tr className="border-b border-gray-800 even:bg-[#1a1a36] hover:bg-[#24244a] transition-colors">
        <td className="p-4 font-medium text-white">{phase}</td>
        <td className="p-4">{pro}/kg</td>
        <td className="p-4">{carb}/kg</td>
        <td className="p-4">{fat}/kg</td>
        <td className="p-4 text-sm text-gray-400">{note}</td>
    </tr>
);

const FeatureCard = ({ title, desc, borderColor }) => (
    <div 
        className="bg-[#1e1e3a] p-6 rounded-lg border border-transparent hover:border-[color:var(--border-color)] hover:-translate-y-1 transition-all duration-300"
        style={{ '--border-color': borderColor }}
    >
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

export default UserNutrition;