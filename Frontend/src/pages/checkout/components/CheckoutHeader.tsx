import { useNavigate, Link } from 'react-router-dom';
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
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/RentX.png" alt="RentX Logo" className="h-10 w-auto" />
                    </Link>
                </div>
                <ShieldCheck className="h-6 w-6 text-gray-400" />
            </div>
        </div>
    );
}
