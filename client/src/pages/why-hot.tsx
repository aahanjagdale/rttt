import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertHotReasonSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HeartHandshake, Plus, Loader2 } from "lucide-react";

export default function WhyHot() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const { data: reasons, isLoading } = useQuery({
    queryKey: ["/api/hot-reasons"],
  });

  const form = useForm({
    resolver: zodResolver(insertHotReasonSchema),
    defaultValues: {
      reason: "",
    },
  });

  const createReasonMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/hot-reasons", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hot-reasons"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Reason added",
        description: "Your reason has been added successfully.",
      });
    },
  });

  if (isLoading) {
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
            <h1 className="text-3xl font-bold">Why I Find You Hot</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Reason
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a New Reason</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) => createReasonMutation.mutate(data))}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Reason</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field}
                              placeholder="Share what makes your partner special..."
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">Add Reason</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reasons?.map((reason: any) => (
              <Card key={reason.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <HeartHandshake className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(reason.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-lg">{reason.reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
