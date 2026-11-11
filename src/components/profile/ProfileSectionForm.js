import { useEffect, useState } from "react";

import {
    View,
    Text,
    TextInput,
    Pressable,
    Image,
    ActivityIndicator,
    StyleSheet,
    Alert,
    ScrollView,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";


import { uploadImage } from "../../utils/uploadImage";
import { getCloudinaryUrl } from "../../utils/getCloudinaryUrl";

export default function ProfileSectionForm({
    title,
    initialData,
    fields,
    photos,
    onSave,
}) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const [datePicker, setDatePicker] = useState(null);

    useEffect(() => {
        setForm(initialData);
    }, [initialData]);

    function updateField(key, value) {
        setForm(previous => ({
            ...previous,
            [key]: value,
        }));
    }

    async function selectPhoto(photo) {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });

            if (result.canceled) return;

            setLoading(true);

            const uploadedPhoto = await uploadImage(
                result.assets[0].uri,
                photo.folder
            );

            updateField(photo.key, uploadedPhoto);
        } catch (error) {
            console.log("ERROR AL GUARDAR:", error);
            console.log("ERROR MESSAGE:", error?.message);
            console.log("ERROR CODE:", error?.code);
            console.log("ERROR STACK:", error?.stack);
        
            Alert.alert(
                "Error",
                error?.message || "No se pudieron guardar los cambios."
            );
        } finally {
            setLoading(false);
        }
    }

    async function saveChanges() {
        try {
            setLoading(true);

            await onSave(form);

            setEditing(false);

            Alert.alert(
                t("profile.edit.successTitle"),
                t("profile.edit.successMessage")
            );
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    }

    function cancelEditing() {
        setForm(initialData);
        setEditing(false);
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            width: "100%",
        },
        content: {
            padding: 16,
            paddingBottom: 32,
            gap: 18,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
        },
        title: {
            fontSize: 20,
            fontWeight: "700",
        },
        field: {
            gap: 8,
        },
        input: {
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
            minHeight: 48,
            justifyContent: "center",
        },
        value: {
            fontSize: 16,
            fontWeight: "600",
        },
        photo: {
            gap: 10,
            padding: 14,
            borderRadius: 12,
            backgroundColor: colors.surface,
        },
        image: {
            width: "100%",
            height: 180,
            borderRadius: 10,
        },
        actions: {
            flexDirection: "row",
            gap: 12,
            marginTop: 8,
        },
        button: {
            flex: 1,
            minHeight: 48,
            padding: 12,
            borderRadius: 10,
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
        },
        saveText: {
            color: "#FFFFFF",
            fontWeight: "700",
        },
    });

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                    {title}
                </Text>

                {!editing && (
                    <Pressable onPress={() => setEditing(true)}>
                        <Text style={{ color: colors.primary }}>
                            {t("profile.edit.edit")}
                        </Text>
                    </Pressable>
                )}
            </View>

            {fields.map(field => (
                <View key={field.key} style={styles.field}>
                    <Text style={{ color: colors.secondaryText }}>
                        {field.label}
                    </Text>

                    {editing && !field.readOnly ? (
                        field.type === "date" ? (
                            <>
                                <Pressable
                                    onPress={() => setDatePicker(field.key)}
                                    style={[
                                        styles.input,
                                        { borderColor: colors.border },
                                    ]}
                                >
                                    <Text style={{ color: colors.text }}>
                                        {form[field.key] || field.label}
                                    </Text>
                                </Pressable>

                                {datePicker === field.key && (
                                    <DateTimePicker
                                        value={
                                            form[field.key]
                                                ? new Date(`${form[field.key]}T12:00:00`)
                                                : new Date()
                                        }
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setDatePicker(null);

                                            if (event.type === "set" && selectedDate) {
                                                const year = selectedDate.getFullYear();
                                                const month = String(
                                                    selectedDate.getMonth() + 1
                                                ).padStart(2, "0");
                                                const day = String(
                                                    selectedDate.getDate()
                                                ).padStart(2, "0");

                                                updateField(
                                                    field.key,
                                                    `${year}-${month}-${day}`
                                                );
                                            }
                                        }}
                                    />
                                )}
                            </>
                        ) : (
                            <TextInput
                                value={String(form[field.key] ?? "")}
                                onChangeText={value =>
                                    updateField(field.key, value)
                                }
                                keyboardType={field.keyboardType || "default"}
                                placeholder={field.label}
                                placeholderTextColor={colors.secondaryText}
                                style={[
                                    styles.input,
                                    {
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                            />
                        )
                    ) : (
                        <Text style={[styles.value, { color: colors.text }]}>
                            {form[field.key] || "-"}
                        </Text>
                    )}
                </View>
            ))}

            {photos.map(photo => {
                const imageData = form[photo.key];
                const imageUrl = getCloudinaryUrl(imageData);

                console.log("IMAGEN:", photo.key, imageData);
                console.log("URL GENERADA:", imageUrl);

                return (
                    <View
                        key={photo.key}
                        style={[
                            styles.photo,
                            { backgroundColor: colors.surface },
                        ]}
                    >
                        <Text style={{ color: colors.secondaryText }}>
                            {photo.label}
                        </Text>

                        {imageUrl && (
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.image}
                                resizeMode="cover"
                                onError={event => {
                                    console.log(
                                        "ERROR CARGANDO IMAGEN:",
                                        event.nativeEvent
                                    );
                                }}
                            />
                        )}

                        <Text style={{ color: colors.text }}>
                            {imageData?.publicId
                                ? t("profile.edit.photoUploaded")
                                : t("profile.edit.noPhoto")}
                        </Text>

                        {editing && (
                            <Pressable
                                disabled={loading}
                                onPress={() => selectPhoto(photo)}
                            >
                                <Text style={{ color: colors.primary }}>
                                    {t("profile.edit.changePhoto")}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                );
            })}

            {editing && (
                <View style={styles.actions}>
                    <Pressable
                        disabled={loading}
                        onPress={cancelEditing}
                        style={[styles.button, { borderColor: colors.border }]}
                    >
                        <Text style={{ color: colors.text }}>
                            {t("profile.edit.cancel")}
                        </Text>
                    </Pressable>

                    <Pressable
                        disabled={loading}
                        onPress={saveChanges}
                        style={[
                            styles.button,
                            { backgroundColor: colors.primary },
                        ]}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.saveText}>
                                {t("profile.edit.save")}
                            </Text>
                        )}
                    </Pressable>
                </View>
            )}
        </ScrollView>
    );
}

