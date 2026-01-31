import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

// Schema for Step 1: Email
const emailSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

// Schema for Step 2: OTP
const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

// Schema for Step 3: New Password
const resetPasswordSchema = z
    .object({
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const { forgotPassword, verifyOtp, resetPassword } = useAuthStore();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    // Step 1 Form
    const emailForm = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: '' },
    });

    // Step 2 Form
    const otpForm = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: '' },
    });

    // Step 3 Form
    const resetForm = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: '', confirmPassword: '' },
    });

    const onEmailSubmit = async (data: EmailFormData) => {
        setIsLoading(true);
        try {
            const success = await forgotPassword(data.email);
            if (success) {
                setEmail(data.email);
                setStep(2);
                toast.success('OTP sent to your email');
            } else {
                toast.error('Failed to send OTP. Please check your email.');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const onOtpSubmit = async (data: OtpFormData) => {
        setIsLoading(true);
        try {
            const success = await verifyOtp(email, data.otp);
            if (success) {
                setOtp(data.otp);
                setStep(3);
                toast.success('OTP verified');
            } else {
                toast.error('Invalid OTP or expired');
            }
        } catch (error) {
            toast.error('Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const onResetSubmit = async (data: ResetPasswordFormData) => {
        setIsLoading(true);
        try {
            const success = await resetPassword(email, otp, data.password);
            if (success) {
                toast.success('Password reset successfully');
                navigate('/login');
            } else {
                toast.error('Failed to reset password');
            }
        } catch (error) {
            toast.error('Reset failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            {step === 1 && 'Forgot Password'}
                            {step === 2 && 'Verify OTP'}
                            {step === 3 && 'Reset Password'}
                        </h1>
                        <p className="text-slate-500 text-sm">
                            {step === 1 && 'Enter your email to receive an OTP'}
                            {step === 2 && `Enter the OTP sent to ${email}`}
                            {step === 3 && 'Create a new password for your account'}
                        </p>
                    </div>

                    {step === 1 && (
                        <Form {...emailForm}>
                            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
                                <FormField
                                    control={emailForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        placeholder="Enter your email"
                                                        className="pl-11 h-12 rounded-xl"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full h-12 rounded-xl" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                                </Button>
                            </form>
                        </Form>
                    )}

                    {step === 2 && (
                        <Form {...otpForm}>
                            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-5">
                                <FormField
                                    control={otpForm.control}
                                    name="otp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>OTP</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        {...field}
                                                        type="text"
                                                        placeholder="Enter 6-digit OTP"
                                                        className="pl-11 h-12 rounded-xl tracking-widest"
                                                        maxLength={6}
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full h-12 rounded-xl" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Verify OTP'}
                                </Button>
                                <div className="text-center">
                                    <button type='button' onClick={() => setStep(1)} className='text-sm text-blue-600 hover:text-blue-700 font-medium'>Change Email</button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {step === 3 && (
                        <Form {...resetForm}>
                            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5">
                                <FormField
                                    control={resetForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        placeholder="Enter new password"
                                                        className="pl-11 h-12 rounded-xl"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={resetForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        placeholder="Confirm new password"
                                                        className="pl-11 h-12 rounded-xl"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full h-12 rounded-xl" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                                </Button>
                            </form>
                        </Form>
                    )}

                    <div className="mt-8 text-center border-t border-slate-100 pt-6">
                        <Link
                            to="/login"
                            className="font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            Back to Sign In
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
