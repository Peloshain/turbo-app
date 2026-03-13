import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useState } from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL; // e.g.: http://localhost:3000

export type AnalysisResult = {
  name: string;
  colorDesc: string;
  colorHex: string;
};

export function useAddItem() {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"pick" | "category" | "confirm" | "done">(
    "pick",
  );

  async function pickImage(source: "camera" | "gallery") {
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 0.7, base64: true })
        : await ImagePicker.launchImageLibraryAsync({
            quality: 0.7,
            base64: true,
          });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setStep("category");
    }
  }

  async function analyzeWithCategory(categoryName: string, categoryId: string) {
    if (!image?.base64) return;
    setLoading(true);

    try {
      const mimeType = image.mimeType ?? "image/jpeg";
      const imageBase64 = `data:${mimeType};base64,${image.base64}`;

      const res = await fetch(`${API_URL}/items/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, categoryName }),
      });

      const data = await res.json();
      if (data.ok) {
        setAnalysis({
          name: data.name,
          colorDesc: data.colorDesc,
          colorHex: data.colorHex,
        });
        setStep("confirm");
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveItem(categoryId: string, userId: string) {
    if (!image || !analysis) return;
    setLoading(true);

    try {
      const key = `items/${userId}/${Date.now()}.jpg`;

      // 1. Pedir URL firmada
      const urlRes = await fetch(`${API_URL}/items/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, contentType: "image/jpeg" }),
      });
      const { url, publicUrl } = await urlRes.json();

      // 2. Subir imagen directo a R2 desde el cliente
      await FileSystem.uploadAsync(url, image.uri, {
        httpMethod: "PUT",
        headers: { "Content-Type": "image/jpeg" },
      });

      // 3. Guardar en DB
      await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...analysis,
          imageUrl: publicUrl,
          imageKey: key,
          categoryId,
          userId,
        }),
      });

      setStep("done");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setImage(null);
    setAnalysis(null);
    setStep("pick");
  }

  return {
    image,
    analysis,
    loading,
    step,
    pickImage,
    analyzeWithCategory,
    saveItem,
    reset,
  };
}
