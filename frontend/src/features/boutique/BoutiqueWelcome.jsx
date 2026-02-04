import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../../context/ProfileContext';
import { Camera, ArrowRight, User } from 'lucide-react';

const BoutiqueWelcome = ({ onEnter }) => {
    const { profile, updatePhoto } = useProfile();
    const [isHoveringPhoto, setIsHoveringPhoto] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            updatePhoto(e.target.files[0]);
        }
    };

    // Safeguard logic
    if (!profile) return null;

    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5, pointerEvents: 'none' }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full relative overflow-hidden"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                layoutId="dashboard-container"
            >
                {/* Decorative Background Blurs */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50 to-transparent"></div>

                {/* Profile Photo */}
                <div
                    className="relative w-32 h-32 mb-6 z-10 group"
                    onMouseEnter={() => setIsHoveringPhoto(true)}
                    onMouseLeave={() => setIsHoveringPhoto(false)}
                >
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg bg-emerald-100 flex items-center justify-center text-4xl font-bold text-boutique">
                        {profile?.photo ? (
                            <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span>AM</span>
                        )}
                    </div>

                    {/* Upload Overlay */}
                    <label className={`absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity duration-200 ${isHoveringPhoto ? 'opacity-100' : 'opacity-0'}`}>
                        <Camera size={24} />
                        <span className="text-xs mt-1">Cambiar</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                </div>

                {/* Text Info */}
                <div className="text-center z-10 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">{profile?.name || 'Arelys Marquez'}</h2>
                    <p className="text-boutique font-medium text-sm">{profile?.title || 'Estética Avanzada'}</p>
                </div>

                {/* Enter Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onEnter}
                    className="w-full bg-boutique text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-[#047857] transition-all flex items-center justify-center gap-2 z-10"
                >
                    Entrar al Panel <ArrowRight size={20} />
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default BoutiqueWelcome;
