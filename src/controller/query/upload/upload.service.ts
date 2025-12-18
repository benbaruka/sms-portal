import axios from "axios";

/**
 * Uploads a file to a presigned URL
 * @param presignedUrl - The presigned URL to upload to
 * @param file - The file to upload
 * @returns Promise with the upload response
 */
export const uploadFile = async (presignedUrl: string, file: File): Promise<unknown> => {
  try {
    const response = await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Upload failed");
      } else if (error.request) {
        throw new Error("No server response. Please check your internet connection.");
      }
    }
    throw new Error("Upload failed");
  }
};
