import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Building2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Join SharePal
          </h1>
          <p className="text-slate-600 text-lg">
            Choose how you want to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Signup */}
          <Link to="/signup/user">
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-500">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-500 transition-colors duration-300">
                  <User className="h-10 w-10 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <CardTitle className="text-2xl">I'm a Customer</CardTitle>
                <CardDescription className="text-base">
                  Looking to rent equipment
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-3 mb-6 text-left">
                  <li className="flex items-center text-slate-600">
                    <ArrowRight className="h-4 w-4 mr-2 text-blue-600" />
                    Browse thousands of products
                  </li>
                  <li className="flex items-center text-slate-600">
                    <ArrowRight className="h-4 w-4 mr-2 text-blue-600" />
                    Rent by hour, day, or week
                  </li>
                  <li className="flex items-center text-slate-600">
                    <ArrowRight className="h-4 w-4 mr-2 text-blue-600" />
                    Track orders and invoices
                  </li>
                  <li className="flex items-center text-slate-600">
                    <ArrowRight className="h-4 w-4 mr-2 text-blue-600" />
                    Easy pickup and return
                  </li>
                </ul>
                <div className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                  Sign up as Customer
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Vendor Signup */}
          <Link to="/signup/vendor">
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-green-500">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 group-hover:bg-green-500 transition-colors duration-300">
                  <Building2 className="h-10 w-10 text-green-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <CardTitle className="text-2xl">I'm a Vendor</CardTitle>
                <CardDescription className="text-base">
                  Want to rent out equipment
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-3 mb-6 text-left">
                  <li className="flex items-center text-slate-600">
                    <ArrowRight className="h-4 w-4 mr-2 text-green-600" />
                    List your equipment
                  </li>
                  <li className="flex items-center text-slate-600">
                    <ArrowRight className="h-4 w-4 mr-2 text-green-600" />
                    Manage inventory and pricing
                  </li>
                  <li className="flex items-center text-slate-600">
                    <ArrowRight className="h-4 w-4 mr-2 text-green-600" />
                    Track orders and revenue
                  </li>
                  <li className="flex items-center text-slate-600">
                    <ArrowRight className="h-4 w-4 mr-2 text-green-600" />
                    Grow your business
                  </li>
                </ul>
                <div className="inline-flex items-center text-green-600 font-semibold group-hover:text-green-700">
                  Sign up as Vendor
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
