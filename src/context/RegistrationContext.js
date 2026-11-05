import { createContext, useContext, useState } from "react";

const RegistrationContext = createContext();

export function RegistrationProvider({ children }) {
    const [formData, setFormData] = useState({});
    const updateFormData = (field, value) => {
        setFormData((previousData) => ({
            ...previousData,
            [field]: value
        }));
    };

    return (
        <RegistrationContext.Provider value={{ formData, updateFormData }}>
            {children}
        </RegistrationContext.Provider>
    );
}

export function useRegistration() {
    return useContext(RegistrationContext);
}