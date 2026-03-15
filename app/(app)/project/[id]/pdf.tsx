import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { projectService } from "@/services/project.service";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

type PdfType = "statistics" | "invoice" | "summary";

const PDF_OPTIONS: { type: PdfType; label: string; description: string; icon: string }[] = [
  { type: "statistics", label: "Statistics PDF", description: "Budget analysis and cost breakdown", icon: "stats-chart-outline" },
  { type: "invoice", label: "Invoice PDF", description: "Formal invoice for the project", icon: "document-text-outline" },
  { type: "summary", label: "Summary PDF", description: "Overall project summary report", icon: "clipboard-outline" },
];

export default function ProjectPdfScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState<PdfType | null>(null);

  const handleDownload = async (type: PdfType) => {
    if (!user?.id || !projectId) return;
    setLoading(type);
    try {
      let blob: Blob;
      switch (type) {
        case "statistics": blob = await projectService.downloadStatisticsPDF(user.id, projectId); break;
        case "invoice": blob = await projectService.downloadInvoicePDF(user.id, projectId); break;
        case "summary": blob = await projectService.downloadSummaryPDF(user.id, projectId); break;
      }

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const fileUri = `${FileSystem.cacheDirectory}project_${type}_${projectId}.pdf`;
        await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, { mimeType: "application/pdf", dialogTitle: `Share ${type} PDF` });
        } else {
          Alert.alert("Downloaded", `PDF saved to: ${fileUri}`);
        }
      };
    } catch (error: any) {
      Alert.alert("Error", error.message || `Failed to download ${type} PDF`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-sm text-gray-500 mb-6 leading-5">
        Download and share PDF reports for this project.
      </Text>

      <View className="gap-3">
        {PDF_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.type}
            className={`bg-white rounded-2xl p-4 flex-row items-center ${loading === option.type ? "opacity-70" : ""}`}
            onPress={() => handleDownload(option.type)}
            disabled={loading !== null}
            activeOpacity={0.7}
          >
            <View className="w-12 h-12 rounded-xl bg-indigo-100 justify-center items-center mr-3">
              {loading === option.type
                ? <ActivityIndicator size="small" color="#4f46e5" />
                : <Ionicons name={option.icon as any} size={24} color="#4f46e5" />
              }
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-800">{option.label}</Text>
              <Text className="text-sm text-gray-500 mt-0.5">{option.description}</Text>
            </View>
            {loading !== option.type && <Ionicons name="download-outline" size={20} color="#9ca3af" />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}