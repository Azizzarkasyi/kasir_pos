import {ApiResponse} from "../../types/api";
import apiService from "../api";

export interface UploadResponse {
  url: string;
}

/**
 * Helper function to prepare file object from URI
 */
export function prepareFileFromUri(uri: string) {
  // Get file extension from uri or use jpg as default
  let fileExtension = "jpg";
  if (uri.includes(".")) {
    const uriParts = uri.split(".");
    fileExtension = uriParts[uriParts.length - 1].toLowerCase();
  }

  // Ensure proper mime type
  const mimeTypeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };

  return {
    uri,
    name: `photo_${Date.now()}.${fileExtension}`,
    type: mimeTypeMap[fileExtension] || "image/jpeg",
  };
}

/**
 * Asset API endpoints
 */
const assetApi = {
  /**
   * Upload image file
   * @param file - Image file to upload
   * @returns Promise with uploaded file URL
   */
  async uploadImage(file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<ApiResponse<UploadResponse>> {
    try {
      const formData = new FormData();

      // React Native FormData requires this specific format
      // @ts-ignore - React Native FormData accepts object with uri/name/type
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      });

      console.log("📤 Uploading image via axios");
      console.log("📦 File info:", {
        name: file.name,
        type: file.type,
        uri: file.uri.substring(0, 50) + "...",
      });

      // Use axios instance with custom config for upload
      const axiosInstance = apiService.getInstance();
      const response = await axiosInstance.post<ApiResponse<UploadResponse>>(
        "/asset/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000, // 60 seconds for upload
        }
      );

      console.log("✅ Upload successful:", response.data);

      return response.data;
    } catch (error: any) {
      console.error("❌ Upload error:", error);

      // More detailed error message
      if (
        error.message === "Network request failed" ||
        error.code === "ECONNABORTED"
      ) {
        throw {
          message:
            "Tidak dapat terhubung ke server. Pastikan backend berjalan dan URL sudah benar.",
          code: error.code,
        };
      }

      throw error;
    }
  },
};

export default assetApi;
