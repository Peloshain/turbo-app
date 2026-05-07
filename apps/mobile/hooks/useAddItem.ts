// import * as ImagePicker from "expo-image-picker";
// import * as FileSystem from "expo-file-system/legacy";
// import { useRef, useState } from "react";
// import { Alert, Platform } from "react-native";
// import { env } from "@repo/env/native";

// //Useful for Android emulator
// const API_URL = Platform.select({
//   android: "http://10.0.2.2:3000",
//   ios: env.EXPO_PUBLIC_SERVER_URL,
// });
// //move to model src
// export type AnalysisResult = {
//   name: string;
//   colorDesc: string;
//   colorHex: string;
// };

// export function useAddItem() {
//   const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
//   const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState<"pick" | "category" | "confirm" | "done">(
//     "pick",
//   );
//   const controllerRef = useRef<AbortController | null>(null);

//   // Request the appropriate permission before launching camera or gallery.
//   // Returns true if granted, false if denied.
//   async function requestPermission(
//     source: "camera" | "gallery",
//   ): Promise<boolean> {
//     if (source === "camera") {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();
//       return status === "granted";
//     } else {
//       const { status } =
//         await ImagePicker.requestMediaLibraryPermissionsAsync();
//       return status === "granted";
//     }
//   }

//   async function pickImage(source: "camera" | "gallery") {
//     const granted = await requestPermission(source);

//     if (!granted) {
//       Alert.alert(
//         "Permission required",
//         source === "camera"
//           ? "Please allow camera access in your device settings to take photos."
//           : "Please allow photo library access in your device settings.",
//         [{ text: "OK" }],
//       );
//       return;
//     }

//     const result =
//       source === "camera"
//         ? await ImagePicker.launchCameraAsync({
//             quality: 0.7,
//             base64: true,
//             allowsEditing: true, // Lets user crop to square — cleaner item photos
//             aspect: [3, 4], // Portrait ratio works best for clothing
//           })
//         : await ImagePicker.launchImageLibraryAsync({
//             quality: 0.7,
//             base64: true,
//             allowsEditing: true,
//             aspect: [3, 4],
//           });

//     if (!result.canceled) {
//       setImage(result.assets[0]);
//       setStep("category");
//     }
//   }

//   async function analyzeWithCategory(categoryName: string, categoryId: string) {
//     // Cancel any in-flight request before starting a new one
//     controllerRef.current?.abort();
//     controllerRef.current = new AbortController();

//     if (!image?.base64) return;
//     setLoading(true);

//     try {
//       const mimeType = image.mimeType ?? "image/jpeg";
//       const imageBase64 = `data:${mimeType};base64,${image.base64}`;

//       const res = await fetch(`${API_URL}/items/analyze`, {
//         method: "POST",
//         signal: controllerRef.current.signal,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ imageBase64, categoryName }),
//       });

//       console.log(`AI analysis response status: ${res.status}`);
//       console.log(`AI res: ${res}`);
//       const text = await res.text();
//       const data = JSON.parse(text);

//       if (data?.result) {
//         setAnalysis({
//           name: data.result.name,
//           colorDesc: data.result.colorDesc,
//           colorHex: data.result.colorHex,
//         });
//         setStep("confirm");
//       }
//     } catch (e) {
//       if (e instanceof Error && e.name === "AbortError") {
//         console.log("Cancelled");
//       } else {
//         console.log("Something went wrong");
//       }
//     } finally {
//       setLoading(false);
//       controllerRef.current = null;
//     }
//   }

//   function cancelAnalysis() {
//     controllerRef.current?.abort();
//   }

//   async function saveItem(categoryId: string, userId: string) {
//     if (!image || !analysis) return;
//     setLoading(true);
//     try {
//       const key = `items/${userId}/${Date.now()}.jpg`;

//       // Get Signed Url
//       const urlRes = await fetch(`${API_URL}/items/upload-url`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ key, contentType: "image/jpeg" }),
//       });
//       const { url, publicUrl } = await urlRes.json();
//       console.log(`URL: ${url}`);
//       console.log(`Public URL: ${publicUrl}`);
//       console.log(`image uri: ${image.uri}`);
//       // Upload directly to R2
//       // const imageBlob = await fetch(
//       //   `data:image/jpeg;base64,${image.base64}`,
//       // ).then((r) => r.blob()); // ← aquí

//       // await fetch(url, {
//       //   method: "PUT",
//       //   headers: { "Content-Type": "image/jpeg" },
//       //   body: imageBlob,
//       // });

