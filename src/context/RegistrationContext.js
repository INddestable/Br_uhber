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
    const clearFormData = () => {
        setFormData({});
    };

    return (
        <RegistrationContext.Provider     value={{ formData, updateFormData, clearFormData }}>
            {children}
        </RegistrationContext.Provider>
    );
}

export function useRegistration() {
    return useContext(RegistrationContext);
}