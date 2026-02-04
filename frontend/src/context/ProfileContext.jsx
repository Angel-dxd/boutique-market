import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    // Load from local storage or default
    const [profile, setProfile] = useState(() => {
        try {
            const saved = localStorage.getItem('ohNailsProfile');
            return saved ? JSON.parse(saved) : {
                name: 'Arelys Marquez',
                title: 'Especialista en Estética Avanzada',
                photo: null
            };
        } catch (e) {
            console.error("Profile load error", e);
            return {
                name: 'Arelys Marquez',
                title: 'Especialista en Estética Avanzada',
                photo: null
            };
        }
    });

    useEffect(() => {
        localStorage.setItem('ohNailsProfile', JSON.stringify(profile));
    }, [profile]);

    const updatePhoto = (file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfile(prev => ({ ...prev, photo: reader.result }));
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const updateProfile = (newData) => {
        setProfile(prev => ({ ...prev, ...newData }));
    };

    return (
        <ProfileContext.Provider value={{ profile, updatePhoto, updateProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};
