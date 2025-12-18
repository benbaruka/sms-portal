import axios, { AxiosRequestConfig } from "axios";

export const fetchData = async <T = unknown>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await axios.get<T>(endpoint, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("An unknown error occurred");
  }
};

import apiRequest from "./config";
const fetchItems = async () => {
  try {
    const items = await apiRequest({ method: "GET", endpoint: "/items" });
  } catch (error) {}
};
const addItem = async (itemData: Record<string, unknown>, token: string) => {
  try {
    const newItem = await apiRequest({
      method: "POST",
      endpoint: "/items",
      data: itemData,
      token: token,
    });
  } catch (error) {}
};
const updateItem = async (itemId: number, updateData: Record<string, unknown>, token: string) => {
  try {
    const updatedItem = await apiRequest({
      method: "PUT",
      endpoint: "/items",
      id: itemId,
      data: updateData,
      token: token,
    });
  } catch (error) {}
};
const deleteItem = async (itemId: number, token: string) => {
  try {
    const deleted = await apiRequest({
      method: "DELETE",
      endpoint: "/items",
      id: itemId,
      token: token,
    });
  } catch (error) {}
};
export { deleteItem, updateItem, addItem, fetchItems };
