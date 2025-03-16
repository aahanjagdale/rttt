import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertCouponSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Plus, Loader2, Send, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Coupons() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: coupons, isLoading: couponsLoading } = useQuery({
    queryKey: ["/api/coupons"],
  });

  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/coupons/inventory"],
  });

  const { data: partner } = useQuery({
    queryKey: ["/api/partner"],
  });

  const form = useForm({
    resolver: zodResolver(insertCouponSchema),
    defaultValues: {
      title: "",
    },
  });

  const createCouponMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/coupons", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Coupon created",
        description: "Your love coupon has been created successfully.",
      });
    },
  });

  const sendCouponMutation = useMutation({
    mutationFn: async ({ couponId, receiverId }: { couponId: number; receiverId: number }) => {
      const res = await apiRequest("POST", `/api/coupons/${couponId}/send`, { receiverId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coupons/inventory"] });
      toast({
        title: "Coupon sent",
        description: "The coupon has been sent to your partner.",
      });
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (couponId: number) => {
      await apiRequest("DELETE", `/api/coupons/${couponId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coupons/inventory"] });
      toast({
        title: "Coupon deleted",
        description: "The coupon has been removed.",
      });
    },
  });

  if (couponsLoading || inventoryLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Love Coupons</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Coupon
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Love Coupon</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) => createCouponMutation.mutate(data))}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coupon Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">Create Coupon</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="available">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="available">Available Coupons</TabsTrigger>
              <TabsTrigger value="inventory">My Inventory</TabsTrigger>
            </TabsList>

            <TabsContent value="available">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {coupons?.map((coupon: any) => (
                  <Card key={coupon.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Gift className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-medium mb-4">{coupon.title}</h3>
                      {partner && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => sendCouponMutation.mutate({
                            couponId: coupon.id,
                            receiverId: partner.id
                          })}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send to Partner
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="inventory">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inventory?.map((coupon: any) => (
                  <Card key={coupon.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Gift className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-medium mb-4">{coupon.title}</h3>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => deleteCouponMutation.mutate(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Coupon
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}