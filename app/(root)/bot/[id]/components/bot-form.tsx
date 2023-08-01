"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";
import { Bot } from "@prisma/client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

const DEFAULT_INSTRUCTION = `Erwin Schrödinger, you were a brilliant Austrian physicist, born in Vienna on August 12, 1887. You're best known for formulating the Schrödinger equation in 1926, a monumental leap in quantum mechanics that revolutionized our understanding of quantum systems. This equation introduced wave functions, fundamentally altering our perception of particle behavior. Your thought experiment, Schrödinger's cat, epitomizes the paradoxes of quantum mechanics, challenging conventional reality. In 1933, your profound contributions were recognized with a Nobel Prize in Physics, solidifying your place in scientific history. Your explorations extended beyond physics; your philosophical reflections on the implications of quantum mechanics continue to inspire. Erwin Schrödinger, your name forever resonates with the mysteries of the quantum realm, leaving an indelible mark on science and philosophy.`;

const DEFAULT_CONVERSATION = `Human: Your Schrödinger equation is at the core of quantum mechanics. Can you explain its significance in simple terms?
Erwin Schrödinger: Of course. The Schrödinger equation is like the fundamental "recipe" for how quantum systems evolve over time. It helps us calculate the probability of finding a particle in different states, which was a big departure from classical physics.

Human: Your Schrödinger's cat paradox is quite famous. How did you come up with that thought experiment?
Erwin Schrödinger: Well, I wanted to illustrate the strange and counterintuitive aspects of quantum mechanics. The idea of a cat being both alive and dead at the same time when unobserved highlights the concept of superposition and the role of observation in quantum systems.

Human: That paradox has certainly captured the imagination of many. What do you think is the most exciting development in quantum mechanics since your time?
Erwin Schrödinger: The field has seen incredible advancements in areas like quantum computing and quantum cryptography. I'm particularly excited about the potential for quantum computers to solve complex problems that classical computers can't handle efficiently.
`;

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required.",
  }),
  description: z.string().min(1, {
    message: "Description is required.",
  }),
  instruction: z.string().min(200, {
    message: "Instruction requires at least 200 characters.",
  }),
  conversation: z.string().min(200, {
    message: "Conversation requires at least 200 characters.",
  }),
  avatarSrc: z.string().min(1, {
    message: "Image is required.",
  }),
});

interface BotFormProps {
  initialData: Bot | null;
}

export const BotForm = ({ initialData }: BotFormProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      instruction: "",
      conversation: "",
      avatarSrc: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        await axios.patch(`/api/bot/${initialData.id}`, values);
      } else {
        await axios.post("/api/bot", values);
      }
      toast({
        description: "Success.",
        duration: 3000,
      });
      router.refresh();
      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Something went wrong.",
        duration: 3000,
      });
    }
  };

  return (
    <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 pb-10"
        >
          <div className="space-y-2 w-full col-span-2">
            <div>
              <h3 className="text-lg font-medium">General Information</h3>
              <p className="text-sm text-muted-foreground">
                General information about your bot
              </p>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          <FormField
            name="avatarSrc"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center space-y-4 col-span-2">
                <FormControl>
                  <ImageUpload onChange={field.onChange} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Erwin Schrödinger"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is how your AI bot will be named.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Physicist"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Short description for your AI bot.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2 w-full">
            <div>
              <h3 className="text-lg font-medium">Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Detailed instructions for AI Behaviour
              </p>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          <FormField
            name="instruction"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instruction</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isLoading}
                    rows={7}
                    className="bg-background resize-none"
                    placeholder={DEFAULT_INSTRUCTION}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe in detail your bot&apos;s backstory and relevant
                  details.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="conversation"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Example Conversation</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isLoading}
                    rows={7}
                    className="bg-background resize-none"
                    placeholder={DEFAULT_CONVERSATION}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Write couple of examples of a human chatting with your AI bot,
                  write expected answers.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="w-full flex justify-center">
            <Button size="lg" disabled={isLoading}>
              {initialData ? "Edit your bot" : "Create your bot"}
              <Wand2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
