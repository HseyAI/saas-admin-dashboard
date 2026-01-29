import { useState } from "react";
import { useMemberLookup } from "@/hooks/use-members";
import { Search, CreditCard, History, Wallet, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function Members() {
  const [mobile, setMobile] = useState("");
  const lookupMutation = useMemberLookup();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile) return;
    lookupMutation.mutate(mobile, {
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  const data = lookupMutation.data;

  return (
    <div className="space-y-6 pb-24">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Member Lookup
        </h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <Input
            placeholder="Enter mobile number..."
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="flex-1 text-lg h-12 rounded-xl border-2 focus-visible:ring-primary/20"
          />
          <Button 
            type="submit" 
            size="lg" 
            className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            disabled={lookupMutation.isPending}
          >
            {lookupMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
          </Button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {data ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Expiration Banner */}
            {data.membershipSummary.isExpired && (
              <div className="bg-red-500 text-white p-4 rounded-xl shadow-lg shadow-red-500/20 flex items-center gap-3 animate-pulse">
                <AlertCircle className="w-6 h-6" />
                <span className="font-bold">Membership has expired! Please renew immediately.</span>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Visits"
                value={data.membershipSummary.total}
                icon={History}
                color="text-blue-500"
                bg="bg-blue-50"
              />
              <StatCard
                title="Used Visits"
                value={data.membershipSummary.used}
                icon={CreditCard}
                color="text-purple-500"
                bg="bg-purple-50"
              />
              <StatCard
                title="Balance"
                value={data.membershipSummary.balance}
                icon={Wallet}
                color="text-emerald-500"
                bg="bg-emerald-50"
              />
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-0 overflow-hidden border-none shadow-md rounded-2xl">
                <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Purchase History</div>
                <div className="max-h-[300px] overflow-y-auto p-2">
                  <table className="w-full text-sm">
                    <thead className="text-gray-400 font-medium text-left">
                      <tr>
                        <th className="p-3 pb-2">Date</th>
                        <th className="p-3 pb-2">Item</th>
                        <th className="p-3 pb-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.history.purchases.map((p, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="p-3">{format(new Date(p.date), 'MMM d, yyyy')}</td>
                          <td className="p-3 font-medium text-gray-800">{p.item}</td>
                          <td className="p-3 text-right font-bold text-primary">${p.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="p-0 overflow-hidden border-none shadow-md rounded-2xl">
                <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Activity Logs</div>
                <div className="max-h-[300px] overflow-y-auto p-2">
                  <table className="w-full text-sm">
                    <thead className="text-gray-400 font-medium text-left">
                      <tr>
                        <th className="p-3 pb-2">Date</th>
                        <th className="p-3 pb-2">Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.history.activityLogs.map((log, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="p-3">{format(new Date(log.date), 'MMM d, h:mm a')}</td>
                          <td className="p-3 text-gray-600">{log.activity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-gray-400"
          >
            <Search className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">Enter a mobile number to view member details</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="p-6 flex items-center gap-4 border-none shadow-md hover:shadow-lg transition-all rounded-2xl group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-black text-gray-800">{value}</p>
      </div>
    </Card>
  );
}
