import api from './api';

export interface Coupon {
    id: string;
    code: string;
    description: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    minOrderAmount: number | null;
    maxUsageCount: number | null;
    currentUsageCount: number;
    expiryDate: string | null;
    isWelcomeCoupon?: boolean;
    userId?: string | null;
}

export interface ValidateCouponResponse {
    coupon: {
        id: string;
        code: string;
        description: string;
        discountType: string;
        discountValue: number;
    };
    discountAmount: number;
}

export const getAvailableCoupons = async (): Promise<Coupon[]> => {
    const response = await api.get('/coupons/available');
    return response.data.data;
};

export const validateCoupon = async (code: string, orderAmount: number): Promise<ValidateCouponResponse> => {
    const response = await api.post('/coupons/validate', { code, orderAmount });
    return response.data.data;
};

export const applyCoupon = async (couponId: string) => {
    const response = await api.post('/coupons/apply', { couponId });
    return response.data.data;
};
