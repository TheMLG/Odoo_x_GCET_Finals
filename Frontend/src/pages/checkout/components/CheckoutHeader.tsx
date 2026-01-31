import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

export function CheckoutHeader() {
    const navigate = useNavigate();

    return (
        <div className="bg-white shadow-sm">
            <div className="container px-4 py-4 md:px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/cart')}
                        className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
                            <span className="text-xl font-bold text-white">Q</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                            SharePal
                        </span>
                    </div>
                </div>
                <ShieldCheck className="h-6 w-6 text-gray-400" />
            </div>
        </div>
    );
}
