import { Button } from "@/components/ui/button";
import { VENDOR_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Store } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function VendorSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="sticky top-16 h-[calc(100vh-4rem)] border-r border-border bg-card"
    >
      <div className="flex h-full flex-col">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    Vendor Portal
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Manage your store
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 rounded-lg"
          >
            {isCollapsed ?
              <ChevronRight className="h-4 w-4" />
            : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {VENDOR_NAV_ITEMS.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/vendor/dashboard" &&
                location.pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive ?
                    "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center px-2",
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive && "text-primary-foreground",
                  )}
                />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl bg-muted/50 p-3"
              >
                <p className="text-xs text-muted-foreground">
                  Need help? Visit our{" "}
                  <Link to="/help" className="text-primary hover:underline">
                    Help Center
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
