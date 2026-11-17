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
    footer,
}) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({});
    const [showErrors, setShowErrors] = useState(false);

    const [datePicker, setDatePicker] = useState(null);

    useEffect(() => {
        // This local draft must follow the parent data after a save.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm(initialData);
    }, [initialData]);

    function updateField(key, value) {
        const field = fields.find(item => item.key === key);
        const nextValue = field?.sanitize ? field.sanitize(value) : value;

        setForm(previous => ({
            ...previous,
            [key]: nextValue,
        }));
    }

    function markTouched(key) {
        setTouched(previous => ({ ...previous, [key]: true }));
    }

    function getError(item) {
        return item?.validate ? item.validate(form[item.key], form) : null;
    }

    function isErrorVisible(key, error) {
        return Boolean(error) && (showErrors || touched[key]);
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
            markTouched(photo.key);
        } catch (error) {
            Alert.alert(
                "Error",
                error?.message || t("profile.edit.noPhoto")
            );
        } finally {
            setLoading(false);
        }
    }

    async function saveChanges() {
        setShowErrors(true);

        const hasFieldError = fields.some(field =>
            !field.readOnly && getError(field)
        );
        const hasPhotoError = photos.some(photo => getError(photo));

        if (hasFieldError || hasPhotoError) {
            return;
        }

        try {
            setLoading(true);

            await onSave(form);

            setEditing(false);
            setTouched({});
            setShowErrors(false);

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
        setTouched({});
        setShowErrors(false);
    }

    function getFieldText(field) {
        const value = form[field.key];

        if (field.options) {
            const selectedOption = field.options.find(
                option => option.value === value
            );

            return selectedOption?.label || value || "-";
        }

        if (typeof value === "boolean") {
            return value ? t("profile.edit.yes") : t("profile.edit.no");
        }

        return value || "-";
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
        hint: {
            fontSize: 13,
            lineHeight: 18,
        },
        error: {
            color: "#EF4444",
            fontSize: 13,
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
        options: {
            gap: 8,
        },
        option: {
            borderWidth: 1,
            borderRadius: 10,
            minHeight: 44,
            paddingHorizontal: 14,
            justifyContent: "center",
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
                    <Pressable onPress={() => {
                        setTouched({});
                        setShowErrors(false);
                        setEditing(true);
                    }}>
                        <Text style={{ color: colors.primary }}>
                            {t("profile.edit.edit")}
                        </Text>
                    </Pressable>
                )}
            </View>

            {fields.map(field => {
                const error = getError(field);
                const showFieldError = editing && isErrorVisible(field.key, error);

                return (
                <View key={field.key} style={styles.field}>
                    <Text style={{ color: colors.secondaryText }}>
                        {field.label}
                    </Text>

                    {editing && field.hint && (
                        <Text style={[styles.hint, { color: colors.secondaryText }]}>
                            {field.hint}
                        </Text>
                    )}

                    {editing && !field.readOnly ? (
                        field.type === "date" ? (
                            <>
                                <Pressable
                                    onPress={() => {
                                        markTouched(field.key);
                                        setDatePicker(field.key);
                                    }}
                                    style={[
                                        styles.input,
                                        { borderColor: showFieldError ? "#EF4444" : colors.border },
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
                                        minimumDate={field.minimumDate}
                                        maximumDate={field.maximumDate}
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
                        ) : field.type === "select" ? (
                            <View style={styles.options}>
                                {field.options.map(option => {
                                    const selected = form[field.key] === option.value;

                                    return (
                                        <Pressable
                                            key={option.value}
                                            onPress={() => {
                                                markTouched(field.key);
                                                updateField(field.key, option.value);
                                            }}
                                            style={[
                                                styles.option,
                                                {
                                                    borderColor: selected
                                                        ? colors.primary
                                                        : colors.border,
                                                    backgroundColor: selected
                                                        ? colors.primary
                                                        : colors.background,
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={{
                                                    color: selected
                                                        ? "#FFFFFF"
                                                        : colors.text,
                                                }}
                                            >
                                                {option.label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        ) : (
                            <TextInput
                                value={String(form[field.key] ?? "")}
                                onChangeText={value =>
                                    updateField(field.key, value)
                                }
                                onBlur={() => markTouched(field.key)}
                                keyboardType={field.keyboardType || "default"}
                                maxLength={field.maxLength}
                                autoCapitalize={field.autoCapitalize || "sentences"}
                                placeholder={field.label}
                                placeholderTextColor={colors.secondaryText}
                                style={[
                                    styles.input,
                                    {
                                        color: colors.text,
                                        borderColor: showFieldError ? "#EF4444" : colors.border,
                                    },
                                ]}
                            />
                        )
                    ) : (
                        <Text style={[styles.value, { color: colors.text }]}>
                            {getFieldText(field)}
                        </Text>
                    )}

                    {showFieldError && <Text style={styles.error}>{error}</Text>}
                </View>
                );
            })}

            {photos.map(photo => {
                const imageData = form[photo.key];
                const imageUrl = getCloudinaryUrl(imageData);
                const photoError = getError(photo);
                const showPhotoError = editing && isErrorVisible(photo.key, photoError);

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

                        {showPhotoError && <Text style={styles.error}>{photoError}</Text>}
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

            {!editing && footer}
        </ScrollView>
    );
}

