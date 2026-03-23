import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useState } from "react";
import { Platform } from "react-native";

//Useful for Android emulator
const API_URL = Platform.select({
  android: "http://10.0.2.2:3000",
  ios: process.env.EXPO_PUBLIC_API_URL,
});
//move to model src
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

      const text = await res.text();
      const data = JSON.parse(text);

      if (data?.result) {
        setAnalysis({
          name: data.result.name,
          colorDesc: data.result.colorDesc,
          colorHex: data.result.colorHex,
        });
        setStep("confirm");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function saveItem(categoryId: string, userId: string) {
    if (!image || !analysis) return;
    setLoading(true);
    try {
      const key = `items/${userId}/${Date.now()}.jpg`;

      // Get Signed Url
      const urlRes = await fetch(`${API_URL}/items/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, contentType: "image/jpeg" }),
      });
      const { url, publicUrl } = await urlRes.json();
      console.log(`URL: ${url}`);
      console.log(`Public URL: ${publicUrl}`);
      console.log(`image uri: ${image.uri}`);
      // Upload directly to R2
      // const imageBlob = await fetch(
      //   `data:image/jpeg;base64,${image.base64}`,
      // ).then((r) => r.blob()); // ← aquí

      // await fetch(url, {
      //   method: "PUT",
      //   headers: { "Content-Type": "image/jpeg" },
      //   body: imageBlob,
      // });

      await FileSystem.uploadAsync(url, image.uri, {
        httpMethod: "PUT",
        headers: { "Content-Type": "image/jpeg" },
      });

      // Save into DB
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
