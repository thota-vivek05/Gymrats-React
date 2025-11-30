import React from 'react';

const Modal = ({ type, message, visible, onClose }) => {
    if (!visible) return null;
    
    const isError = type === 'error';
    const iconClass = isError ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';
    const title = isError ? 'Error' : 'Success';

    return (
        <div 
            className="fixed inset-0 z-[1000] bg-black/50 animate-[fadeIn_0.3s]"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white my-[15%] mx-auto p-0 rounded-xl w-[90%] max-w-[400px] shadow-[0_4px_20px_rgba(0,0,0,0.3)] animate-[slideIn_0.3s] overflow-hidden">
                <div className={`text-white p-5 text-center relative ${
                    isError 
                        ? 'bg-gradient-to-br from-[#ff6b6b] to-[#ee5a52]' 
                        : 'bg-gradient-to-br from-[#4ecdc4] to-[#44a08d]'
                }`}>
                    <button 
                        className="absolute right-[15px] top-[15px] text-white text-2xl cursor-pointer bg-transparent border-none w-[30px] h-[30px] rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                    <i className={`${iconClass} text-[2.5rem] mb-2.5 block`}></i>
                    <h3 className="m-0 text-[1.4rem] font-semibold">{title}</h3>
                </div>
                <div className="p-[25px] text-center text-[#555] text-base leading-relaxed">
                    <p>{message}</p>
                </div>
                <div className="px-[25px] pb-[25px] text-center">
                    <button 
                        className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none py-3 px-[30px] rounded-[25px] cursor-pointer text-base font-semibold transition-all min-w-[120px] hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(102,126,234,0.4)]"
                        onClick={onClose}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;