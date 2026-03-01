import React from 'react';

const UserDetailsModal = ({ user, details, onClose }) => {
  if (!user || !details) return null;

  const { profile, trainer, membership, lifecycle } = details;

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
      <div className="bg-[#1e1e3a] border border-[#8A2BE2] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto text-[#f1f1f1] font-['Outfit']">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#333] bg-[#111]">
          <div>
            <h2 className="text-2xl font-bold text-white">{profile.full_name}</h2>
            <span className={`text-sm px-3 py-1 rounded-full mt-2 inline-block ${
              membership.status === 'Expired' ? 'bg-red-500/20 text-red-400 border border-red-500' :
              membership.status === 'Renew Soon' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500' :
              'bg-green-500/20 text-green-400 border border-green-500'
            }`}>
              {membership.status}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Personal & Trainer Info */}
          <div className="space-y-6">
            <div className="bg-[#111] p-4 rounded-lg border border-[#333]">
              <h3 className="text-[#8A2BE2] text-lg font-bold mb-4 border-b border-[#333] pb-2">Personal Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Email:</span> {profile.email}</p>
                <p><span className="text-gray-400">Phone:</span> {profile.phone}</p>
                <p><span className="text-gray-400">Join Date:</span> {new Date(lifecycle.joinDate).toLocaleDateString()}</p>
                <p><span className="text-gray-400">Gender:</span> {profile.gender}</p>
                <p><span className="text-gray-400">BMI:</span> {profile.BMI || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-[#111] p-4 rounded-lg border border-[#333]">
              <h3 className="text-[#8A2BE2] text-lg font-bold mb-4 border-b border-[#333] pb-2">Assigned Trainer</h3>
              {trainer ? (
                <div className="text-sm">
                  <p className="font-bold text-white text-base">{trainer.name}</p>
                  <p className="text-gray-400">{trainer.email}</p>
                  <p className="mt-2 text-xs bg-[#8A2BE2]/20 inline-block px-2 py-1 rounded text-[#8A2BE2] border border-[#8A2BE2]/50">
                    {trainer.specializations?.join(', ') || 'General Trainer'}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No trainer assigned.</p>
              )}
            </div>
          </div>

          {/* Right Column: Membership Lifecycle */}
          <div className="space-y-6">
             <div className="bg-[#111] p-4 rounded-lg border border-[#333]">
              <h3 className="text-[#8A2BE2] text-lg font-bold mb-4 border-b border-[#333] pb-2">Current Membership</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#222] p-3 rounded text-center">
                  <span className="block text-gray-400 text-xs">Plan Type</span>
                  <span className="text-xl font-bold text-white">{membership.currentType}</span>
                </div>
                <div className="bg-[#222] p-3 rounded text-center">
                  <span className="block text-gray-400 text-xs">Days Remaining</span>
                  <span className="text-xl font-bold text-white">{membership.daysRemaining}</span>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <p><span className="text-gray-400">Start Date:</span> {new Date(membership.startDate).toLocaleDateString()}</p>
                <p><span className="text-gray-400">Renewal Date:</span> {new Date(membership.endDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-[#111] p-4 rounded-lg border border-[#333]">
              <h3 className="text-[#8A2BE2] text-lg font-bold mb-4 border-b border-[#333] pb-2">Payment/Renewal History</h3>
              <div className="max-h-[150px] overflow-y-auto space-y-2">
                {membership.history && membership.history.length > 0 ? (
                  membership.history.map((record, index) => (
                    <div key={index} className="flex justify-between items-center text-xs p-2 bg-[#222] rounded border-l-2 border-[#8A2BE2]">
                      <div>
                        <span className="block font-bold text-white">{record.type} Membership</span>
                        <span className="text-gray-500">{new Date(record.start_date).toLocaleDateString()}</span>
                      </div>
                      <span className="text-green-400 font-bold">₹{record.price}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-sm">No history available.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;