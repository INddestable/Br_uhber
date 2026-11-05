# AI Usage Log — Bruhber

## Project Context

**Bruhber** is a mobile application inspired by ride-hailing platforms, focused on the driver's experience. The project includes driver registration, vehicle information management, document submission, authentication, account approval workflows, and a configurable user interface.

Artificial intelligence tools were used as technical support during development, mainly for architectural guidance, integration questions, troubleshooting, code examples, and documentation.

The development process involved reviewing suggestions, adapting implementations to the project's existing structure, integrating the changes, and testing the resulting functionality.

---

### Entry #1 — Application Architecture and Firebase Integration

- **Date:** 2026-11-04
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Understand how to organize the mobile application's navigation and connect Firebase to an Expo project.
- **Prompt:** "En Firebase tengo solo el proyecto, no he ni agregado la app (aunque la agregaré como web para que me dé el archivo JS con el Firebase configurado). ¿Ese archivo sí se sube a GitHub? Porque ese archivo sé que tiene la key y no creo que sea muy seguro subir esa key."
- **Response summary:** The tool explained the Firebase client configuration, the distinction between public configuration values and private credentials, and how Firebase Authentication and Firestore fit into the application architecture.
- **Used / modified / discarded:** Used the integration guidance and adapted the Firebase configuration to the project's directory structure. The final implementation was tested against the actual Firebase project.
- **Files involved:** `src/config/firebase.js`, `src/context/AuthContext.js`, navigation configuration.
- **Commit:** [Add actual commit hash]
- **Verification:** Firebase Authentication and Firestore were connected and tested through the registration and login flows.
- **Learning:** Understood how Firebase client configuration works, why private service credentials must not be exposed, and how authentication and database services are integrated into a mobile application.

---

### Entry #2 — Cloudinary Integration

- **Date:** 2026-11-04
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Determine how to upload driver photographs, vehicle images, and documentation to Cloudinary from an Expo application.
- **Prompt:** Reconstructed from the original consultation: "¿Cómo puedo conectar Cloudinary con Expo para subir las fotografías y documentos del registro de conductores?"
- **Response summary:** The tool explained the use of Cloudinary upload presets, the upload request structure, and how to handle image uploads from the mobile application without exposing private API credentials.
- **Used / modified / discarded:** The suggested integration approach was adapted to the project's Expo environment and upload requirements. The final implementation uses the configured Cloudinary cloud name and unsigned upload preset.
- **Files involved:** `src/services/driverScreen.js`, registration screens, Cloudinary configuration.
- **Commit:** [Add actual commit hash]
- **Verification:** Tested image uploads and confirmed that the resulting media references were stored as part of the driver information in Firestore.
- **Learning:** Understood the relationship between mobile file handling, multipart upload requests, Cloudinary media management, and database references.

---

### Entry #3 — Internationalization with i18next

- **Date:** 2026-11-04
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Implement Spanish and English language support in the Expo application.
- **Prompt:** "e we, como se hace para hacer de que una aplicacion de expo tenga modo ingles y español?"
- **Response summary:** The tool explained how to configure i18next and react-i18next, organize translation resources into JSON files, and change the active language at runtime.
- **Used / modified / discarded:** The proposed configuration was adapted to the application's existing structure, with separate translation files for Spanish and English and translation keys organized by application section.
- **Files involved:** `src/config/i18n.js`, `src/locales/es/translation.json`, `src/locales/en/translation.json`, application screens.
- **Commit:** [Add actual commit hash]
- **Verification:** Changed the application language through the settings interface and checked that the translated screens updated correctly.
- **Learning:** Learned how translation namespaces and JSON resource structures work, and how to avoid hardcoded interface text.

---

### Entry #4 — Global Theme Management

- **Date:** 2026-11-04
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Establish a centralized light and dark theme system accessible throughout the application.
- **Prompt:** Reconstructed from the original consultation: "¿Cómo puedo implementar un tema claro y oscuro global en React Native utilizando Context API y permitir que el usuario lo cambie desde los ajustes?"
- **Response summary:** The tool explained how to centralize theme colors using React Context and expose them to application screens through a custom hook.
- **Used / modified / discarded:** The suggested context-based approach was adapted to Bruhber's navigation and screen structure. Existing styles were updated to consume shared theme colors.
- **Files involved:** `src/context/ThemeContext.js`, `src/screens/app/SettingsScreen.js`, registration and authentication screens.
- **Commit:** [Add actual commit hash]
- **Verification:** Tested the light and dark modes and checked that the selected appearance was reflected across the application screens.
- **Learning:** Understood how shared context state can provide consistent application-wide configuration and reduce duplicated styling values.

---

### Entry #5 — Translation Troubleshooting

- **Date:** 2026-11-05
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Identify why the login screen continued displaying Spanish text when English was selected.
- **Prompt:** "manito y las traducciones de LoginScreen como que no se estan ejecutando, eso esta saliendo en español cuando tengo activa la opcion de ingles, es solo eso xd"
- **Response summary:** The tool compared the translation keys used by the login screen with the actual English JSON structure and identified incorrect translation paths.
- **Used / modified / discarded:** Corrected the translation key references to match the existing JSON hierarchy and added the missing registration-link translation.
- **Files involved:** `LoginScreen.js`, `src/locales/es/translation.json`, `src/locales/en/translation.json`.
- **Commit:** [Add actual commit hash]
- **Verification:** Changed the application language to English and verified that the login labels and registration link displayed the expected translations.
- **Learning:** Learned the importance of keeping translation key paths consistent with the JSON resource structure and checking fallback values when a translation is missing.

---

## General Assessment

The use of artificial intelligence supported the development process by providing technical explanations, integration guidance, implementation examples, and troubleshooting assistance.

The generated suggestions were reviewed and adapted to the project's requirements and existing codebase. Functionality was verified through application testing, integration checks, and manual review.

The development process also provided practical experience with React Native, Expo, Firebase, Cloudinary, React Navigation, Context API, and i18next.

**AI tools were used as complementary development resources, while the project integration, testing, and final implementation decisions remained part of the team's development process.**
