import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

interface DatePickerInputProps {
  label: string;
  value: string; // ISO date string YYYY-MM-DD
  onChange: (date: string) => void;
  error?: string | null;
  touched?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

const formatDisplay = (dateStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  value,
  onChange,
  error,
  touched,
  minimumDate,
  maximumDate,
}) => {
  const [show, setShow] = useState(false);
  const showError = touched && error;

  const date = value ? new Date(value) : new Date();

  const handleChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShow(false);
    if (selected) {
      onChange(selected.toISOString().split("T")[0]);
    }
  };

  return (
    <View className="mb-6">
      <Text className="text-sm font-semibold text-slate-700 mb-2 tracking-wide">
        {label}
      </Text>

      <TouchableOpacity
        onPress={() => setShow(true)}
        className={`
          flex-row items-center
          bg-slate-100
          rounded-2xl
          border
          px-3
          h-14
          ${showError ? "border-red-500" : "border-slate-200"}
        `}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar-outline" size={20} color="#64748B" style={{ marginRight: 8 }} />
        <Text className={`flex-1 text-base ${value ? "text-slate-800" : "text-slate-400"}`}>
          {value ? formatDisplay(value) : "Select a date"}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#94A3B8" />
      </TouchableOpacity>

      {showError && (
        <Text className="text-xs text-red-500 mt-2 ml-1">{error}</Text>
      )}

      {/* Android: inline picker */}
      {show && Platform.OS === "android" && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {/* iOS: picker in a modal */}
      {Platform.OS === "ios" && (
        <Modal visible={show} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-white rounded-t-3xl px-4 pb-8">
              <View className="flex-row justify-between items-center py-4 border-b border-slate-100">
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text className="text-base text-slate-500">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-base font-semibold text-slate-800">{label}</Text>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text className="text-base font-semibold text-indigo-600">Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={{ height: 200 }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};