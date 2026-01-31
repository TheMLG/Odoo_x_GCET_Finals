import api from "./api";

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export interface AddressInput {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

interface AddressResponse {
  success: boolean;
  data: Address;
  message: string;
}

interface AddressesResponse {
  success: boolean;
  data: Address[];
  message: string;
}

/**
 * Get all addresses for the authenticated user
 */
export const getAddresses = async (): Promise<Address[]> => {
  try {
    const response = await api.get<AddressesResponse>("/addresses");
    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw error;
  }
};

/**
 * Get single address by ID
 */
export const getAddressById = async (addressId: string): Promise<Address> => {
  try {
    const response = await api.get<AddressResponse>(`/addresses/${addressId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching address:", error);
    throw error;
  }
};

/**
 * Create new address
 */
export const createAddress = async (data: AddressInput): Promise<Address> => {
  try {
    const response = await api.post<AddressResponse>("/addresses", data);
    return response.data.data;
  } catch (error) {
    console.error("Error creating address:", error);
    throw error;
  }
};

/**
 * Update address
 */
export const updateAddress = async (
  addressId: string,
  data: Partial<AddressInput>,
): Promise<Address> => {
  try {
    const response = await api.put<AddressResponse>(
      `/addresses/${addressId}`,
      data,
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};

/**
 * Delete address
 */
export const deleteAddress = async (addressId: string): Promise<void> => {
  try {
    await api.delete(`/addresses/${addressId}`);
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};

/**
 * Set address as default
 */
export const setDefaultAddress = async (
  addressId: string,
): Promise<Address> => {
  try {
    const response = await api.patch<AddressResponse>(
      `/addresses/${addressId}/default`,
    );
    return response.data.data;
  } catch (error) {
    console.error("Error setting default address:", error);
    throw error;
  }
};