//       await FileSystem.uploadAsync(url, image.uri, {
//         httpMethod: "PUT",
//         headers: { "Content-Type": "image/jpeg" },
//       });

//       // Save into DB
//       await fetch(`${API_URL}/items`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...analysis,
//           imageUrl: publicUrl,
//           imageKey: key,
//           categoryId,
//           userId,
//         }),
//       });

//       setStep("done");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function reset() {
//     setImage(null);
//     setAnalysis(null);
//     setStep("pick");
//   }

//   return {
//     image,
//     analysis,
//     loading,
//     step,
//     pickImage,
//     analyzeWithCategory,
//     saveItem,
//     reset,
//     cancelAnalysis,
//   };
// }
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import { env } from "@repo/env/native";
import { authClient } from "../lib/auth-client";

const API_URL = Platform.select({
  android: "http://10.0.2.2:3000",
  ios: env.EXPO_PUBLIC_SERVER_URL,
});

export type AnalysisResult = {
  name: string;
  colorDesc: string;
  colorHex: string;
};

export function useAddItem() {
  const { data: session } = authClient.useSession();
  const aiHelperEnabled = (session?.user as any)?.aiHelperEnabled ?? true;

  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<
    "pick" | "category" | "details" | "confirm" | "done"
  >("pick");

  // Manual detail fields (used when aiHelperEnabled is false)
  const [manualName, setManualName] = useState("");
  const [manualColorDesc, setManualColorDesc] = useState("");
  const [manualColorHex, setManualColorHex] = useState("");

  const controllerRef = useRef<AbortController | null>(null);

  async function requestPermission(
    source: "camera" | "gallery",
  ): Promise<boolean> {
    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === "granted";
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === "granted";
    }
  }

  async function pickImage(source: "camera" | "gallery") {
    const granted = await requestPermission(source);
    if (!granted) {
      Alert.alert(
        "Permission required",
        source === "camera"
          ? "Please allow camera access in your device settings to take photos."
          : "Please allow photo library access in your device settings.",
        [{ text: "OK" }],
      );
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            quality: 0.7,
            base64: true,
            allowsEditing: true,
            aspect: [3, 4],
          })
        : await ImagePicker.launchImageLibraryAsync({
            quality: 0.7,
            base64: true,
            allowsEditing: true,
            aspect: [3, 4],
          });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setStep("category");
    }
  }

  async function analyzeWithCategory(categoryName: string, categoryId: string) {
    if (!aiHelperEnabled) {
      // Skip AI — go to manual details step
      setStep("details");
      return;
    }

    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    if (!image?.base64) return;
    setLoading(true);

    try {
      const mimeType = image.mimeType ?? "image/jpeg";
      const imageBase64 = `data:${mimeType};base64,${image.base64}`;

      const res = await fetch(`${API_URL}/items/analyze`, {
        method: "POST",
        signal: controllerRef.current.signal,
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
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        console.log("Cancelled");
      } else {
        console.log("Something went wrong");
      }
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  }

  // Called from DetailsStep when user taps Continue
  function confirmManualDetails() {
    setAnalysis({
      name: manualName.trim(),
      colorDesc: manualColorDesc.trim(),
      colorHex: manualColorHex || "#000000",
    });
    setStep("confirm");
  }

  function cancelAnalysis() {
    controllerRef.current?.abort();
  }

  async function saveItem(categoryId: string, userId: string) {
    if (!image || !analysis) return;
    setLoading(true);
    try {
      const key = `items/${userId}/${Date.now()}.jpg`;

      const urlRes = await fetch(`${API_URL}/items/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, contentType: "image/jpeg" }),
      });
      const { url, publicUrl } = await urlRes.json();

      await FileSystem.uploadAsync(url, image.uri, {
        httpMethod: "PUT",
        headers: { "Content-Type": "image/jpeg" },
      });

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
    setManualName("");
    setManualColorDesc("");
    setManualColorHex("");
    setStep("pick");
  }

  return {
    image,
    analysis,
    loading,
    step,
    aiHelperEnabled,
    // Manual detail fields
    manualName,
    manualColorDesc,
    manualColorHex,
    setManualName,
    setManualColorDesc,
    setManualColorHex,
    // Actions
    pickImage,
    analyzeWithCategory,
    confirmManualDetails,
    saveItem,
    reset,
    cancelAnalysis,
  };
}
