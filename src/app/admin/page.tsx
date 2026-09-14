"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, CreditCard, ShoppingBag, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const revenueData = [
    { name: 'Jan', total: 1200000 },
    { name: 'Feb', total: 2100000 },
    { name: 'Mar', total: 1800000 },
    { name: 'Apr', total: 3200000 },
    { name: 'May', total: 2900000 },
    { name: 'Jun', total: 4500000 },
    { name: 'Jul', total: 5200000 },
  ];

  const orderData = [
    { name: 'Mon', orders: 120 },
    { name: 'Tue', orders: 145 },
    { name: 'Wed', orders: 130 },
    { name: 'Thu', orders: 180 },
    { name: 'Fri', orders: 250 },
    { name: 'Sat', orders: 310 },
    { name: 'Sun', orders: 280 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Platform Overview</h1>
        <p className="text-muted-foreground">High-level metrics and performance across TSLA.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold">24,591</h3>
            <p className="text-xs text-success flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Active Sellers</p>
              <Store className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold">1,432</h3>
            <p className="text-xs text-success flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +4.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold">₦5.2M</h3>
            <p className="text-xs text-success flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +18% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Pending Withdrawals</p>
              <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold">42</h3>
            <p className="text-xs text-warning flex items-center mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value / 1000000}M`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    cursor={{fill: 'hsl(var(--muted))'}}
                  />
                  <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
