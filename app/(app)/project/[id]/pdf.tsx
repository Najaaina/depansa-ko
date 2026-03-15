import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { projectService } from "@/services/project.service";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/next";

type PdfType = "statistics" | "invoice" | "summary";

const PDF_OPTIONS: { type: PdfType; label: string; description: string; icon: string }[] = [
  {
    type: "statistics",
    label: "Statistics PDF",
    description: "Budget analysis and cost breakdown",
    icon: "stats-chart-outline",
  },
  {
    type: "invoice",
    label: "Invoice PDF",
    description: "Formal invoice for the project",
    icon: "document-text-outline",
  },
  {
    type: "summary",
    label: "Summary PDF",
    description: "Overall project summary report",
    icon: "clipboard-outline",
  },
];

const slugify = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const buildFilename = (projectName: string, type: PdfType): string => {
  const slug = slugify(projectName);
  const date = new Date().toISOString().split("T")[0];
  const base = `${slug}-${type}-${date}`;

  // Find a unique suffix by checking existing files in cache
  let counter = 1;
  let filename = `${base}.pdf`;
  while (new FileSystem.File(FileSystem.Paths.cache, filename).exists) {
    filename = `${base}-${counter}.pdf`;
    counter++;
  }
  return filename;
};

export default function ProjectPdfScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState<PdfType | null>(null);
  const [projectName, setProjectName] = useState("project");

  useEffect(() => {
    if (!user?.id || !projectId) return;
    projectService.getOne(user.id, projectId)
      .then((p) => setProjectName(p.name))
      .catch(console.error);
  }, [user?.id, projectId]);

  const handleDownload = async (type: PdfType) => {
    if (!user?.id || !projectId) return;
    setLoading(type);

    try {
      let base64: string;
      switch (type) {
        case "statistics":
          base64 = await projectService.downloadStatisticsPDF(user.id, projectId);
          break;
        case "invoice":
          base64 = await projectService.downloadInvoicePDF(user.id, projectId);
          break;
        case "summary":
          base64 = await projectService.downloadSummaryPDF(user.id, projectId);
          break;
      }

      const filename = buildFilename(projectName, type);
      const file = new FileSystem.File(FileSystem.Paths.cache, filename);
      await file.write(base64);

      Alert.alert("Downloaded", `Saved as ${filename}`);
    } catch (error: any) {
      Alert.alert("Error", error.message || `Failed to download ${type} PDF`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-sm text-gray-500 mb-6 leading-5">
        Download PDF reports for this project directly to your device.
      </Text>

      <View className="gap-3">
        {PDF_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.type}
            className={`bg-white rounded-2xl p-4 flex-row items-center ${loading === option.type ? "opacity-70" : ""}`}
            onPress={() => handleDownload(option.type)}
            disabled={loading !== null}
            activeOpacity={0.7}
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
          >
            <View className="w-12 h-12 rounded-xl bg-indigo-100 items-center justify-center mr-3">
              {loading === option.type ? (
                <ActivityIndicator size="small" color="#4f46e5" />
              ) : (
                <Ionicons name={option.icon as any} size={24} color="#4f46e5" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-800">{option.label}</Text>
              <Text className="text-sm text-gray-500 mt-0.5">{option.description}</Text>
            </View>
            {loading !== option.type && (
              <Ionicons name="download-outline" size={20} color="#9ca3af" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}