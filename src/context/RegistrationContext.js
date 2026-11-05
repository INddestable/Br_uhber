import { createContext, useContext, useState } from "react";

const RegistrationContext = createContext();

export function RegistrationProvider({ children }) {
    const [formData, setFormData] = useState({});

    return (
        <RegistrationContext.Provider value={{ formData, setFormData }}>
            {children}
        </RegistrationContext.Provider>
    );
}

export function useRegistration() {
    return useContext(RegistrationContext);
}